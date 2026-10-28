// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import {
  ACADEMY_DELIVERY,
  ACADEMY_PARTICIPANTS,
  ACADEMY_PROGRAMS,
  ACADEMY_SECTORS,
  ACADEMY_TIMEFRAMES,
} from "../../../../lib/academyOptions.ts";

const EMPTY = {
  name: "",
  email: "",
  jobTitle: "",
  organization: "",
  phone: "",
  sector: "",
  program: "foundation-certificate",
  participants: "",
  delivery: "",
  timeframe: "",
  message: "",
  company_website: "",
};

// Links can open a specific form: /academy#register-organization or
// /academy#register-individual.
const HASH_TYPES = { "#register-organization": "organization", "#register-individual": "individual" };

function Select({ id, label, value, onChange, options, optional = true }) {
  return (
    <>
      <label className="case-form-label" htmlFor={id}>
        {label} {optional && <span className="case-form-optional">(optional)</span>}
      </label>
      <select id={id} className="case-form-input ac-select" value={value} onChange={onChange} required={!optional}>
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </>
  );
}

// Two forms in one: organizations asking about a private cohort, and
// individuals joining the interest list. Organizational buyers need sizing and
// timing questions that would only get in an individual's way.
export function AcademyInquiryForm({ source, defaultType = "organization" }) {
  const [type, setType] = useState(defaultType);
  const [fields, setFields] = useState(EMPTY);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fromHash = () => {
      const t = HASH_TYPES[window.location.hash];
      if (t) setType(t);
    };
    // A link to the hash already in the URL fires no hashchange, so clicks on
    // those links are watched too.
    const fromClick = (e) => {
      const a = e.target.closest?.('a[href*="#register-"]');
      const t = a && HASH_TYPES[`#${a.getAttribute("href").split("#")[1]}`];
      if (t) setType(t);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    document.addEventListener("click", fromClick);
    return () => {
      window.removeEventListener("hashchange", fromHash);
      document.removeEventListener("click", fromClick);
    };
  }, []);

  const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));
  const isOrg = type === "organization";
  const idp = `ac-${type}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setFeedback("");
    try {
      const res = await fetch("/api/academy-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, type, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("success");
        setFeedback(data.message || "Thank you. We will be in touch.");
        setFields(EMPTY);
      } else {
        setStatus("error");
        setFeedback(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setFeedback("Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="ac-form-card">
        <div className="case-form-success" role="status" aria-live="polite">
          <p>{feedback}</p>
        </div>
        <button type="button" className="link" onClick={() => setStatus("idle")}>Submit another inquiry</button>
      </div>
    );
  }

  return (
    <div className="ac-form-card">
      <div className="case-form-toggle" role="group" aria-label="I am inquiring as">
        <button
          type="button"
          className={`case-form-toggle-btn${isOrg ? " is-active" : ""}`}
          aria-pressed={isOrg}
          onClick={() => setType("organization")}
        >
          For an organization
        </button>
        <button
          type="button"
          className={`case-form-toggle-btn${!isOrg ? " is-active" : ""}`}
          aria-pressed={!isOrg}
          onClick={() => setType("individual")}
        >
          For myself
        </button>
      </div>

      <h3 className="ac-form-h">{isOrg ? "Request a private cohort discussion" : "Join the interest list"}</h3>
      <p className="ac-form-sub">
        {isOrg
          ? "Tell us about your group and we will arrange a conversation about scope, format, and timing."
          : "Receive program announcements, upcoming dates, and enrollment information."}
      </p>

      <form className="case-form" onSubmit={handleSubmit} noValidate>
        {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
        <div className="ac-hp" aria-hidden="true">
          <label htmlFor={`${idp}-website`}>Company website</label>
          <input id={`${idp}-website`} type="text" tabIndex={-1} autoComplete="off" value={fields.company_website} onChange={set("company_website")} />
        </div>

        {isOrg && (
          <>
            <label className="case-form-label" htmlFor={`${idp}-org`}>Organization name</label>
            <input id={`${idp}-org`} className="case-form-input" type="text" required aria-required="true" autoComplete="organization" value={fields.organization} onChange={set("organization")} />
          </>
        )}

        <div className="ac-form-grid">
          <div>
            <label className="case-form-label" htmlFor={`${idp}-name`}>{isOrg ? "Contact name" : "Name"}</label>
            <input id={`${idp}-name`} className="case-form-input" type="text" required aria-required="true" autoComplete="name" value={fields.name} onChange={set("name")} />
          </div>
          <div>
            <label className="case-form-label" htmlFor={`${idp}-title`}>Title or role <span className="case-form-optional">(optional)</span></label>
            <input id={`${idp}-title`} className="case-form-input" type="text" autoComplete="organization-title" value={fields.jobTitle} onChange={set("jobTitle")} />
          </div>
          <div>
            <label className="case-form-label" htmlFor={`${idp}-email`}>{isOrg ? "Work email" : "Email"}</label>
            <input id={`${idp}-email`} className="case-form-input" type="email" required aria-required="true" autoComplete="email" value={fields.email} onChange={set("email")} />
          </div>
          {isOrg ? (
            <div>
              <label className="case-form-label" htmlFor={`${idp}-phone`}>Phone <span className="case-form-optional">(optional)</span></label>
              <input id={`${idp}-phone`} className="case-form-input" type="tel" autoComplete="tel" value={fields.phone} onChange={set("phone")} />
            </div>
          ) : (
            <div>
              <label className="case-form-label" htmlFor={`${idp}-org`}>Organization <span className="case-form-optional">(optional)</span></label>
              <input id={`${idp}-org`} className="case-form-input" type="text" autoComplete="organization" value={fields.organization} onChange={set("organization")} />
            </div>
          )}
          <div>
            <Select id={`${idp}-sector`} label="Sector" value={fields.sector} onChange={set("sector")} options={ACADEMY_SECTORS} />
          </div>
          <div>
            <Select id={`${idp}-program`} label="Program interest" value={fields.program} onChange={set("program")} options={ACADEMY_PROGRAMS} />
          </div>
          {isOrg && (
            <>
              <div>
                <Select id={`${idp}-participants`} label="Expected participants" value={fields.participants} onChange={set("participants")} options={ACADEMY_PARTICIPANTS} />
              </div>
              <div>
                <Select id={`${idp}-timeframe`} label="Preferred timing" value={fields.timeframe} onChange={set("timeframe")} options={ACADEMY_TIMEFRAMES} />
              </div>
            </>
          )}
          <div>
            <Select id={`${idp}-delivery`} label="Preferred delivery" value={fields.delivery} onChange={set("delivery")} options={ACADEMY_DELIVERY} />
          </div>
        </div>

        <label className="case-form-label" htmlFor={`${idp}-message`}>
          {isOrg ? "What would you like the program to address?" : "Anything you would like us to know?"} <span className="case-form-optional">(optional)</span>
        </label>
        <textarea id={`${idp}-message`} className="case-form-textarea" rows={4} value={fields.message} onChange={set("message")} />

        <div id={`${idp}-error`} role="alert" aria-live="assertive" className="case-form-msg">
          {status === "error" && feedback}
        </div>

        <button type="submit" className="btn ac-submit" disabled={status === "loading"} aria-busy={status === "loading"}>
          {status === "loading" ? "Sending…" : isOrg ? "Request a discussion" : "Register interest"}
        </button>
        <p className="ac-form-note">Registering interest is not enrollment and carries no financial commitment.</p>
      </form>
    </div>
  );
}
