// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const Chevron = () => (
  <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
);
const ArrowRight = ({ s = 13 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

// Nav model mirrors the site information architecture.
const NAV = [
  {
    label: "Research", href: "/research/case-files", children: [
      { no: "01.1", name: "Case Files", desc: "Anatomies of real governance decisions", href: "/research/case-files" },
      { no: "01.2", name: "Research Notes", desc: "Working findings, in progress", href: "/research/notes" },
    ],
  },
  {
    // Publications is the written work; the episodic media series live under
    // Briefings below.
    label: "Publications", href: "/publications", children: [
      { no: "02.1", name: "Articles", desc: "Shorter, argued pieces", href: "/publications?type=article" },
      { no: "02.2", name: "White Papers", desc: "Peer-reviewed depth", href: "/publications?type=white-paper" },
      { no: "02.3", name: "Annual Reports", desc: "The state of governance, yearly", href: "/publications?type=annual-report" },
    ],
  },
  {
    // Episodic media you watch or listen to.
    label: "Briefings", href: "/podcast", children: [
      { no: "03.1", name: "The Governance Files", desc: "The podcast — governance decisions on the record", href: "/podcast" },
      { no: "03.2", name: "The Transformidable Brief", desc: "Mixed-media briefings — video & articles", href: "/publications?type=transformidable-brief" },
    ],
  },
  // Tools (Governance Analytics / Benchmarks) is not built yet — hidden from
  // the nav until it ships. The homepage still shows it as "Coming Soon".
  { label: "Events", href: "/#events" },
  { label: "About", href: "/about" },
];

export function ResearchNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleTheme = () => {
    const root = document.documentElement;
    let current = root.getAttribute("data-theme");
    if (!current) {
      current = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { window.localStorage.setItem("tr-theme", next); } catch {}
  };

  // Apply a saved preference on mount (no-op if none saved).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("tr-theme");
      if (saved === "dark" || saved === "light") {
        document.documentElement.setAttribute("data-theme", saved);
      }
    } catch {}
  }, []);

  return (
    <>
      {/* Utility bar */}
      <div className="utility">
        <div className="wrap utility-in">
          <span className="u-brand">Transformidable</span>
          <div className="u-links">
            <Link className="u-brief" href="/publications?type=transformidable-brief">The Transformidable Brief</Link>
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle light and dark theme">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Masthead */}
      <header className="masthead">
        <div className="wrap masthead-in">
          <Link className="wordmark" href="/" aria-label="Transformidable — home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brandlogo" src="/logo-new.png" alt="Transformidable" width={240} height={60} />
          </Link>

          <nav className="primary" aria-label="Primary">
            {NAV.map((item) => (
              <div className="nav-item" key={item.label}>
                <Link href={item.href}>{item.label}{item.children && <Chevron />}</Link>
                {item.children && (
                  <div className="mega" role="menu">
                    {item.children.map((c) => (
                      <Link href={c.href} key={c.name} role="menuitem">
                        <span className="m-no">{c.no}</span>
                        <span><span className="m-name">{c.name}</span><span className="m-desc">{c.desc}</span></span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <button className="burger" aria-expanded={mobileOpen} aria-controls="tr-mobile-menu" aria-label="Menu" onClick={() => setMobileOpen((v) => !v)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`mobile-menu${mobileOpen ? " is-open" : ""}`} id="tr-mobile-menu">
          <div className="wrap">
            {NAV.map((item) => (
              <div key={item.label}>
                <Link href={item.href} onClick={() => setMobileOpen(false)}>{item.label}</Link>
                {item.children?.map((c) => (
                  <Link className="mm-sub" href={c.href} key={c.name} onClick={() => setMobileOpen(false)}>{c.name}</Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </header>
    </>
  );
}

export function ResearchSubscribe() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "research-homepage" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setState("done");
        setMessage(data.message || "Thanks. You are subscribed.");
        setEmail("");
      } else {
        setState("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <form className="subscribe" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="tr-email">Email address</label>
      <input id="tr-email" type="email" name="email" placeholder="you@institution.org" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <button className="btn" type="submit" disabled={state === "sending"}>{state === "sending" ? "Joining…" : "Subscribe"}</button>
      {message && (
        <p role="status" style={{ flexBasis: "100%", margin: "4px 0 0", fontSize: 12, color: state === "error" ? "#fff" : "var(--on-wine)" }}>{message}</p>
      )}
    </form>
  );
}

export { ArrowRight };
