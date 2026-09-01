// @ts-nocheck
import Link from "next/link";
import { fullDate, caseNo } from "./format";
import { renderLexical } from "./lexical";
import { GovernanceOutcomes, tallyOutcomes } from "./GovernanceOutcomes";

const ASSESSMENT: Record<string, string> = { strength: "Strength", weakness: "Weakness", observation: "Observation" };
const DOC_TYPES: Record<string, string> = {
  filing: "Filing", contract: "Contract", memo: "Memo", report: "Report",
  presentation: "Presentation", correspondence: "Correspondence", other: "Document",
};

function mediaUrl(m: any): string | null {
  return m && typeof m === "object" && typeof m.url === "string" ? m.url : null;
}
const has = (a: any) => Array.isArray(a) && a.length > 0;

const ExtLink = ({ href, children }: any) => (
  <a className="link" href={href} rel="noopener" target="_blank">{children}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
  </a>
);

function Section({ id, label, pending, children }: any) {
  return (
    <section className="case-section" id={id}>
      <h2 className="case-h">{label}{pending && <span className="case-pill case-pill--pending">Pending</span>}</h2>
      {children}
    </section>
  );
}

export function CaseDossier({ caseFile: cf }: { caseFile: any }) {
  const overviewHtml = renderLexical(cf.overview);
  const timeline = has(cf.timeline) ? cf.timeline : [];
  const orgs = has(cf.organizations) ? cf.organizations : [];
  const outcomes = tallyOutcomes(cf.governanceMechanisms);
  const documents = has(cf.documents) ? cf.documents : [];
  const audits = has(cf.auditReports) ? cf.auditReports : [];
  const news = has(cf.newsCoverage) ? cf.newsCoverage : [];
  const notes = (Array.isArray(cf.researchNotes) ? cf.researchNotes : []).filter((n: any) => n && typeof n === "object");
  const mechanisms = has(cf.governanceMechanisms) ? cf.governanceMechanisms : [];
  const lessons = has(cf.lessonsLearned) ? cf.lessonsLearned : [];
  const related = (Array.isArray(cf.relatedCases) ? cf.relatedCases : []).filter((r: any) => r && typeof r === "object");
  const pod = cf.podcastEpisode && typeof cf.podcastEpisode === "object" ? cf.podcastEpisode : null;
  const aiSummary = typeof cf.aiSummary === "string" ? cf.aiSummary.trim() : "";

  // Core dossier sections (mirroring the CMS admin tabs) always appear, showing
  // a "Pending" status when the case doesn't have that content yet. Genuinely
  // optional extras only show up once there's something to show.
  const toc: { id: string; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "timeline", label: "Timeline" },
    { id: "organizations", label: "Organizations" },
  ];
  if (outcomes.domains.length) toc.push({ id: "governance-outcomes", label: "Governance Outcomes" });
  toc.push({ id: "documents", label: "Documents" });
  toc.push({ id: "audit-reports", label: "Audit Reports" });
  toc.push({ id: "news-coverage", label: "News Coverage" });
  if (notes.length) toc.push({ id: "research-notes", label: "Research Notes" });
  toc.push({ id: "governance-mechanisms", label: "Governance Mechanisms" });
  if (pod) toc.push({ id: "podcast", label: "Podcast Episode" });
  if (aiSummary) toc.push({ id: "ai-summary", label: "AI Summary" });
  toc.push({ id: "lessons-learned", label: "Lessons Learned" });
  if (related.length) toc.push({ id: "related", label: "Related Cases" });

  return (
    <div className="case-layout">
      <nav className="case-toc" aria-label="Case sections">
        <p className="case-toc-h">On this case</p>
        {toc.map((t) => <a key={t.id} href={`#${t.id}`}>{t.label}</a>)}
      </nav>

      <div className="case-content">
        <Section id="overview" label="Overview" pending={!overviewHtml}>
          {overviewHtml ? (
            <div className="prose" style={{ marginTop: 0 }} dangerouslySetInnerHTML={{ __html: overviewHtml }} />
          ) : (
            <p className="case-pending-note">Overview not yet available.</p>
          )}
        </Section>

        <Section id="timeline" label="Timeline" pending={timeline.length === 0}>
          {timeline.length > 0 ? (
            <>
              {cf.timelineLabel && <p className="case-cap">{cf.timelineLabel}</p>}
              <div className="exhibit" style={{ marginTop: cf.timelineLabel ? 14 : 0 }}>
                <div className="exhibit-body">
                  <div className="timeline">
                    {timeline.map((row: any, i: number) => (
                      <div className="tl-row" key={i}>
                        <span className="tl-time">{row.time}</span>
                        <span className="tl-mark"><span className={`tl-dot${row.keyMoment ? " key" : ""}`} /><span className="tl-line" /></span>
                        <div className="tl-body">
                          <div className="t">{row.title}</div>
                          {row.description && <div className="d">{row.description}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="case-pending-note">Timeline not yet available.</p>
          )}
        </Section>

        <Section id="organizations" label="Organizations" pending={orgs.length === 0}>
          {orgs.length > 0 ? (
            <div className="case-rows">
              {orgs.map((o: any, i: number) => (
                <div className="case-row" key={i}>
                  <div className="case-row-main">
                    <div className="case-row-title">{o.name}{o.role && <span className="case-pill">{o.role}</span>}</div>
                    {o.description && <p className="case-row-desc">{o.description}</p>}
                  </div>
                  {o.url && <ExtLink href={o.url}>Visit</ExtLink>}
                </div>
              ))}
            </div>
          ) : (
            <p className="case-pending-note">Organizations not yet documented.</p>
          )}
        </Section>

        {outcomes.domains.length > 0 && (
          <Section id="governance-outcomes" label="Governance Outcomes">
            <GovernanceOutcomes
              mechanisms={cf.governanceMechanisms}
              caption="Bar length is how many findings were coded to that domain, not a share of a fixed width — a domain with two findings reads as two findings, and the figure at the end of each bar is that count. Domains with no coded findings are omitted."
            />
          </Section>
        )}

        <Section id="documents" label="Documents" pending={documents.length === 0}>
          {documents.length > 0 ? (
            <div className="case-rows">
              {documents.map((d: any, i: number) => {
                const href = d.url || mediaUrl(d.file);
                return (
                  <div className="case-row" key={i}>
                    <div className="case-row-main">
                      <div className="case-row-title">{d.title}
                        {d.docType && <span className="case-pill">{DOC_TYPES[d.docType] || "Document"}</span>}
                      </div>
                      {d.description && <p className="case-row-desc">{d.description}</p>}
                      {d.date && <span className="case-row-meta">{fullDate(d.date)}</span>}
                    </div>
                    {href && <ExtLink href={href}>Open</ExtLink>}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="case-pending-note">No documents added yet.</p>
          )}
        </Section>

        <Section id="audit-reports" label="Audit Reports" pending={audits.length === 0}>
          {audits.length > 0 ? (
            <div className="case-rows">
              {audits.map((a: any, i: number) => {
                const href = a.url || mediaUrl(a.file);
                return (
                  <div className="case-row" key={i}>
                    <div className="case-row-main">
                      <div className="case-row-title">{a.title}</div>
                      {(a.auditor || a.date) && (
                        <span className="case-row-meta">{[a.auditor, a.date && fullDate(a.date)].filter(Boolean).join(" · ")}</span>
                      )}
                      {a.summary && <p className="case-row-desc">{a.summary}</p>}
                    </div>
                    {href && <ExtLink href={href}>Read</ExtLink>}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="case-pending-note">No audit reports added yet.</p>
          )}
        </Section>

        <Section id="news-coverage" label="News Coverage" pending={news.length === 0}>
          {news.length > 0 ? (
            <div className="case-rows">
              {news.map((n: any, i: number) => (
                <div className="case-row" key={i}>
                  <div className="case-row-main">
                    <div className="case-row-title">{n.headline}</div>
                    {(n.outlet || n.date) && (
                      <span className="case-row-meta">{[n.outlet, n.date && fullDate(n.date)].filter(Boolean).join(" · ")}</span>
                    )}
                    {n.excerpt && <p className="case-row-desc">{n.excerpt}</p>}
                  </div>
                  {n.url && <ExtLink href={n.url}>Read</ExtLink>}
                </div>
              ))}
            </div>
          ) : (
            <p className="case-pending-note">No news coverage added yet.</p>
          )}
        </Section>

        {notes.length > 0 && (
          <Section id="research-notes" label="Research Notes">
            <div className="case-rows">
              {notes.map((nt: any) => (
                <Link className="case-row" href={`/publications/research-notes/${nt.slug}`} key={nt.id}>
                  <div className="case-row-main">
                    <div className="case-row-title">{nt.title}</div>
                    {nt.dek && <p className="case-row-desc">{nt.dek}</p>}
                    {nt.publishedAt && <span className="case-row-meta">{fullDate(nt.publishedAt)}</span>}
                  </div>
                  <span className="link" aria-hidden="true">Read
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </span>
                </Link>
              ))}
            </div>
          </Section>
        )}

        <Section id="governance-mechanisms" label="Governance Mechanisms" pending={mechanisms.length === 0}>
          {mechanisms.length > 0 ? (
            <div className="case-rows">
              {mechanisms.map((m: any, i: number) => (
                <div className="case-row" key={i}>
                  <div className="case-row-main">
                    <div className="case-row-title">{m.name}
                      {m.assessment && <span className={`case-pill case-pill--${m.assessment}`}>{ASSESSMENT[m.assessment]}</span>}
                    </div>
                    {m.description && <p className="case-row-desc">{m.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="case-pending-note">Governance mechanisms not yet documented.</p>
          )}
        </Section>

        {pod && (
          <Section id="podcast" label="Podcast Episode">
            <Link className="case-podcast" href="/podcast">
              <span className="case-podcast-play">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
              </span>
              <span>
                <span className="case-podcast-t">{pod.title}</span>
                {pod.episodeNumber != null && <span className="case-row-meta">Episode {pod.episodeNumber}</span>}
              </span>
            </Link>
          </Section>
        )}

        {aiSummary && (
          <Section id="ai-summary" label="AI Summary">
            <div className="case-ai">
              <span className="case-ai-badge">AI-generated</span>
              {aiSummary.split(/\n{2,}/).map((para: string, i: number) => <p key={i}>{para}</p>)}
            </div>
          </Section>
        )}

        <Section id="lessons-learned" label="Lessons Learned" pending={lessons.length === 0}>
          {lessons.length > 0 ? (
            <ol className="case-lessons">
              {lessons.map((l: any, i: number) => (
                <li key={i}>
                  <span className="case-lesson-t">{l.lesson}</span>
                  {l.detail && <p className="case-row-desc">{l.detail}</p>}
                </li>
              ))}
            </ol>
          ) : (
            <p className="case-pending-note">Lessons learned not yet documented.</p>
          )}
        </Section>

        {related.length > 0 && (
          <Section id="related" label="Related Cases">
            <div className="case-related">
              {related.map((r: any) => (
                <Link className="case-related-card" href={`/publications/case-files/${r.slug}`} key={r.id}>
                  <span className="cn">Case File {caseNo(r.caseNumber)}</span>
                  <span className="case-related-t">{r.title}</span>
                </Link>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
