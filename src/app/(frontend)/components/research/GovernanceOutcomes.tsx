// @ts-nocheck
/**
 * GovernanceOutcomes — a case file's coded findings, by codebook domain.
 *
 * Answers Question 2 of the method ("did it work in practice?") for each of the
 * G1-G10 governance domains. Every governance mechanism coded with both a
 * `domain` and an `outcome` becomes one finding; the chart is the tally.
 *
 * This replaced a node-link "governance map" that derived its edges by regex
 * over each organization's free-text role and wired everything to one hub. That
 * drawing was hub-and-spoke by construction and showed inferred relationships in
 * the same visual language as evidence. This shows only what an author coded.
 *
 * Encoding notes, since they are deliberate:
 *
 * - Bars are scaled by COUNT against the busiest domain, not stretched to equal
 *   width. With a handful of findings per domain, a full-width bar reading
 *   "100% fell short" off n=2 overstates the evidence; bar length here is how
 *   much evidence there is, and the segments are its composition. Pass
 *   scale="share" for equal-width 100% bars if the comparison matters more.
 * - "Not enough evidence" is absence of a finding rather than a fourth verdict,
 *   so it is hatched and grey — and hatching is also what keeps it separable
 *   from "fell short" for red-blind readers, where the two hues converge.
 * - Outcome colors are a fixed status scale (good/warning/serious), stepped
 *   separately for light and dark and validated for CVD separation and contrast
 *   against each surface. They are reserved: don't reuse them for anything else.
 */
import { DOMAINS } from "./governanceDomains";

// Fixed severity order. Also the stacking order, the legend order, and the
// column order in the table view — one order everywhere, so a segment's
// position carries meaning alongside its color.
export const OUTCOMES = [
  { value: "worked", label: "Worked as intended", cls: "go-seg--worked" },
  { value: "limited", label: "Worked, with limits", cls: "go-seg--limited" },
  { value: "fell-short", label: "Fell short", cls: "go-seg--fell-short" },
  { value: "insufficient", label: "Not enough evidence", cls: "go-seg--insufficient" },
];

const OUTCOME_VALUES = new Set(OUTCOMES.map((o) => o.value));
const DOMAIN_ORDER = new Map(DOMAINS.map((d, i) => [d.code, i]));

/**
 * Tally coded findings by domain.
 *
 * Only rows carrying BOTH a known domain and a known outcome are charted; the
 * rest are returned as `uncoded` so the page can say so rather than quietly
 * charting a subset and implying it is the whole.
 */
export function tallyOutcomes(mechanisms) {
  const rows = Array.isArray(mechanisms) ? mechanisms : [];
  const byDomain = new Map();
  let coded = 0;
  let uncoded = 0;

  for (const m of rows) {
    if (!m || typeof m !== "object") continue;
    const domain = typeof m.domain === "string" ? m.domain : null;
    const outcome = typeof m.outcome === "string" ? m.outcome : null;
    if (!domain || !DOMAIN_ORDER.has(domain) || !outcome || !OUTCOME_VALUES.has(outcome)) {
      uncoded += 1;
      continue;
    }
    if (!byDomain.has(domain)) byDomain.set(domain, { domain, total: 0, counts: {} });
    const row = byDomain.get(domain);
    row.counts[outcome] = (row.counts[outcome] || 0) + 1;
    row.total += 1;
    coded += 1;
  }

  // Worst first: most "fell short", then most "worked, with limits", then least
  // "worked as intended". Equal shares break toward the better-evidenced domain
  // — three findings that all fell short is a firmer result than one that did —
  // and then to codebook order, so the chart is stable across renders. Domains
  // with no findings are absent, not empty rows.
  const share = (row, key) => (row.counts[key] || 0) / row.total;
  const domains = [...byDomain.values()].sort(
    (a, b) =>
      share(b, "fell-short") - share(a, "fell-short") ||
      share(b, "limited") - share(a, "limited") ||
      share(a, "worked") - share(b, "worked") ||
      b.total - a.total ||
      DOMAIN_ORDER.get(a.domain) - DOMAIN_ORDER.get(b.domain),
  );

  return { domains, coded, uncoded, max: domains.reduce((n, d) => Math.max(n, d.total), 0) };
}

