import type { Payload } from 'payload'

/**
 * The launch Topic vocabulary. Slugs are the contract downstream consumers
 * (e.g. CIO Advisra) match on — keep them stable. These six mirror the
 * capability pillars used across the Transformidable ecosystem.
 */
export const TOPIC_SEEDS: { name: string; slug: string }[] = [
  { name: 'Governance & Strategy', slug: 'governance-strategy' },
  { name: 'Security & Risk', slug: 'security-risk' },
  { name: 'Operations', slug: 'operations' },
  { name: 'Infrastructure', slug: 'infrastructure' },
  { name: 'Data & Information', slug: 'data-information' },
  { name: 'People Capability', slug: 'people-capability' },
]

/**
 * Idempotent: ensures each seed Topic exists, keyed by slug. Safe to run on
 * every deploy — existing topics are left untouched (names/descriptions are
 * not overwritten, so editors can refine them in the admin).
 */
export async function seedTopics(payload: Payload): Promise<void> {
  for (const seed of TOPIC_SEEDS) {
    const existing = await payload.find({
      collection: 'topics',
      where: { slug: { equals: seed.slug } },
      limit: 1,
      depth: 0,
    })
    if (existing.totalDocs > 0) continue

    await payload.create({ collection: 'topics', data: seed })
    payload.logger.info(`[seed] Created topic "${seed.name}" (${seed.slug})`)
  }
}
