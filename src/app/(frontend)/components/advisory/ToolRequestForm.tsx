// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import { captureInbound } from "./inbound";

// Name and email, then the download. The link comes back from the server
// signed and expiring, so it can't be shared on to skip the form for long.
export function ToolRequestForm({ slug, title }: { slug: string; title: string }) {
  const [fields, setFields] = useState({ name: "", email: "", organization: "", joinBrief: true, company_website: "" });
  const [inbound, setInbound] = useState({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  useEffect(() => {
    setInbound(captureInbound());
  }, []);

  const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (state === "sending") return;
    if (!fields.name.trim() || !fields.email.trim()) {
      setState("error");
      setMessage("Please add your name and email.");
      return;
    }
    setState("sending");
    setMessage("");
    try {
      const res = await fetch("/api/advisory-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, ...fields, inbound }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
        setState("done");
        window.location.assign(data.downloadUrl);
      } else {
        setState("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  if (state === "done") {
    return (
      <div className="av-card">
        <div className="case-form-success" role="status" aria-live="polite">
          <p>Thank you. Your download of {title} should start now.</p>
        </div>
        <p className="av-note">
          If it doesn&rsquo;t, <a className="link" href={downloadUrl}>download it here</a>. The link works for seven days.
        </p>
      </div>
    );
  }

  return (
    <div className="av-card">
      <h2>Download</h2>
      <p>Tell us who you are and the download starts right away.</p>
      <form className="case-form av-form" onSubmit={onSubmit} noValidate>
        {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
        <div className="av-hp" aria-hidden="true">
          <label htmlFor="tool-website">Company website</label>
          <input id="tool-website" type="text" tabIndex={-1} autoComplete="off" value={fields.company_website} onChange={set("company_website")} />
        </div>
        <div className="av-form-grid">
          <div>
            <label className="case-form-label" htmlFor="tool-name">Name</label>
            <input id="tool-name" className="case-form-input" type="text" required aria-required="true" autoComplete="name" value={fields.name} onChange={set("name")} />
          </div>
          <div>
            <label className="case-form-label" htmlFor="tool-email">Work email</label>
            <input id="tool-email" className="case-form-input" type="email" required aria-required="true" autoComplete="email" value={fields.email} onChange={set("email")} />
          </div>
        </div>
        <label className="case-form-label" htmlFor="tool-org">Organization <span className="case-form-optional">(optional)</span></label>
        <input id="tool-org" className="case-form-input" type="text" autoComplete="organization" value={fields.organization} onChange={set("organization")} />
        <label className="av-check">
          <input type="checkbox" checked={fields.joinBrief} onChange={set("joinBrief")} />
          <span>Also send me the Transformidable Brief: research, case files, and briefings by email.</span>
        </label>
        <div role="alert" aria-live="assertive" className="case-form-msg">{state === "error" && message}</div>
        <button type="submit" className="case-form-btn" disabled={state === "sending"} aria-busy={state === "sending"}>
          {state === "sending" ? "Preparing…" : "Download"}
        </button>
      </form>
    </div>
  );
}
