// The five coding scales from the Technology Governance Codebook, in one place.
//
// Each scale is asked of a coded segment as a plain-language QUESTION, and
// stored as its CODE. The codes are the durable values — the questions and
// answer labels are presentation, and can be reworded without touching data.
//
// The four questions plus the overall assessment are not a separate vocabulary
// invented for the site: they are the codebook's own scales, restated. Section
// references below point at the codebook clause each scale comes from.
//
//   Q1  Was it set up?            §8  Design state          D1–D4, D9
//   Q2  Did it work in practice?  §8  Operational state     O1–O5, O9
//   Q3  How solid is the proof?   §8  Evidence state        E1–E5, E9
//   Q4  Did it matter?            §11 Governance–consequence R0–R4, R9
//   Overall                       §9  Effectiveness         A1–A4, A9
//
// This module is imported by the CaseFiles collection (to build the admin
// selects), by the case page (to render the tables), and by the coding importer
// (to validate a CSV). Adding an option here is what makes it selectable,
// chartable and importable at once — there is no second list to update.
//
// `tone` drives color. It is the semantic reading of an answer, not a fixed
// hue: "good" is the mechanism doing its job, "serious" is it failing,
// "neutral" is the coder declining to conclude. For Q3 and Q4 there is no good
// or bad — evidence strength and causal contribution are not verdicts — so
// those scales are toned as an ordinal ramp instead.

/**
 * Where an answer sits on its scale's colored ramp, 1..5, or "none".
 *
 * "none" is not a fifth verdict — it marks the answers that are not points on
 * the scale at all: conflicting evidence, not-yet-applicable, unknown. Those
 * render hatched grey, which also keeps them separable from the serious end for
 * red-blind readers. Slots are explicit rather than derived from list position
 * because these scales are an ordered core plus a non-ordinal tail, and the
 * tail is not "worse" than the core — D4 (conflicting evidence) is not a more
 * severe finding than D3 (never set up), it is a different kind of statement.
 */
export type Slot = 1 | 2 | 3 | 4 | 5 | "none";

// The status palette carries four steps (1..4); the ramp carries five (1..5).
// Four is not an aesthetic choice: five ordered status steps cannot be held
// inside the dark theme's usable lightness band while keeping every adjacent
// pair distinguishable, so the verdict scales use four and the two ramps —
// which are a single hue and judged on lightness order, not hue adjacency —
// use five.

export type CodeOption = {
  code: string;
  label: string;
  slot: Slot;
  /** Definition as worded in the codebook, shown on hover in the admin. */
  meaning: string;
};

export type Question = {
  /** Stable field name on a coded finding. */
  key: "design" | "operational" | "evidence" | "relationship" | "effectiveness";
  /** Short handle used in headings and anchors. */
  tag: string;
  /** The plain-language question put to each segment. */
  question: string;
  /** Codebook clause this scale is drawn from. */
  section: string;
  /** What the scale measures, for the table subtitle. */
  about: string;
  /**
   * Which palette the slots are painted from.
   *
   * "status" runs good -> critical, for the three scales that are verdicts on
   * the governance. "ramp" is a single hue, light -> dark, for the two that are
   * NOT verdicts: how well evidenced a finding is says something about the
   * record rather than the governance, and how strongly it is linked to the
   * outcome is a measure of contribution, not a grade. Painting either with
   * status colors would turn "single-source evidence" or "no link to outcome"
   * into an accusation.
   */
  palette: "status" | "ramp";
  options: CodeOption[];
};

