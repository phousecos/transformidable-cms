// @ts-nocheck
import Link from "next/link";
import { ResearchShell } from "../../components/research/ResearchShell";
import { Sky } from "../../components/research/Sky";
import { MechanismExplorer } from "../../components/research/MechanismExplorer";

export const metadata = {
  title: "Mechanism Explorer",
  description:
    "Explore the ten governance domains from the Technology Governance Codebook: definitions, core questions, and what each one covers.",
};

export default function MechanismExplorerPage() {
  return (
    <ResearchShell>
      <section className="idx-hero tr-onsky">
        <Sky variant="tools" />
        <div className="wrap idx-hero-in">
          <p className="kicker">Tools · Mechanism Explorer</p>
          <h1 className="idx-title">Mechanism Explorer</h1>
          <p className="idx-intro">
            The ten governance domains from the Technology Governance Codebook. Select one to see
            its definition, the question it asks, and what it covers.
          </p>
        </div>
      </section>

      <article className="detail">
        <div className="detail-wrap">
          <MechanismExplorer />

          <div className="detail-foot" style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", marginTop: 40 }}>
            <Link className="btn" href="/tools/governance-codebook">
              Read the full Codebook
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <Link className="link" href="/publications/case-files">See it applied in the case files</Link>
          </div>
        </div>
      </article>
    </ResearchShell>
  );
}
