// @ts-nocheck
import Link from "next/link";

const ArrowRight = ({ s = 13 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

const TYPE_LABELS: Record<string, string> = {
  "governance-file": "Governance File",
  "article": "Article",
  "white-paper": "White Paper",
  "annual-report": "Annual Report",
};

function monthYear(d: any): string {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function caseNo(n: any): string {
  if (n == null) return "";
  return `No. ${String(n).padStart(3, "0")}`;
}

// ── Latest Publications ──────────────────────────────────────────────────
export function PublicationsList({ publications = [] }: { publications?: any[] }) {
  return (
    <div>
      <div className="sec-head" style={{ marginBottom: 28 }}>
        <div><p className="kicker">Latest publications</p></div>
        <Link className="link" href="/publications">All publications <ArrowRight /></Link>
      </div>

      {publications.length === 0 ? (
        <p className="empty">Publications will appear here as they are released.</p>
      ) : (
        publications.map((p) => {
          const label = TYPE_LABELS[p.type] || "Publication";
          const meta: string[] = [];
          if (p.type === "governance-file") meta.push("The Governance Files");
          if (p.seriesLabel) meta.push(p.seriesLabel);
          if (p.peerReviewed) meta.push("Peer-reviewed");
          if (p.pageCount) meta.push(`${p.pageCount} pp`);
          if (p.readTime) meta.push(`${p.readTime} min`);
          const dateLabel = monthYear(p.publishedAt);
          if (dateLabel && (p.type === "annual-report" || meta.length === 0)) meta.push(dateLabel);

          const href = p.assetUrl || `/publications/${p.slug}`;
          const external = typeof href === "string" && href.startsWith("http");

          return (
            <article className="pub" key={p.id}>
              <span className="p-type">{label}</span>
              <div>
                {external ? (
                  <a className="p-link" href={href} rel="noopener" target="_blank">
                    <h4>{p.title}</h4>
                  </a>
                ) : (
                  <Link className="p-link" href={href}><h4>{p.title}</h4></Link>
                )}
                {p.dek && <p className="p-desc">{p.dek}</p>}
                {meta.length > 0 && <span className="p-meta">{meta.join(" · ")}</span>}
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}

// ── Case Files feature ───────────────────────────────────────────────────
export function CaseFilesFeature({ caseFiles = [] }: { caseFiles?: any[] }) {
  const featured = caseFiles[0] || null;
  const rest = caseFiles.slice(1, 4);

  if (!featured) {
    return (
      <div className="wrap">
        <div className="sec-head">
          <div><p className="kicker">Case Files</p><h2 className="h">From the field.</h2></div>
        </div>
        <p className="empty">Case files will appear here as the research is published.</p>
      </div>
    );
  }

  const meta = [
    { l: "Sector", v: featured.sector },
    { l: "Method", v: featured.method },
    { l: "Reading", v: featured.readTime ? `${featured.readTime} min` : null },
  ].filter((m) => m.v);

  const exhibit = Array.isArray(featured.exhibit) ? featured.exhibit : [];
  const href = `/research/case-files/${featured.slug}`;

  return (
    <div className="wrap">
      <div className="cf-grid">
        <div className="cf-copy">
          <p className="kicker">Case File {caseNo(featured.caseNumber)} · From the field</p>
          <h3>{featured.title}</h3>
          {featured.dek && <p className="body">{featured.dek}</p>}
          {meta.length > 0 && (
            <div className="cf-meta">
              {meta.map((m) => (
                <div key={m.l}><div className="l">{m.l}</div><div className="v">{m.v}</div></div>
              ))}
            </div>
          )}
          <Link className="link" href={href}>Read the case file <ArrowRight /></Link>
        </div>

        {exhibit.length > 0 && (
          <figure className="exhibit" style={{ margin: 0 }}>
            <div className="exhibit-head">
              <span className="figlabel">Exhibit A</span>
              {featured.exhibitLabel && <span className="e-t">{featured.exhibitLabel}</span>}
            </div>
            <div className="exhibit-body">
              <div className="timeline">
                {exhibit.map((row: any, i: number) => (
                  <div className="tl-row" key={i}>
                    <span className="tl-time">{row.time}</span>
                    <span className="tl-mark">
                      <span className={`tl-dot${row.keyMoment ? " key" : ""}`} />
                      <span className="tl-line" />
                    </span>
                    <div className="tl-body">
                      <div className="t">{row.title}</div>
                      {row.detail && <div className="d">{row.detail}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </figure>
        )}
      </div>

      {rest.length > 0 && (
        <div className="cf-list">
          {rest.map((cf) => (
            <Link className="cf-list-item" href={`/research/case-files/${cf.slug}`} key={cf.id}>
              <span className="n">{caseNo(cf.caseNumber)}</span>
              <span className="t">{cf.title}{cf.dek && <span className="d">{cf.dek}</span>}</span>
              <span className="m">{cf.sector || (cf.readTime ? `${cf.readTime} min` : "")}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
