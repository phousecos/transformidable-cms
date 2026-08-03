// @ts-nocheck
import type { Payload } from 'payload'

// Sample research content (Research Notes, Publications, Case Files incl.
// UCPath) used to populate a non-production environment so the homepage and
// dossier render with real-looking data. Idempotent, keyed by slug: existing
// docs are left untouched, so editors can safely edit them in the admin.
//
// This is called from migrate.ts on preview deploys only. The standalone
// `seed:research` / `seed:ucpath` scripts remain for manual local runs.

function rt(paragraphs: string[]) {
  return {
    root: {
      type: 'root', format: '', indent: 0, version: 1, direction: 'ltr',
      children: paragraphs.map((text) => ({
        type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0,
        children: [{ type: 'text', version: 1, text, format: 0, style: '', mode: 'normal', detail: 0 }],
      })),
    },
  }
}

const NOTES = [
  {
    slug: 'reading-ucpath-as-governance',
    title: 'Reading UCPath as a governance case',
    dek: 'Why a systemwide HR and payroll consolidation is, at its core, a story about governance and oversight.',
    readTime: 6,
    publishedAt: '2026-07-10T12:00:00.000Z',
    body: rt([
      'A payroll and HR consolidation across a large public university system looks, from the outside, like a technology program. Read the record closely and it is a governance program wearing technology clothes.',
      'This note collects the questions worth asking of any such effort: who owns the outcome, how oversight was structured across independent campuses, and where accountability sat when service problems reached individual employees.',
    ]),
  },
  {
    slug: 'shared-services-and-accountability',
    title: 'Shared services and the accountability question',
    dek: 'What moving payroll into a central shared-services center does to who is accountable when something breaks.',
    readTime: 5,
    publishedAt: '2026-07-24T12:00:00.000Z',
    body: rt([
      'Centralizing a service concentrates expertise and, ideally, cost. It also moves the point of accountability away from the campus an employee actually works for. That trade is a governance choice, not an operational detail.',
      'A placeholder note to be expanded with the specifics of how the shared-services model changed escalation, ownership, and redress.',
    ]),
  },
]

const PUBLICATIONS = [
  {
    slug: 'when-the-pilot-survives-the-audit',
    title: 'When the Pilot Survives the Audit',
    type: 'governance-file', seriesLabel: 'No. 07', readTime: 22, featured: true,
    publishedAt: '2026-07-15T12:00:00.000Z',
    dek: 'Why the successful pilot is so often the thing that kills the rollout, and the governance move that breaks the pattern.',
  },
  {
    slug: 'governance-resilience-index-methodology',
    title: 'A Governance Resilience Index: Methodology and First Findings',
    type: 'white-paper', peerReviewed: true, pageCount: 48,
    publishedAt: '2026-06-28T12:00:00.000Z',
    dek: 'The full construction of the index: what it measures, what it deliberately does not, and how the first sector scores were derived.',
  },
  {
    slug: 'state-of-governance-2025',
    title: 'The State of Governance 2025',
    type: 'annual-report', seriesLabel: 'Vol. I',
    publishedAt: '2026-02-01T12:00:00.000Z',
    dek: 'One year of case files, read together: where transformation held, where it reverted, and what the difference kept coming down to.',
  },
  {
    slug: 'resilience-is-a-governance-property',
    title: 'Resilience Is a Governance Property, Not an Operational One',
    type: 'article', readTime: 9,
    publishedAt: '2026-05-19T12:00:00.000Z',
    dek: 'Organizations keep trying to buy resilience with tooling. The evidence says it is decided upstream, in how oversight is structured.',
  },
]

// The three simple sample case files. UCPath (with the full dossier) is added
// separately because it links to the seeded research notes.
const CASE_FILES = [
  {
    slug: 'core-conversion-that-held',
    title: 'The core conversion that held.',
    caseNumber: 14, sector: 'Financial cooperative', method: 'Decision-trace', readTime: 14,
    publishedAt: '2026-07-20T12:00:00.000Z',
    dek: 'A $400M credit union replaced the system its entire organization runs on, and against the base rate, it worked. The difference was eleven governance decisions made in the year before go-live.',
    timelineLabel: 'The eleven-month decision window',
    timeline: [
      { time: '-11 mo', title: 'Board reframes the project as governance, not IT', description: 'Ownership moves to a standing committee', keyMoment: true },
      { time: '-8 mo', title: 'Reversibility written into the contract', description: 'A funded path back, not just forward' },
      { time: '-4 mo', title: 'Members briefed before the switch, not after', description: 'Trust treated as a deliverable', keyMoment: true },
      { time: 'Go-live', title: 'Conversion holds; no reversion at 18 months', description: 'The outcome the earlier decisions bought' },
    ],
  },
  {
    slug: 'leadership-changed-the-meeting',
    title: 'The leader who changed the meeting, not the plan.',
    caseNumber: 13, sector: 'Public agency', method: 'Behavioral trace', readTime: 11,
    publishedAt: '2026-06-11T12:00:00.000Z',
    dek: 'A transformation that had stalled for two years moved in one quarter. Nothing changed in the roadmap. What changed was who spoke first, and last, in the room where decisions were made.',
  },
  {
    slug: 'audit-that-arrived-too-late',
    title: 'The audit that arrived eleven months too late.',
    caseNumber: 12, sector: 'Healthcare system', method: 'Failure post-mortem', readTime: 13,
    publishedAt: '2026-05-02T12:00:00.000Z',
    dek: 'The controls all passed. The reporting was clean. And the transformation failed anyway, for a reason the audit was never designed to see.',
  },
]

