// @ts-nocheck
import Link from "next/link";
import { ResearchSubscribe } from "./ResearchNav";

export function ResearchFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer-top">
        <p className="kicker">The Governance Briefing</p>
        <p className="footer-mission">
          <em>Transformidable</em>. Capable of sustained transformation through effective
          governance, leadership, and institutional resilience.
        </p>
        <ResearchSubscribe />
      </div>

      <div className="wrap footer-cols">
        <div className="fcol brand">
          <Link className="fw" href="/" aria-label="Transformidable — home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brandlogo" src="/logo-new.png" alt="Transformidable" width={240} height={60} />
          </Link>
          <p>Independent research and advisory on governance, leadership, and institutional resilience.</p>
        </div>
        <div className="fcol">
          <h5>Research</h5>
          <Link href="/research/case-files">Case Files</Link>
          <Link href="/research/notes">Research Notes</Link>
          <Link href="/research/data">Data</Link>
          <Link href="/research/methodology">Methodology</Link>
        </div>
        <div className="fcol">
          <h5>Publications</h5>
          <Link href="/publications?type=governance-file">The Governance Files</Link>
          <Link href="/publications?type=article">Articles</Link>
          <Link href="/publications?type=white-paper">White Papers</Link>
          <Link href="/publications?type=annual-report">Annual Reports</Link>
        </div>
        <div className="fcol">
          <h5>Explore</h5>
          <Link href="/events">Events</Link>
          <Link href="/about">About</Link>
        </div>
      </div>

      <div className="wrap footer-legal">
        <span>&copy; 2026 Transformidable &middot; All rights reserved</span>
        <span>Set in Source Serif &amp; Archivo</span>
      </div>
    </footer>
  );
}