export const QUESTIONS: Question[] = [
  {
    key: "design",
    tag: "Q1",
    question: "Was it set up?",
    section: "§8 Design state",
    about: "Whether the mechanism was defined in the first place",
    palette: "status",
    options: [
      { code: "D1", label: "Set up — clearly", slot: 1, meaning: "Clearly defined" },
      { code: "D2", label: "Set up — partially", slot: 3, meaning: "Partially or incompletely defined" },
      { code: "D3", label: "Never set up", slot: 4, meaning: "Evidence establishes the mechanism was undefined" },
      { code: "D4", label: "Conflicting evidence", slot: "none", meaning: "Conflicting evidence" },
      { code: "D9", label: "Unclear", slot: "none", meaning: "Unknown or insufficient evidence" },
    ],
  },
  {
    key: "operational",
    tag: "Q2",
    question: "Did it work in practice?",
    section: "§8 Operational state",
    about: "Whether the mechanism actually operated as designed",
    palette: "status",
    options: [
      { code: "O1", label: "Worked as intended", slot: 1, meaning: "Generally operated as designed" },
      { code: "O2", label: "Worked, with exceptions", slot: 2, meaning: "Operated with meaningful exceptions or inconsistency" },
      { code: "O3", label: "Bypassed / overridden", slot: 3, meaning: "Materially bypassed or overridden" },
      { code: "O4", label: "Didn’t operate", slot: 4, meaning: "Evidence establishes the mechanism did not operate" },
      { code: "O5", label: "Not yet applicable", slot: "none", meaning: "Not applicable during the observed period" },
      { code: "O9", label: "Unclear", slot: "none", meaning: "Unknown or insufficient evidence" },
    ],
  },
  {
    key: "evidence",
    tag: "Q3",
    question: "How solid is the proof?",
    section: "§8 Evidence state",
    // Not a verdict: weak evidence is a statement about the record, not about
    // the governance. Colored as a ramp so it never reads as a failing grade.
    about: "How well evidenced the finding is",
    palette: "ramp",
    options: [
      { code: "E1", label: "Direct evidence", slot: 5, meaning: "Direct evidence" },
      { code: "E2", label: "Corroborated", slot: 4, meaning: "Corroborated by materially distinct evidence" },
      { code: "E3", label: "Single source", slot: 2, meaning: "Single-source evidence" },
      { code: "E4", label: "Conflicting evidence", slot: "none", meaning: "Materially conflicting evidence" },
      { code: "E5", label: "Absence evidenced", slot: 3, meaning: "Absence affirmatively evidenced" },
      { code: "E9", label: "Not evidenced", slot: "none", meaning: "Not evidenced in available material — never read this as E5" },
    ],
  },
  {
    key: "relationship",
    tag: "Q4",
    question: "Did it matter?",
    section: "§11 Governance–consequence relationship",
    // Also not a verdict: "no demonstrated relationship" is a clean result, not
    // a bad one, so this scale is a ramp from no link to primary cause.
    about: "How strongly the finding is linked to the outcome",
    palette: "ramp",
    options: [
      { code: "R0", label: "No link to outcome", slot: 1, meaning: "No demonstrated relationship" },
      { code: "R1", label: "Possible link", slot: 2, meaning: "Plausible relationship; insufficient evidence to establish contribution" },
      { code: "R2", label: "Contributed", slot: 3, meaning: "Contributing relationship supported by evidence" },
      { code: "R3", label: "Major contributor", slot: 4, meaning: "Material contributing relationship supported by substantial evidence" },
      { code: "R4", label: "Primary cause", slot: 5, meaning: "Primary or direct relationship strongly supported by evidence" },
      { code: "R9", label: "Unclear", slot: "none", meaning: "Indeterminate" },
    ],
  },
  {
    key: "effectiveness",
    tag: "Overall",
    question: "Did it work?",
    section: "§9 Governance effectiveness",
    about: "The effectiveness assessment the other four questions support",
    palette: "status",
    options: [
      { code: "A1", label: "Worked", slot: 1, meaning: "Effective" },
      { code: "A2", label: "Worked, with limits", slot: 2, meaning: "Generally effective with limitations" },
      { code: "A3", label: "Materially limited", slot: 3, meaning: "Materially limited" },
      { code: "A4", label: "Fell short", slot: 4, meaning: "Deficient" },
      { code: "A9", label: "Not enough evidence", slot: "none", meaning: "Indeterminate" },
    ],
  },
];

/** Segment types from the coding sheet. Only findings are tallied. */
export const SEGMENT_TYPES = [
  {
    value: "narrative-finding",
    label: "Narrative finding",
    // The only type that counts toward the tables: a recommendation is not yet
    // a finding, and an entity's own response is its account of itself.
    counts: true,
  },
  { value: "recommendation", label: "Recommendation", counts: false },
  { value: "entity-response", label: "Entity response", counts: false },
  { value: "auditor-comment", label: "Auditor comment", counts: false },
  { value: "rec-follow-up", label: "Rec. follow-up", counts: false },
];

/** §10 consequence domains. Recorded separately from governance. */
export const CONSEQUENCE_TYPES = [
  "Financial", "Operational", "Strategic", "Legal / Regulatory", "Privacy / Data",
  "Security / Resilience", "Workforce / Stakeholder", "Reputational",
  "Human / Societal", "Latent Risk", "Positive Benefit", "None Evidenced", "Unknown",
];

const BY_KEY = new Map(QUESTIONS.map((q) => [q.key, q]));

export function question(key: Question["key"]): Question | undefined {
  return BY_KEY.get(key);
}

export function optionFor(key: Question["key"], code: string): CodeOption | undefined {
  return BY_KEY.get(key)?.options.find((o) => o.code === code);
}

/** Payload select options for a scale: stored value is the code. */
export function selectOptions(key: Question["key"]) {
  const q = BY_KEY.get(key);
  if (!q) return [];
  return q.options.map((o) => ({ label: `${o.code} — ${o.label}`, value: o.code }));
}

/**
 * Resolve a human answer label back to its code, for CSV import. Matching is
 * case- and punctuation-insensitive so a sheet written with a straight
 * apostrophe or an ASCII dash still lands on the right code.
 */
const normalize = (s: string) =>
  s.toLowerCase().replace(/[’']/g, "").replace(/[—–-]/g, " ").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

export function codeFromLabel(key: Question["key"], label: string): string | undefined {
  const q = BY_KEY.get(key);
  if (!q) return undefined;
  const want = normalize(label);
  return q.options.find((o) => normalize(o.label) === want || o.code.toLowerCase() === want)?.code;
}

export function segmentTypeFromLabel(label: string): string | undefined {
  const want = normalize(label);
  return SEGMENT_TYPES.find((t) => normalize(t.label) === want || t.value === want)?.value;
}
