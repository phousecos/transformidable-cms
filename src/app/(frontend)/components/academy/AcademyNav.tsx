// @ts-nocheck
"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { label: "Courses", href: "/academy" },
  { label: "Certificate", href: "/academy/foundation-certificate" },
  { label: "For Organizations", href: "/academy/organizations" },
  { label: "For Individuals", href: "/academy/individuals" },
  { label: "FAQ", href: "/academy/faq" },
];

// The Academy's own menu, shown under the site masthead on every Academy page
// so the section reads as a place to browse courses.
export function AcademyNav() {
  const path = usePathname();
  const listRef = useRef(null);
  // On narrow screens the menu scrolls sideways; keep the current page in view.
  useEffect(() => {
    listRef.current?.querySelector(".is-active")?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [path]);
  const isActive = (href) =>
    href === "/academy" ? path === "/academy" || path.startsWith("/academy/courses") : path.startsWith(href);
  return (
    <nav className="ac-subnav" aria-label="Academy">
      <div className="wrap ac-subnav-in">
        <Link className="ac-subnav-brand" href="/academy">Transformidable Academy</Link>
        <div className="ac-subnav-links" ref={listRef}>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={isActive(l.href) ? "is-active" : undefined} aria-current={isActive(l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

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
