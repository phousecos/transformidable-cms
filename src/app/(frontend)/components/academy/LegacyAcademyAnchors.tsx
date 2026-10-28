// @ts-nocheck
"use client";
import { useEffect } from "react";

// Links published before the audience pages existed pointed at anchors on
// /academy. Send them to where that content lives now.
const LEGACY = {
  "#register-organization": "/academy/organizations#register",
  "#cohorts": "/academy/organizations",
  "#register-individual": "/academy/individuals#register",
  "#register": "/academy/individuals#register",
  "#faq": "/academy/faq",
  "#programs": "/academy#courses",
};

export function LegacyAcademyAnchors() {
  useEffect(() => {
    const to = LEGACY[window.location.hash];
    if (to && to !== window.location.pathname + window.location.hash) window.location.replace(to);
  }, []);
  return null;
}
