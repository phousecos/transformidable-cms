// @ts-nocheck
import Link from "next/link";
import { ResearchSubscribe } from "./ResearchNav";

export function ResearchFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer-top" id="briefing">
        <p className="kicker">The Transformidable Brief</p>
        <p className="footer-mission">
          <em>Transformidable</em>. Capable of sustained transformation through effective
          governance, leadership, and institutional resilience.
        </p>
        <ResearchSubscribe />
      </div>

      <div className="wrap footer-cols">
        <div className="fcol brand">
          <Link className="fw" href="/" aria-label="Transformidable, home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brandlogo" src="/logo-new.png" alt="Transformidable" width={240} height={60} />
          </Link>
          <p>Independent research and advisory on governance, leadership, and institutional resilience.</p>
        </div>
        <div className="fcol">
          <h5>Research</h5>
          <Link href="/research/agenda">Research Agenda</Link>
          <Link href="/research/methodology">Methodology</Link>
          <Link href="/research/governance-mechanisms">Governance Mechanisms</Link>
          <Link href="/research/datasets">Datasets</Link>
          <Link href="/research/projects">Research Projects</Link>
        </div>
        <div className="fcol">
          <h5>Publications</h5>
          <Link href="/publications/case-files">Case Files</Link>
          <Link href="/publications?type=article">Articles</Link>
          <Link href="/publications?type=white-paper">White Papers</Link>
          <Link href="/publications/research-notes">Research Notes</Link>
          <Link href="/publications?type=annual-report">Annual Reports</Link>
        </div>
        <div className="fcol">
          <h5>Briefings</h5>
          <Link href="/podcast">The Governance Files</Link>
          <Link href="/publications?type=transformidable-brief">Transformidable Briefing</Link>
          <Link href="/briefings/webinars">Webinar Archive</Link>
          <Link href="/briefings/live">Live Sessions</Link>
        </div>
        <div className="fcol">
          <h5>Tools</h5>
          <Link href="/tools/governance-codebook">Governance Codebook</Link>
          <Link href="/tools/mechanism-explorer">Mechanism Explorer</Link>
          <Link href="/tools/governance-watch">Governance Watch</Link>
          <Link href="/tools/assessments">Assessment Tools</Link>
          <Link href="/tools/benchmarks">Benchmarks</Link>
          <Link href="/tools/risk-models">Risk Models</Link>
        </div>
      </div>

      <div className="wrap footer-legal">
        <span>&copy; 2026 Transformidable &middot; All rights reserved</span>
        <span className="footer-legal-links">
          <Link href="/#events">Events</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </span>
        <span>Set in Source Serif &amp; Archivo</span>
      </div>
    </footer>
  );
}