async function ensure(payload: Payload, collection: string, slug: string, data: Record<string, unknown>) {
  const existing = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  if (existing.totalDocs > 0) return existing.docs[0].id
  const created = await payload.create({ collection, data: { ...data, slug, status: 'published' } })
  console.log(`[seed:samples] created ${collection}/${slug}`)
  return created.id
}

export async function seedResearchSamples(payload: Payload): Promise<void> {
  const noteIds: any[] = []
  for (const n of NOTES) noteIds.push(await ensure(payload, 'research-notes', n.slug, n))
  for (const p of PUBLICATIONS) await ensure(payload, 'publications', p.slug, p)
  for (const cf of CASE_FILES) await ensure(payload, 'case-files', cf.slug, cf)

  await ensure(payload, 'case-files', 'ucpath', {
    title: 'UCPath',
    caseNumber: 1, featured: true, publishedAt: '2026-08-01T12:00:00.000Z',
    sector: 'Public university system', jurisdiction: 'California', caseStatus: 'resolved',
    method: 'Decision-trace', readTime: 16,
    dek: 'The University of California’s systemwide consolidation of payroll and HR onto a single platform, and what its long, contested rollout reveals about governing large-scale transformation.',
    overview: rt([
      'UCPath is the University of California’s systemwide program to consolidate payroll, academic personnel, timekeeping, and human resources onto a single platform, replacing systems that had been run campus by campus.',
      'The program is a useful governance case precisely because the technology was never the hard part. The hard part was governing a change across independent campuses and medical centers, with oversight, accountability, and employee trust all in play. This overview is scaffolding — expand it with verified, sourced detail.',
    ]),
    timelineLabel: 'Program milestones (add exact dates)',
    timeline: [
      { time: 'Initiation', title: 'Program chartered to consolidate payroll and HR systemwide', description: 'Replace campus-by-campus systems with one platform.', keyMoment: true },
      { time: 'Build', title: 'Implementation on a common ERP platform', description: 'Design, configuration, and testing.' },
      { time: 'Waves', title: 'Phased deployment across campuses and medical centers', description: 'Go-live in successive waves.', keyMoment: true },
      { time: 'Steady state', title: 'Systemwide operation via the UCPath Center', description: 'Ongoing shared-services delivery.' },
    ],
    organizations: [
      { name: 'University of California', role: 'Owner / sponsor', description: 'The multi-campus system undertaking the consolidation.', url: 'https://www.universityofcalifornia.edu' },
      { name: 'UCPath Center', role: 'Shared-services operations', description: 'The central unit operating payroll and HR services after go-live.' },
    ],
    documents: [
      { title: 'Add a primary-source document', docType: 'report', url: 'https://example.com/replace-with-source', description: 'Replace with a real URL (program charter, board/regents materials, status reports).' },
    ],
    auditReports: [
      { title: 'Add an audit report', auditor: 'e.g. state auditor or UC internal audit', url: 'https://example.com/replace-with-audit', summary: 'Replace with the audit and a one-line summary of its findings.' },
    ],
    newsCoverage: [
      { headline: 'Add a news article', outlet: 'Outlet', url: 'https://example.com/replace-with-article', excerpt: 'Replace with a real article and a short excerpt.' },
    ],
    researchNotes: noteIds,
    governanceMechanisms: [
      { name: 'Systemwide program governance', assessment: 'observation', description: 'How oversight was structured across independent campuses and the center.' },
      { name: 'Shared-services operating model', assessment: 'observation', description: 'Centralizing service delivery, and what it did to accountability.' },
    ],
    aiSummary: 'Placeholder for an AI-generated summary of the UCPath case. Replace, or generate from the case content once the sections are filled in.',
    lessonsLearned: [
      { lesson: 'Consolidation is a governance decision before it is a technology one.', detail: 'The hardest questions were about oversight and accountability, not software.' },
      { lesson: 'Phased rollouts buy time but widen the risk window.', detail: 'Add the specifics from the case record.' },
    ],
  })
}
