// @ts-nocheck
import Link from "next/link";
import { ResearchShell } from "../components/research/ResearchShell";
import { Sky } from "../components/research/Sky";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About",
  description:
    "A research and advisory practice studying how governance, leadership, and institutional decision-making shape organizational resilience.",
};

const AGENDA = [
  ["Governance", "How do governance decisions influence organizational outcomes?"],
  ["Leadership", "What leadership behaviors enable successful transformation?"],
  ["Institutions", "Why do some organizations become resilient while others fail?"],
  ["Technology", "How should organizations govern emerging technologies?"],
  ["Evidence", "What can public failures teach us about better governance?"],
];

export default function AboutPage() {
  return (
    <ResearchShell>
      <section className="idx-hero tr-onsky">
        <Sky variant="about" />
        <div className="wrap idx-hero-in">
          <p className="kicker">About</p>
          <h1 className="idx-title">Governance decides whether transformation holds.</h1>
          <p className="idx-intro">
            Transformidable is a research and advisory practice. We study how governance, leadership,
            and institutional decision-making shape the success, resilience, and public trust of
            organizations navigating complex change.
          </p>
        </div>
      </section>

      <article className="detail">
        <div className="detail-wrap">
          <div className="prose" style={{ marginTop: 0 }}>
            <p>
              Most transformations do not fail for lack of technology or talent. They fail, or quietly
              revert, because of decisions made upstream: in the rooms where oversight, accountability,
              and authority are set. Those are governance decisions, and they are usually made long
              before the stress event that finally exposes them.
            </p>
            <p>
              Transformidable exists to study those decisions in the open. We trace, case by case, how
              governance and leadership shape whether an organization can carry change without breaking,
              and we turn what we learn into evidence that leaders and institutions can actually use,
              and that the legal system can rely on when a transformation is contested.
            </p>
            <p>
              The work is deliberately independent. It is not opinion, and it is not a sales pitch for a
              methodology. It is a standing body of evidence about the decisions that decide whether
              transformation holds.
            </p>
          </div>

          <section className="case-section" id="agenda">
            <h2 className="case-h">The research agenda</h2>
            <p className="body" style={{ marginBottom: 20 }}>
              Five questions organize the work. Each is pursued through primary case research, then
              published as case files, articles, and reports.
            </p>
            <div className="prose" style={{ marginTop: 0 }}>
              {AGENDA.map(([term, q]) => (
                <p key={term}><strong>{term}.</strong> {q}</p>
              ))}
            </div>
          </section>

          <section className="case-section" id="who">
            <h2 className="case-h">Who does the work</h2>
            <div className="prose" style={{ marginTop: 0 }}>
              <p>
                Transformidable is led by <strong>Jerri Bland, Ed.D.</strong> Her work sits at the
                intersection of governance, leadership, and organizational change, with particular
                attention to mission-driven institutions carrying high-stakes, systemwide transformations.
              </p>
              <p>
                She brings the discipline of a researcher and the vantage point of someone who has watched,
                up close, how decisions made in board and committee rooms decide whether change takes hold
                or unwinds. That vantage point, treating governance as the place where transformation
                is really won or lost, is the lens this research is built on.
              </p>
              <p>
                It is also what the work adds to the conversation. Transformation is usually discussed in
                the language of strategy, technology, or change management. Transformidable insists on the
                prior question: were the governance and leadership decisions sound enough to carry it? That
                question is often the difference between a transformation that endures and one that is
                studied, later, as a failure.
              </p>
            </div>
          </section>

          <div className="detail-foot" style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <Link className="btn" href="/#briefing">
              Subscribe to the Brief
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <Link className="link" href="/publications/case-files">Read the case files</Link>
          </div>
        </div>
      </article>
    </ResearchShell>
  );
}
