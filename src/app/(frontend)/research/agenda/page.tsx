// @ts-nocheck
import Link from "next/link";
import { ResearchShell } from "../../components/research/ResearchShell";
import { Sky } from "../../components/research/Sky";

export const metadata = {
  title: "Research Agenda",
  description:
    "Five questions organize Transformidable's research: governance, leadership, institutions, technology, and evidence.",
};

const THREADS = [
  {
    term: "Governance",
    question: "How do governance decisions influence organizational outcomes?",
    body: "Outcomes are usually traced back to strategy, technology, or an individual's failure. This thread traces them further back, to the decisions, and the decision rights, that actually produced them: who had authority, who was accountable, and what happened when the two didn't line up.",
  },
  {
    term: "Leadership",
    question: "What leadership behaviors enable successful transformation?",
    body: "Transformation is announced far more often than it is sustained. This thread studies the observable behaviors, not the stated intentions, that move change from a plan on paper to something an organization actually carries through.",
  },
  {
    term: "Institutions",
    question: "Why do some organizations become resilient while others fail?",
    body: "Resilience is rarely visible until it's tested. This thread studies what resilient organizations built before the stress event arrived, and what was missing in the ones that didn't hold.",
  },
  {
    term: "Technology",
    question: "How is technology actually governed, independent of outcome?",
    body: "This is the thread with a published research instrument: the Technology Governance Codebook, an outcome-neutral framework for coding how authority, oversight, risk, and accountability actually operate around technology decisions, regardless of whether the initiative ultimately succeeded or failed.",
    cta: { label: "Read the Codebook", href: "/tools/governance-codebook" },
  },
  {
    term: "Evidence",
    question: "What can public failures teach us about better governance?",
    body: "Litigation, audits, and public records document governance decisions more candidly than most organizations ever will voluntarily. This thread reads that public record for lessons that transfer to organizations that haven't yet been tested.",
  },
];

export default function ResearchAgendaPage() {
  return (
    <ResearchShell>
      <section className="idx-hero tr-onsky">
        <Sky variant="research" />
        <div className="wrap idx-hero-in">
          <p className="kicker">Research · Agenda</p>
          <h1 className="idx-title">The Research Agenda</h1>
          <p className="idx-intro">
            Five questions organize the work. Each is pursued through primary case research, then
            published as case files, articles, and reports.
          </p>
        </div>
      </section>

      <article className="detail">
        <div className="detail-wrap">
          {THREADS.map((t, i) => (
            <section
              key={t.term}
              className="case-section"
              style={i === 0 ? { marginTop: 0, paddingTop: 0, borderTop: "none" } : undefined}
            >
              <h2 className="case-h">{t.term}</h2>
              <div className="prose" style={{ marginTop: 0 }}>
                <blockquote>{t.question}</blockquote>
                <p>{t.body}</p>
                {t.cta && (
                  <p><Link className="link" href={t.cta.href}>{t.cta.label}</Link></p>
                )}
              </div>
            </section>
          ))}

          <div className="detail-foot" style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <Link className="btn" href="/publications/case-files">
              Read the case files
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <Link className="link" href="/about">About the research</Link>
          </div>
        </div>
      </article>
    </ResearchShell>
  );
}
