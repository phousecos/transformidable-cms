// @ts-nocheck
"use client";
import { useState } from "react";

export function FollowCaseForm({ caseSlug }: { caseSlug: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/case-follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, caseSlug }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "You're now following this case.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="case-form-success" role="status" aria-live="polite">
        <p>{message}</p>
      </div>
    );
  }

  return (
    <form className="case-form" onSubmit={handleSubmit} noValidate>
      <label className="case-form-label" htmlFor="follow-email">Email</label>
      <div className="case-form-row">
        <input
          id="follow-email"
          type="email"
          required
          autoComplete="email"
          aria-required="true"
          aria-invalid={status === "error"}
          aria-describedby={status === "error" ? "follow-error" : undefined}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="case-form-input"
        />
        <button type="submit" className="case-form-btn" disabled={status === "loading"} aria-busy={status === "loading"}>
          {status === "loading" ? "Following…" : "Follow"}
        </button>
      </div>
      <div id="follow-error" role="alert" aria-live="assertive" className="case-form-msg">
        {status === "error" && message}
      </div>
    </form>
  );
}
