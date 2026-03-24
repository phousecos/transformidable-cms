import { getPayload } from 'payload'
import config from './payload.config.ts'

const payload = await getPayload({ config })

// Seed: Vetters Group Brand Pillar
const pillarName = 'HR & Compliance'

const existing = await payload.find({
  collection: 'brand-pillars',
  where: { name: { equals: pillarName } },
  limit: 1,
})

if (existing.docs.length > 0) {
  console.log(`[seed] Brand Pillar "${pillarName}" already exists — skipping.`)
} else {
  await payload.create({
    collection: 'brand-pillars',
    data: {
      name: pillarName,
      slug: 'hr-compliance',
      mappedDomain: 'vettersgroup.com',
      contentFocus:
        'Background screening compliance, FCRA, hiring risk, and HR best practices.',
    },
  })
  console.log(`[seed] Created Brand Pillar "${pillarName}".`)
}

await payload.destroy()
process.exit(0)
