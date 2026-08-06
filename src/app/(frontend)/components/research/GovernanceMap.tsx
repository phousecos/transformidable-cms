// @ts-nocheck
/**
 * GovernanceMap — the semantic node-link diagram from the brand system.
 *
 * Unlike <Constellation> (pure decoration), this carries meaning: entities are
 * typed (governance body / supporting entity / external party) and the lines
 * between them are typed too (strong, weak/at-risk, broken/missing, information
 * flow, decision authority, escalation). Each case file gets a map that shows
 * how a transformation was actually wired — and where it wasn't.
 *
 * It is data-driven: pass explicit `nodes` + `edges`, or derive a starter graph
 * from an existing case file with `deriveGraphFromCase`. It inherits the .tr
 * tokens, is keyboard/AT friendly (title + desc + role="img"), and stays legible
 * in light and dark.
 */

const VW = 760;
const VH = 560;

// ---- Vocabulary ----------------------------------------------------------
const NODE_KINDS = {
  body: { label: "Governance Body", cls: "gm-node--body" },
  entity: { label: "Supporting Entity", cls: "gm-node--entity" },
  external: { label: "External Party", cls: "gm-node--external" },
};

const EDGE_KINDS = {
  strong: { label: "Strong connection", cls: "gm-edge--strong" },
  weak: { label: "Weak / at-risk", cls: "gm-edge--weak" },
  broken: { label: "Broken / missing", cls: "gm-edge--broken" },
  info: { label: "Information flow", cls: "gm-edge--info", arrow: true },
  decision: { label: "Decision authority", cls: "gm-edge--decision" },
  escalation: { label: "Escalation path", cls: "gm-edge--escalation" },
};

// Radius per node kind (the central body reads largest).
const R = { body: 30, entity: 15, external: 15 };

// ---- Layout --------------------------------------------------------------
// Place one center node and ring the rest evenly around it. Nodes may also
// carry explicit x/y (0..100) to override, for hand-tuned maps.
function layout(nodes) {
  const cx = VW / 2;
  const cy = VH / 2;
  const center = nodes.find((n) => n.center) || nodes.find((n) => n.type === "body") || nodes[0];
  const ring = nodes.filter((n) => n !== center);
  const rad = Math.min(VW, VH) * 0.36;
  const placed = new Map();
  placed.set(center.id, { ...center, cx, cy });
  ring.forEach((n, i) => {
    if (typeof n.x === "number" && typeof n.y === "number") {
      placed.set(n.id, { ...n, cx: (n.x / 100) * VW, cy: (n.y / 100) * VH });
      return;
    }
    // Start at the top and go clockwise; nudge outward slightly for odd counts
    // so labels have room.
    const ang = -Math.PI / 2 + (i / ring.length) * Math.PI * 2;
    placed.set(n.id, { ...n, cx: cx + Math.cos(ang) * rad, cy: cy + Math.sin(ang) * rad });
  });
  return placed;
}

function labelAnchor(cx) {
  if (cx < VW * 0.4) return "end";
  if (cx > VW * 0.6) return "start";
  return "middle";
}

