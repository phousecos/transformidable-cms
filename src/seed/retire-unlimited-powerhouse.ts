import type { Payload } from 'payload'

/**
 * Unlimited Powerhouse is being retired. This idempotent data fix:
 *
 *  1. Renames any Author record carrying that brand name to "Transformidable".
 *     Article→author relationships are by id, so existing bylines follow the
 *     rename automatically.
 *  2. Remaps any Brand Pillar pointing at unlimitedpowerhouse.com to the
 *     Transformidable domain.
 *
 * Idempotent — once applied, subsequent runs match nothing.
 */
const OLD_AUTHOR_NAMES = ['Unlimited Powerhouse', 'UnlimITed Powerhouse']
const NEW_AUTHOR_NAME = 'Transformidable'
const OLD_DOMAIN = 'unlimitedpowerhouse.com'
const NEW_DOMAIN = 'transformidable.media'

export async function retireUnlimitedPowerhouse(payload: Payload): Promise<void> {
  // 1. Authors
  const authors = await payload.find({
    collection: 'authors',
    where: { name: { in: OLD_AUTHOR_NAMES } },
    limit: 100,
    depth: 0,
  })
  for (const author of authors.docs) {
    await payload.update({
      collection: 'authors',
      id: author.id,
      data: { name: NEW_AUTHOR_NAME },
    })
    payload.logger.info(`[data] Renamed author ${author.id} → "${NEW_AUTHOR_NAME}"`)
  }

  // 2. Brand Pillars mapped to the retired domain
  const pillars = await payload.find({
    collection: 'brand-pillars',
    where: { mappedDomain: { equals: OLD_DOMAIN } },
    limit: 100,
    depth: 0,
  })
  for (const pillar of pillars.docs) {
    await payload.update({
      collection: 'brand-pillars',
      id: pillar.id,
      data: { mappedDomain: NEW_DOMAIN },
    })
    payload.logger.info(`[data] Remapped brand pillar ${pillar.id} → ${NEW_DOMAIN}`)
  }
}
