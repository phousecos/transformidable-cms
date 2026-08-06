// @ts-nocheck
import Link from "next/link";
import { fullDate, caseNo } from "./format";
import { renderLexical } from "./lexical";
import { GovernanceMap, deriveGraphFromCase } from "./GovernanceMap";

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

function Section({ id, label, children }: any) {
  return (
    <section className="case-section" id={id}>
      <h2 className="case-h">{label}</h2>
      {children}
    </section>
  );
}

export function CaseDossier({ caseFile: cf }: { caseFile: any }) {
  const overviewHtml = renderLexical(cf.overview);
  const timeline = has(cf.timeline) ? cf.timeline : [];
  const orgs = has(cf.organizations) ? cf.organizations : [];
  const graph = deriveGraphFromCase(cf);
  const documents = has(cf.documents) ? cf.documents : [];
  const audits = has(cf.auditReports) ? cf.auditReports : [];
  const news = has(cf.newsCoverage) ? cf.newsCoverage : [];
  const notes = (Array.isArray(cf.researchNotes) ? cf.researchNotes : []).filter((n: any) => n && typeof n === "object");
  const mechanisms = has(cf.governanceMechanisms) ? cf.governanceMechanisms : [];
  const lessons = has(cf.lessonsLearned) ? cf.lessonsLearned : [];
  const related = (Array.isArray(cf.relatedCases) ? cf.relatedCases : []).filter((r: any) => r && typeof r === "object");
  const pod = cf.podcastEpisode && typeof cf.podcastEpisode === "object" ? cf.podcastEpisode : null;
  const aiSummary = typeof cf.aiSummary === "string" ? cf.aiSummary.trim() : "";

  // Build the section table of contents from whatever the case actually has.
  const toc: { id: string; label: string }[] = [];
  if (overviewHtml) toc.push({ id: "overview", label: "Overview" });
  if (timeline.length) toc.push({ id: "timeline", label: "Timeline" });
  if (orgs.length) toc.push({ id: "organizations", label: "Organizations" });
  if (graph) toc.push({ id: "governance-map", label: "Governance Map" });
  if (documents.length) toc.push({ id: "documents", label: "Documents" });
  if (audits.length) toc.push({ id: "audit-reports", label: "Audit Reports" });
  if (news.length) toc.push({ id: "news-coverage", label: "News Coverage" });
  if (notes.length) toc.push({ id: "research-notes", label: "Research Notes" });
  if (mechanisms.length) toc.push({ id: "governance-mechanisms", label: "Governance Mechanisms" });
  if (pod) toc.push({ id: "podcast", label: "Podcast Episode" });
  if (aiSummary) toc.push({ id: "ai-summary", label: "AI Summary" });
  if (lessons.length) toc.push({ id: "lessons-learned", label: "Lessons Learned" });
  if (related.length) toc.push({ id: "related", label: "Related Cases" });

  if (toc.length === 0) {
    return (
      <div className="detail-wrap">
        <p className="detail-note">This case file is being assembled. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="case-layout">
      {toc.length > 1 && (
        <nav className="case-toc" aria-label="Case sections">
          <p className="case-toc-h">On this case</p>
          {toc.map((t) => <a key={t.id} href={`#${t.id}`}>{t.label}</a>)}
        </nav>
      )}

      <div className="case-content">
        {overviewHtml && (
          <Section id="overview" label="Overview">
            <div className="prose" style={{ marginTop: 0 }} dangerouslySetInnerHTML={{ __html: overviewHtml }} />
          </Section>
        )}

        {timeline.length > 0 && (
          <Section id="timeline" label="Timeline">
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
          </Section>
        )}

        {orgs.length > 0 && (
          <Section id="organizations" label="Organizations">
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
          </Section>
        )}

        {graph && (
          <Section id="governance-map" label="Governance Map">
            <GovernanceMap
              title={`Governance map — ${cf.title || "case"}`}
              caption="Each party wired to the governing body by role. Typed relationships are illustrative, pending case-specific mapping."
              nodes={graph.nodes}
              edges={graph.edges}
            />
          </Section>
        )}

        {documents.length > 0 && (
          <Section id="documents" label="Documents">
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
          </Section>
        )}

        {audits.length > 0 && (
          <Section id="audit-reports" label="Audit Reports">
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
          </Section>
        )}

        {news.length > 0 && (
          <Section id="news-coverage" label="News Coverage">
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
          </Section>
        )}

        {notes.length > 0 && (
          <Section id="research-notes" label="Research Notes">
            <div className="case-rows">
              {notes.map((nt: any) => (
                <Link className="case-row" href={`/research/notes/${nt.slug}`} key={nt.id}>
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

        {mechanisms.length > 0 && (
          <Section id="governance-mechanisms" label="Governance Mechanisms">
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
          </Section>
        )}

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

        {lessons.length > 0 && (
          <Section id="lessons-learned" label="Lessons Learned">
            <ol className="case-lessons">
              {lessons.map((l: any, i: number) => (
                <li key={i}>
                  <span className="case-lesson-t">{l.lesson}</span>
                  {l.detail && <p className="case-row-desc">{l.detail}</p>}
                </li>
              ))}
            </ol>
          </Section>
        )}

        {related.length > 0 && (
          <Section id="related" label="Related Cases">
            <div className="case-related">
              {related.map((r: any) => (
                <Link className="case-related-card" href={`/research/case-files/${r.slug}`} key={r.id}>
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
