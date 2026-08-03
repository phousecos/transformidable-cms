// @ts-nocheck
import { getPayload } from 'payload'
import config from '../payload.config.ts'

// One-way importer: copy existing Articles into the Publications collection as
// type "article" so they surface in "Latest publications" on the research
// homepage. Idempotent, keyed by slug — re-running skips publications that
// already exist, so it will not clobber editor changes. It also will not
// delete a publication if its source article is later removed.
//
// Field mapping (Article -> Publication):
//   title        -> title
//   slug         -> slug           (URL stays stable at /publications/<slug>)
//   dek | excerpt-> dek
//   body         -> body           (Lexical rich text, passed through)
//   readTime     -> readTime
//   publishedAt | publishDate -> publishedAt
//   featuredImage-> coverImage     (media id)
//   topics       -> topics         (topic ids)
//   status       -> status         (published stays published; else draft)

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const payload = await getPayload({ config })

let imported = 0
let skipped = 0

try {
  // depth: 0 returns relationship fields (featuredImage, topics) as raw ids,
  // which is exactly what we re-associate on the new publication.
  const { docs: articles } = await payload.find({
    collection: 'articles',
    depth: 0,
    limit: 500,
    pagination: false,
  })

  console.log(`[seed:articles] found ${articles.length} article(s).`)

  for (const a of articles) {
    const slug = a.slug || slugify(a.title)
    if (!slug) {
      console.log('[seed:articles] skipping an article with no title/slug.')
      continue
    }

    const existing = await payload.find({
      collection: 'publications',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    if (existing.totalDocs > 0) {
      skipped++
      console.log(`[seed:articles] publications/${slug} exists — skipping.`)
      continue
    }

    const data = {
      title: a.title,
      slug,
      type: 'article',
      dek: a.dek || a.excerpt || undefined,
      body: a.body || undefined,
      readTime: typeof a.readTime === 'number' ? a.readTime : undefined,
      publishedAt: a.publishedAt || a.publishDate || undefined,
      coverImage: a.featuredImage || undefined,
      topics: Array.isArray(a.topics) && a.topics.length ? a.topics : undefined,
      status: a.status === 'published' ? 'published' : 'draft',
    }

    try {
      await payload.create({ collection: 'publications', data })
      imported++
      console.log(`[seed:articles] imported publications/${slug} (${data.status}).`)
    } catch (e) {
      // A bad relation (e.g. a deleted media/topic) should not abort the run.
      console.error(`[seed:articles] failed publications/${slug}: ${e.message}`)
    }
  }

  console.log(`[seed:articles] done. imported ${imported}, skipped ${skipped}.`)
} catch (e) {
  console.error('[seed:articles] error:', e.message)
  process.exitCode = 1
} finally {
  await payload.destroy()
  process.exit(process.exitCode ?? 0)
}
