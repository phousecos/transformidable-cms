import type { CollectionAfterChangeHook } from 'payload'

/**
 * Maps each `syndicateTo` option value to the env var prefix used to
 * look up that brand's revalidate URL and shared secret.
 *
 * For a value like `agentpmo`, the hook reads:
 *   - SYNDICATE_AGENTPMO_URL     (required — revalidate endpoint)
 *   - SYNDICATE_AGENTPMO_SECRET  (optional — sent as Bearer token)
 *
 * Brands without a configured URL are skipped silently so partial
 * rollout is possible.
 */
const envKey = (brand: string) => brand.toUpperCase().replace(/[^A-Z0-9]/g, '_')

type SyndicationPayload = {
  event: 'article.published' | 'article.updated'
  id: string | number
  slug?: string
  title?: string
  publishedAt?: string
  issue?: unknown
  vertical?: unknown
}

async function notifyBrand(
  brand: string,
  body: SyndicationPayload,
  logger: { info: (msg: string) => void; warn: (msg: string) => void; error: (msg: string) => void },
) {
  const prefix = envKey(brand)
  const url = process.env[`SYNDICATE_${prefix}_URL`]
  const secret = process.env[`SYNDICATE_${prefix}_SECRET`]

  if (!url) {
    logger.info(`[syndicate] No SYNDICATE_${prefix}_URL configured; skipping ${brand}`)
    return
  }

  try {
    // Cap each notify call so a slow or hung brand endpoint cannot block the
    // article-save lambda. Promise.allSettled below means one slow brand can
    // still delay the others until they all return or time out.
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      logger.warn(
        `[syndicate] ${brand} responded ${res.status} for article ${body.id} (${body.slug ?? 'no-slug'})`,
      )
      return
    }

    logger.info(`[syndicate] Notified ${brand} of ${body.event} for article ${body.id}`)
  } catch (err) {
    logger.error(
      `[syndicate] Failed to notify ${brand} for article ${body.id}: ${
        err instanceof Error ? err.message : String(err)
      }`,
    )
  }
}

export const syndicateArticleAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const status = doc?.status
  if (status !== 'published') return doc

  const targets: string[] = Array.isArray(doc?.syndicateTo) ? doc.syndicateTo : []
  if (targets.length === 0) return doc

  // Only fire for transitions into published, or edits to already-published
  // articles. Unpublish → republish counts as a transition.
  const wasPublished = previousDoc?.status === 'published'
  const event: SyndicationPayload['event'] =
    operation === 'create' || !wasPublished ? 'article.published' : 'article.updated'

  const payload: SyndicationPayload = {
    event,
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    publishedAt: doc.publishedAt,
    issue: doc.issue,
    vertical: doc.vertical,
  }

  // Fan out in parallel; never block the save on webhook failures.
  await Promise.allSettled(targets.map((brand) => notifyBrand(brand, payload, req.payload.logger)))

  return doc
}
