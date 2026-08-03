// @ts-nocheck
"use client";
import { useState } from "react";
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
    label: "Publications", href: "/publications", children: [
      { no: "02.1", name: "The Governance Files", desc: "Our flagship long-form series", href: "/publications?type=governance-file" },
      { no: "02.2", name: "Articles", desc: "Shorter, argued pieces", href: "/publications?type=article" },
      { no: "02.3", name: "White Papers", desc: "Peer-reviewed depth", href: "/publications?type=white-paper" },
      { no: "02.4", name: "Annual Reports", desc: "The state of governance, yearly", href: "/publications?type=annual-report" },
    ],
  },
  { label: "Events", href: "/#events" },
  { label: "About", href: "/about" },
];

export function ResearchNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Utility bar */}
      <div className="utility">
        <div className="wrap utility-in">
          <span className="u-brand">Transformidable</span>
          <div className="u-links">
            <Link className="u-brief" href="/#briefing">The Governance Briefing</Link>
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
