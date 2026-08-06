// @ts-nocheck
/**
 * Constellation — the decorative connected-nodes field from the brand system.
 *
 * A purely aesthetic layer: a scatter of nodes joined by faint lines, biased
 * toward one side so it reads as atmosphere behind headline copy (matching the
 * LinkedIn / YouTube / cover art). It is deterministic (seeded), so it renders
 * identically on the server and client — no hydration mismatch, no Math.random.
 *
 * It inherits the surrounding .tr color tokens (wine / gold / rules), is
 * aria-hidden and pointer-events:none, and animates only a gentle twinkle that
 * is disabled under prefers-reduced-motion (handled in research.css).
 */

// mulberry32: a tiny, fast, seedable PRNG. Same seed → same field, forever.
function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 1600;
const H = 520;

type Pt = { x: number; y: number; r: number; ring: boolean; gold: boolean; delay: number };

function buildField(seed: number, count: number, biasRight: boolean) {
  const rng = makeRng(seed);
  const pts: Pt[] = [];
  let guard = 0;
  while (pts.length < count && guard++ < count * 40) {
    // Bias the scatter toward the right so copy on the left stays clean.
    const bx = biasRight ? 0.32 + rng() * 0.68 : rng();
    const x = bx * W;
    const y = rng() * H;
    // Keep nodes from clumping: reject anything too close to an existing one.
    if (pts.some((p) => (p.x - x) ** 2 + (p.y - y) ** 2 < 74 ** 2)) continue;
    const roll = rng();
    pts.push({
      x,
      y,
      r: 1.4 + rng() * 2.6,
      ring: roll > 0.82,
      gold: roll > 0.9,
      delay: rng() * 6,
    });
  }
  // Connect each node to its 2 nearest neighbours within a max distance, so the
  // web feels wired rather than random, without turning into a solid mesh.
  const edges: { a: Pt; b: Pt }[] = [];
  const seen = new Set<string>();
  pts.forEach((p, i) => {
    const near = pts
      .map((q, j) => ({ q, j, d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2 }))
      .filter((o) => o.j !== i && o.d < 240 ** 2)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    near.forEach(({ q, j }) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) return;
      seen.add(key);
      edges.push({ a: p, b: q });
    });
  });
  return { pts, edges };
}

export function Constellation({
  seed = 7,
  count = 34,
  biasRight = true,
  focal = null,
  className = "",
}: {
  seed?: number;
  count?: number;
  biasRight?: boolean;
  // Normalized 0..100 position(s) of a signature "anchor" star — a brighter,
  // haloed gold node that gives each page a recognizable element of its own.
  focal?: { x: number; y: number } | { x: number; y: number }[] | null;
  className?: string;
}) {
  const { pts, edges } = buildField(seed, count, biasRight);
  const focals = focal ? (Array.isArray(focal) ? focal : [focal]) : [];
  return (
    <svg
      className={`tr-constellation ${className}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <g className="tr-const-lines">
        {edges.map((e, i) => (
          <line key={i} x1={e.a.x} y1={e.a.y} x2={e.b.x} y2={e.b.y} />
        ))}
      </g>
      <g className="tr-const-nodes">
        {pts.map((p, i) => (
          <g key={i} className="tr-const-node" style={{ ["--d" as any]: `${p.delay}s` }}>
            {p.ring && (
              <circle
                cx={p.x}
                cy={p.y}
                r={p.r + 4}
                className={p.gold ? "tr-const-ring gold" : "tr-const-ring"}
              />
            )}
            <circle cx={p.x} cy={p.y} r={p.r} className={p.gold ? "tr-const-dot gold" : "tr-const-dot"} />
          </g>
        ))}
      </g>
      {focals.length > 0 && (
        <g className="tr-const-focals">
          {focals.map((f, i) => {
            const fx = (f.x / 100) * W;
            const fy = (f.y / 100) * H;
            return (
              <g key={i} className="tr-const-focal">
                <circle cx={fx} cy={fy} r={16} className="tr-focal-halo" />
                <circle cx={fx} cy={fy} r={9} className="tr-focal-ring" />
                <circle cx={fx} cy={fy} r={3.6} className="tr-focal-dot" />
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}