export function GovernanceMap({ title, caption, nodes = [], edges = [] }) {
  if (!nodes.length) return null;
  const placed = layout(nodes);
  const usedNodeKinds = [...new Set(nodes.map((n) => n.type))].filter((k) => NODE_KINDS[k]);
  const usedEdgeKinds = [...new Set(edges.map((e) => e.kind))].filter((k) => EDGE_KINDS[k]);
  const desc =
    `Governance map: ${nodes.length} entities` +
    (edges.length ? `, ${edges.length} relationships` : "") +
    ". " +
    nodes.map((n) => n.label).join(", ") + ".";

  return (
    <figure className="gm">
      <div className="gm-canvas">
        <svg
          className="gm-svg"
          viewBox={`0 0 ${VW} ${VH}`}
          role="img"
          aria-label={title ? `${title}. ${desc}` : desc}
        >
          <defs>
            <marker
              id="gm-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" className="gm-arrowhead" />
            </marker>
          </defs>

          {/* Edges first, so nodes sit on top. */}
          <g className="gm-edges">
            {edges.map((e, i) => {
              const a = placed.get(e.from);
              const b = placed.get(e.to);
              if (!a || !b) return null;
              const kind = EDGE_KINDS[e.kind] ? e.kind : "strong";
              return (
                <line
                  key={i}
                  x1={a.cx}
                  y1={a.cy}
                  x2={b.cx}
                  y2={b.cy}
                  className={`gm-edge ${EDGE_KINDS[kind].cls}`}
                  markerEnd={EDGE_KINDS[kind].arrow ? "url(#gm-arrow)" : undefined}
                >
                  {e.label ? <title>{e.label}</title> : null}
                </line>
              );
            })}
          </g>

          {/* Nodes + labels. */}
          <g className="gm-nodes">
            {nodes.map((n) => {
              const p = placed.get(n.id);
              const kind = NODE_KINDS[n.type] ? n.type : "entity";
              const r = R[kind] || 15;
              const anchor = labelAnchor(p.cx);
              const dx = anchor === "end" ? -(r + 8) : anchor === "start" ? r + 8 : 0;
              const dy = anchor === "middle" ? r + 16 : 4;
              return (
                <g key={n.id} className={`gm-node ${NODE_KINDS[kind].cls}`}>
                  <circle cx={p.cx} cy={p.cy} r={r} className="gm-node-dot" />
                  <text x={p.cx + dx} y={p.cy + dy} textAnchor={anchor} className="gm-node-label">
                    {n.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {(usedNodeKinds.length > 0 || usedEdgeKinds.length > 0) && (
        <div className="gm-legend" aria-hidden="true">
          {usedNodeKinds.map((k) => (
            <span className="gm-leg" key={`n-${k}`}>
              <span className={`gm-leg-dot ${NODE_KINDS[k].cls}`} />
              {NODE_KINDS[k].label}
            </span>
          ))}
          {usedEdgeKinds.map((k) => (
            <span className="gm-leg" key={`e-${k}`}>
              <span className={`gm-leg-line ${EDGE_KINDS[k].cls}`} />
              {EDGE_KINDS[k].label}
            </span>
          ))}
        </div>
      )}

      {caption && <figcaption className="gm-cap">{caption}</figcaption>}
    </figure>
  );
}

// ---- Derive a starter graph from an existing case file -------------------
// The case model has `organizations` (with a free-text role) but no explicit
// edges yet, so we classify each org by its role and wire every party to the
// central governance body. This gives a real, data-driven map today; richer
// typed edges can be authored later without touching the component.
const RE_EXTERNAL = /vendor|partner|regulator|external|contractor|supplier|consult|counsel|auditor/i;
const RE_BODY = /oversight|board|governance|steering|committee|sponsor|program office|regent|trustee|executive/i;

function classify(role) {
  if (!role) return "entity";
  if (RE_EXTERNAL.test(role)) return "external";
  if (RE_BODY.test(role)) return "body";
  return "entity";
}

export function deriveGraphFromCase(cf) {
  const orgs = (Array.isArray(cf?.organizations) ? cf.organizations : []).filter(
    (o) => o && typeof o === "object" && o.name,
  );
  if (orgs.length < 2) return null;

  const typed = orgs.map((o, i) => ({
    id: `org-${i}`,
    label: o.name,
    type: classify(o.role),
    role: o.role,
  }));

  // Pick the center: prefer an explicit governance body, else the first org.
  let centerIdx = typed.findIndex((t) => t.type === "body");
  if (centerIdx === -1) centerIdx = 0;
  typed[centerIdx].center = true;
  typed[centerIdx].type = "body";

  const center = typed[centerIdx];
  const edges = typed
    .filter((t) => t.id !== center.id)
    .map((t) => ({
      from: center.id,
      to: t.id,
      // External parties read as information flow into the body; internal
      // parties as strong governance connections. A reasonable default that
      // authors can override once edge-authoring lands.
      kind: t.type === "external" ? "info" : "strong",
      label: t.role ? `${center.label} ↔ ${t.label} (${t.role})` : undefined,
    }));

  return { nodes: typed, edges };
}
