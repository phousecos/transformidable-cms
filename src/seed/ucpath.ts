// @ts-nocheck
import { getPayload } from 'payload'
import config from '../payload.config.ts'

// Scaffolds the UCPath case so the full dossier renders end-to-end. It seeds a
// couple of Research Notes and a UCPath Case File that links to them. Content
// is intentionally high-level scaffolding with clear placeholders (sources use
// example.com) — replace the documents/audits/news URLs and expand the prose
// with real, verified detail in the admin. Idempotent, keyed by slug.

// Build a minimal Lexical rich-text value from an array of paragraphs.
function rt(paragraphs) {
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
      'This note collects the questions worth asking of any such effort: who owns the outcome, how oversight was structured across independent campuses, and where accountability sat when service problems reached individual employees. Expand with verified detail.',
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

const payload = await getPayload({ config })

async function ensure(collection, slug, data) {
  const existing = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  if (existing.totalDocs > 0) {
    console.log(`[seed:ucpath] ${collection}/${slug} exists — skipping.`)
    return existing.docs[0].id
  }
  const created = await payload.create({ collection, data: { ...data, slug, status: 'published' } })
  console.log(`[seed:ucpath] created ${collection}/${slug}.`)
  return created.id
}

try {
  const noteIds = []
  for (const n of NOTES) noteIds.push(await ensure('research-notes', n.slug, n))

  await ensure('case-files', 'ucpath', {
    title: 'UCPath',
    caseNumber: 1,
    featured: true,
    publishedAt: '2026-08-01T12:00:00.000Z',
    sector: 'Public university system',
    jurisdiction: 'California',
    caseStatus: 'resolved',
    method: 'Decision-trace',
    readTime: 16,
    dek: 'The University of California’s systemwide consolidation of payroll and HR onto a single platform, and what its long, contested rollout reveals about governing large-scale transformation.',
    overview: rt([
      'UCPath is the University of California’s systemwide program to consolidate payroll, academic personnel, timekeeping, and human resources onto a single platform, replacing systems that had been run campus by campus.',
      'The program is a useful governance case precisely because the technology was never the hard part. The hard part was governing a change across independent campuses and medical centers, with oversight, accountability, and employee trust all in play. This overview is scaffolding — expand it with verified, sourced detail.',
    ]),
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

  console.log('[seed:ucpath] done.')
} catch (e) {
  console.error('[seed:ucpath] error:', e.message)
  process.exitCode = 1
} finally {
  await payload.destroy()
  process.exit(process.exitCode ?? 0)
}
