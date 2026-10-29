"use client";
// Campaign tags (?cohort= and utm_*) from inbound outreach links. They are
// kept for the browser session, so a visitor who lands on any page and later
// books a conversation still carries the tags into the booking.

export const INBOUND_KEYS = ["cohort", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

const STORAGE_KEY = "tr-inbound";
const MAX_LEN = 100;

export type Inbound = Partial<Record<(typeof INBOUND_KEYS)[number], string>>;

function stored(): Inbound {
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

// Tags on the current URL win over ones saved earlier in the session.
export function captureInbound(): Inbound {
  const params = new URLSearchParams(window.location.search);
  const found: Inbound = {};
  for (const key of INBOUND_KEYS) {
    const value = params.get(key)?.trim();
    if (value) found[key] = value.slice(0, MAX_LEN);
  }
  if (!Object.keys(found).length) return stored();
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found));
  } catch {}
  return found;
}