function domainMeta(code) {
  return DOMAINS.find((d) => d.code === code) || { code, short: code, name: code };
}

function rowSummary(row) {
  const parts = OUTCOMES.filter((o) => row.counts[o.value]).map(
    (o) => `${row.counts[o.value]} ${o.label.toLowerCase()}`,
  );
  const meta = domainMeta(row.domain);
  const n = row.total === 1 ? "1 finding" : `${row.total} findings`;
  return `${meta.code} ${meta.short}: ${n} — ${parts.join(", ")}.`;
}

export function GovernanceOutcomes({ mechanisms, caption, scale = "count" }) {
  const { domains, coded, uncoded, max } = tallyOutcomes(mechanisms);
  if (!domains.length) return null;

  const used = OUTCOMES.filter((o) => domains.some((d) => d.counts[o.value]));

  return (
    <figure className="go">
      <h3 className="go-title">Which parts of the governance actually worked?</h3>
      <p className="go-sub">
        Question 2 — “Did it work in practice?” — for each type of governance ·{" "}
        {coded} coded {coded === 1 ? "finding" : "findings"}
        {uncoded > 0 && ` · ${uncoded} not yet coded`}
      </p>

      <ul className="go-rows">
        {domains.map((row) => {
          const meta = domainMeta(row.domain);
          // Count-scaled bars measure against the busiest domain; share-scaled
          // bars all run full width.
          const width = scale === "share" ? 100 : (row.total / max) * 100;
          return (
            <li className="go-row" key={row.domain} aria-label={rowSummary(row)}>
              <div className="go-key" aria-hidden="true">
                <span className="go-code">{meta.code}</span>
                <span className="go-name">{meta.short}</span>
              </div>
              <div className="go-track" aria-hidden="true">
                <div className="go-bar" style={{ width: `${width}%` }}>
                  {OUTCOMES.map((o) => {
                    const n = row.counts[o.value] || 0;
                    if (!n) return null;
                    // Only label a segment that is wide enough to hold the number
                    // with padding; otherwise it lives in the tooltip and table.
                    const fits = (n / (scale === "share" ? row.total : max)) >= 0.12;
                    return (
                      <span
                        className={`go-seg ${o.cls}`}
                        key={o.value}
                        style={{ flexGrow: n }}
                        title={`${meta.code} ${meta.short} — ${o.label}: ${n} of ${row.total}`}
                      >
                        {fits && <span className="go-seg-val">{n}</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="go-n" aria-hidden="true">
                {row.total}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="go-legend" aria-hidden="true">
        {used.map((o) => (
          <span className="go-leg" key={o.value}>
            <span className={`go-leg-swatch ${o.cls}`} />
            {o.label}
          </span>
        ))}
      </div>

      <details className="go-table-wrap">
        <summary className="go-table-toggle">View as table</summary>
        <div className="go-table-scroll">
          <table className="go-table">
            <caption className="go-table-cap">
              Coded findings by governance domain{uncoded > 0 && `, excluding ${uncoded} uncoded`}
            </caption>
            <thead>
              <tr>
                <th scope="col">Domain</th>
                {OUTCOMES.map((o) => (
                  <th scope="col" key={o.value}>
                    {o.label}
                  </th>
                ))}
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((row) => {
                const meta = domainMeta(row.domain);
                return (
                  <tr key={row.domain}>
                    <th scope="row">
                      {meta.code} {meta.short}
                    </th>
                    {OUTCOMES.map((o) => (
                      <td key={o.value}>{row.counts[o.value] || 0}</td>
                    ))}
                    <td>{row.total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>

      {caption && <figcaption className="go-cap">{caption}</figcaption>}
    </figure>
  );
}
