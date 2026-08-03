// @ts-nocheck
import { getPayload } from 'payload'
import config from '../payload.config.ts'

// Idempotent seed for the research homepage: a handful of Case Files and
// Publications so the "Case Files" and "Latest publications" sections render
// with real content. Keyed by slug — safe to re-run; existing docs are left
// untouched so editors can refine them in the admin.

type CaseSeed = {
  slug: string
  title: string
  caseNumber: number
  sector: string
  method: string
  readTime: number
  dek: string
  featured?: boolean
  publishedAt: string
  timelineLabel?: string
  timeline?: { time: string; title: string; description?: string; keyMoment?: boolean }[]
}

type PubSeed = {
  slug: string
  title: string
  type: 'governance-file' | 'article' | 'white-paper' | 'annual-report'
  dek: string
  seriesLabel?: string
  readTime?: number
  pageCount?: number
  peerReviewed?: boolean
  featured?: boolean
  publishedAt: string
}

const CASE_FILES: CaseSeed[] = [
  {
    slug: 'core-conversion-that-held',
    title: 'The core conversion that held.',
    caseNumber: 14,
    sector: 'Financial cooperative',
    method: 'Decision-trace',
    readTime: 14,
    featured: true,
    publishedAt: '2026-07-20T12:00:00.000Z',
    dek: 'A $400M credit union replaced the system its entire organization runs on, and against the base rate, it worked. The difference was not the vendor or the timeline. It was eleven governance decisions made in the year before go-live.',
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
    caseNumber: 13,
    sector: 'Public agency',
    method: 'Behavioral trace',
    readTime: 11,
    publishedAt: '2026-06-11T12:00:00.000Z',
    dek: 'A transformation that had stalled for two years moved in one quarter. Nothing changed in the roadmap. What changed was who spoke first, and last, in the room where decisions were made.',
  },
  {
    slug: 'audit-that-arrived-too-late',
    title: 'The audit that arrived eleven months too late.',
    caseNumber: 12,
    sector: 'Healthcare system',
    method: 'Failure post-mortem',
    readTime: 13,
    publishedAt: '2026-05-02T12:00:00.000Z',
    dek: 'The controls all passed. The reporting was clean. And the transformation failed anyway, for a reason the audit was never designed to see.',
  },
]

const PUBLICATIONS: PubSeed[] = [
  {
    slug: 'when-the-pilot-survives-the-audit',
    title: 'When the Pilot Survives the Audit',
    type: 'governance-file',
    seriesLabel: 'No. 07',
    readTime: 22,
    featured: true,
    publishedAt: '2026-07-15T12:00:00.000Z',
    dek: 'Why the successful pilot is so often the thing that kills the rollout, and the governance move that breaks the pattern.',
  },
  {
    slug: 'governance-resilience-index-methodology',
    title: 'A Governance Resilience Index: Methodology and First Findings',
    type: 'white-paper',
    peerReviewed: true,
    pageCount: 48,
    publishedAt: '2026-06-28T12:00:00.000Z',
    dek: 'The full construction of the index: what it measures, what it deliberately does not, and how the first sector scores were derived.',
  },
  {
    slug: 'state-of-governance-2025',
    title: 'The State of Governance 2025',
    type: 'annual-report',
    seriesLabel: 'Vol. I',
    publishedAt: '2026-02-01T12:00:00.000Z',
    dek: 'One year of case files, read together: where transformation held, where it reverted, and what the difference kept coming down to.',
  },
  {
    slug: 'resilience-is-a-governance-property',
    title: 'Resilience Is a Governance Property, Not an Operational One',
    type: 'article',
    readTime: 9,
    publishedAt: '2026-05-19T12:00:00.000Z',
    dek: 'Organizations keep trying to buy resilience with tooling. The evidence says it is decided upstream, in how oversight is structured.',
  },
]

const payload = await getPayload({ config })

async function ensure(collection: string, slug: string, data: Record<string, unknown>) {
  const existing = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  if (existing.totalDocs > 0) {
    console.log(`[seed:research] ${collection}/${slug} exists — skipping.`)
    return
  }
  await payload.create({ collection, data: { ...data, slug, status: 'published' } })
  console.log(`[seed:research] created ${collection}/${slug}.`)
}

try {
  for (const cf of CASE_FILES) await ensure('case-files', cf.slug, cf)
  for (const p of PUBLICATIONS) await ensure('publications', p.slug, p)
  console.log('[seed:research] done.')
} catch (e: any) {
  console.error('[seed:research] error:', e.message)
  process.exitCode = 1
} finally {
  await payload.destroy()
  process.exit(process.exitCode ?? 0)
}
