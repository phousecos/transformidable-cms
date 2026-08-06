// @ts-nocheck
import { Constellation } from "./Constellation";

/**
 * Sky — the signature hero backdrop: a dusk/night *ombré* with the
 * constellation layered over it like stars.
 *
 * Each main page gets its own `variant` — a distinct ombré palette plus a
 * distinct star field (unique seed + a signature "anchor" star) — so sections
 * feel individual but belong to one family. The sky is intentionally
 * always-dark (its colors are fixed in research.css, not theme tokens), which
 * is why hero copy laid over it should use the `.tr-onsky` treatment.
 *
 * Usage: drop <Sky variant="research" /> as the first child of a `.hero` (or
 * `.idx-hero`) exactly where <Constellation /> went; hero content sits above it
 * via z-index.
 */

// Per-page star fields. Distinct seed + density + a signature anchor star so
// each page reads as its own constellation. `variant` also selects the ombré
// via a CSS class (.tr-sky--<variant>) defined in research.css.
export const SKY_VARIANTS = {
  research: { seed: 7, count: 34, focal: { x: 74, y: 30 } },
  publications: { seed: 13, count: 30, focal: { x: 82, y: 44 } },
  podcast: { seed: 29, count: 32, focal: { x: 68, y: 26 } },
  "case-files": { seed: 41, count: 36, focal: { x: 86, y: 34 } },
  events: { seed: 53, count: 28, focal: { x: 71, y: 40 } },
  about: { seed: 67, count: 30, focal: { x: 80, y: 28 } },
  tools: { seed: 83, count: 33, focal: { x: 77, y: 36 } },
  default: { seed: 7, count: 34, focal: { x: 74, y: 30 } },
};

export function Sky({ variant = "research", className = "" }) {
  const cfg = SKY_VARIANTS[variant] || SKY_VARIANTS.default;
  return (
    <div className={`tr-sky tr-sky--${variant} ${className}`} aria-hidden="true">
      <span className="tr-sky-glow" />
      <Constellation seed={cfg.seed} count={cfg.count} focal={cfg.focal} className="tr-sky-stars" />
    </div>
  );
}
