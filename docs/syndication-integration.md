# Transformidable Syndication — Integration Guide for Brand Sites

This document is for the teams running the brand sites that receive
syndicated content from the Transformidable Payload CMS:

- Jerri Bland (`jerribland`)
- UnlimITed Powerhouse (`unlimitedpowerhouse`)
- AgentPMO (`agentpmo`)
- Prept (`prept`)
- Lumynr (`lumynr`)
- Vetters Group (`vettersgroup`)

It explains how the syndication webhook works, what your site needs to
expose, and how to pull full article content from the Payload API.

---

## 1. How syndication works

1. An editor publishes an article in the Transformidable Payload admin
   and selects one or more brand sites in the **Syndicate To** field.
2. When the article is saved with `status = "published"`, Payload fires
   an `afterChange` hook (`src/collections/hooks/syndicate.ts`) that
   POSTs a small JSON notification to each selected brand's revalidate
   endpoint.
3. Your brand site receives the notification, verifies the shared
   secret, optionally fetches the full article from Payload's public
   REST API, and revalidates / regenerates its own pages.

Payload is the single source of truth. Your site is a consumer — it
should treat article content as read-only data pulled from Payload.

---

## 2. Webhook contract

### Request

- **Method:** `POST`
- **URL:** whatever you give the Transformidable team to register in
  `SYNDICATE_<BRAND>_URL`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <shared secret>` — present only if a
    `SYNDICATE_<BRAND>_SECRET` is configured on the Payload side. You
    should require it.

### Body

```json
{
  "event": "article.published",
  "id": "6613b0e4f2c1a2f3d4e5f6a7",
  "slug": "the-transformable-agent",
  "title": "The Transformable Agent",
  "publishedAt": "2026-04-14T12:00:00.000Z",
  "issue": "6613a9c2f2c1a2f3d4e5f600",
  "vertical": "6613a9c2f2c1a2f3d4e5f611"
}
```

- `event` is either `"article.published"` (first publish or republish
  after unpublish) or `"article.updated"` (edit to an already-published
  article).
- `id`, `slug`, `title`, `publishedAt` are the article's top-level
  fields.
- `issue` and `vertical` are the related document IDs. If you want the
  full related objects, fetch them via the API (see section 4).

The notification is intentionally small. It tells you *what* changed,
not *everything about it* — that keeps the webhook fast and the cache
story simple.

### Expected response

- Return `200 OK` on success. Any 2xx is treated as delivered.
- Non-2xx responses are logged on the Payload side but do **not** retry
  automatically. If your site was down when the webhook fired, ask the
  editor to re-save the article, or trigger a manual backfill from the
  Payload API.
- Respond within ~10 seconds. Do the heavy work (fetching the article,
  warming caches) asynchronously if you need more time.

---

## 3. Security

- **Always verify the bearer token.** Reject any request whose
  `Authorization` header does not match the secret you share with the
  Transformidable team. Without this, anyone on the internet can
  trigger cache busts on your site.
- The secret should be a long random string (32+ bytes). Store it in
  your platform's secret manager, never in the repo.
- Treat the webhook as low-trust: validate the payload shape, reject
  unknown fields, and don't execute anything derived from the body
  beyond revalidation and content fetching.

---

## 4. Fetching full article content

The webhook only tells you an article changed. To render it, call the
Payload public REST API, which lives at:

```
https://<transformidable-domain>/api/articles
```

Anonymous reads are automatically filtered to `status = "published"`
(see `src/collections/Articles.ts`), so no auth is required for
published content.

### Fetch by slug

```
GET /api/articles?where[slug][equals]=<slug>&depth=2
```

- `depth=2` expands relationships (`issue`, `vertical`, `author`, etc.)
  two levels deep so you get nested objects, not just IDs.
- The response is a Payload list response:

```json
{
  "docs": [ { /* article */ } ],
  "totalDocs": 1,
  "limit": 10,
  "page": 1,
  "totalPages": 1
}
```

### Fetch only articles syndicated to your brand

Useful for backfills and full rebuilds:

```
GET /api/articles?where[syndicateTo][contains]=<your-brand-value>&where[status][equals]=published&depth=2&limit=100
```

Replace `<your-brand-value>` with your exact `syndicateTo` option value
(e.g. `agentpmo`, `lumynr`).

### Article shape (relevant fields)

| Field          | Type                  | Notes                                       |
| -------------- | --------------------- | ------------------------------------------- |
| `id`           | string                | Stable identifier.                          |
| `title`        | string                | Required.                                   |
| `slug`         | string                | URL-safe, auto-generated if left blank.     |
| `dek`          | string                | Editorial summary for TOC / preview.        |
| `body`         | Lexical rich text     | See section 5 for rendering notes.          |
| `readTime`     | number                | Minutes.                                    |
| `pullQuotes`   | array                 | `{ quote, position }`.                      |
| `publishedAt`  | ISO 8601 date string  |                                             |
| `issue`        | object (with `depth`) | Related issue document.                     |
| `vertical`     | object (with `depth`) | Related vertical document.                  |
| `syndicateTo`  | string[]              | Includes your brand value.                  |
| `status`       | string                | Will always be `"published"` for anon reads. |

The authoritative TypeScript types live in
`src/payload-types.ts` in the Transformidable repo. If your brand site
is TypeScript, ask the Transformidable team to share that file (or
publish it as an internal package) so you get type safety for free.

---

## 5. Rendering the article body

The `body` field is **Lexical rich text**, stored as a JSON tree. You
have three options, in order of effort:

1. **Use `@payloadcms/richtext-lexical/react`** — Payload ships a React
   renderer. If your brand site is Next.js / React, install it and
   pass the JSON directly:

   ```tsx
   import { RichText } from '@payloadcms/richtext-lexical/react'

   export function ArticleBody({ body }: { body: any }) {
     return <RichText data={body} />
   }
   ```

2. **Serialize to HTML on the Payload side.** If you'd rather not pull
   in the Lexical dependency, we can add a `bodyHtml` field to the
   Articles collection that's generated by a `beforeChange` hook. Ask
   the Transformidable team.

3. **Walk the JSON yourself.** Only do this if your stack can't use
   option 1 and you don't want option 2. The Lexical format is
   documented at <https://lexical.dev>.

---

## 6. Example: Next.js revalidate endpoint

Drop this into `app/api/revalidate/route.ts` on your brand site. Set
`SYNDICATION_SECRET` in your environment to match the secret registered
with the Transformidable team.

```ts
import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(req: Request) {
  const auth = req.headers.get('authorization') ?? ''
  const expected = `Bearer ${process.env.SYNDICATION_SECRET}`
  if (!process.env.SYNDICATION_SECRET || auth !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: {
    event?: string
    id?: string
    slug?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  if (!body?.slug) {
    return NextResponse.json({ error: 'missing slug' }, { status: 400 })
  }

  // Revalidate the individual article page and any index that lists it.
  revalidatePath(`/blog/${body.slug}`)
  revalidateTag('articles')

  return NextResponse.json({ ok: true, event: body.event, slug: body.slug })
}
```

If your brand site uses SSG without ISR (pure static build), your
handler should instead trigger a rebuild — e.g. call your Vercel Deploy
Hook or GitHub Actions workflow dispatch.

---

## 7. Example: generic revalidate endpoint (non-Next.js)

```ts
// Express / Fastify / Hono style — pseudocode
app.post('/api/revalidate', async (req, res) => {
  const auth = req.headers['authorization'] ?? ''
  if (auth !== `Bearer ${process.env.SYNDICATION_SECRET}`) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  const { event, slug } = req.body ?? {}
  if (!slug) return res.status(400).json({ error: 'missing slug' })

  // 1. Fetch the full article from Payload
  const url = new URL('https://<transformidable-domain>/api/articles')
  url.searchParams.set('where[slug][equals]', slug)
  url.searchParams.set('where[status][equals]', 'published')
  url.searchParams.set('depth', '2')
  const payloadRes = await fetch(url)
  const { docs } = await payloadRes.json()
  const article = docs?.[0]
  if (!article) return res.status(404).json({ error: 'not found' })

  // 2. Update your cache / CDN / search index however your stack works
  await yourCache.set(`article:${slug}`, article)
  await yourCdn.purge(`/blog/${slug}`)

  return res.json({ ok: true, event })
})
```

---

## 8. Initial backfill

When you first wire up the integration, existing published articles
won't have fired a webhook. Do a one-time backfill:

```
GET /api/articles
  ?where[syndicateTo][contains]=<your-brand-value>
  &where[status][equals]=published
  &depth=2
  &limit=200
```

Paginate with `page=1`, `page=2`, etc. until `docs` is empty. Process
each article exactly as you would a webhook notification.

---

## 9. Unpublish / delete behavior (current state)

As of today, the webhook only fires on create / update while an article
is in the `published` status. If an article is unpublished (status
changed to `draft`) or deleted, **no notification is sent**. If you
need to purge unpublished content automatically, ask the Transformidable
team to add an unpublish webhook — it's a small change.

Until then, the safest approach is to either:

- Run a nightly reconciliation job that re-fetches the list of
  currently-published articles from Payload and purges anything missing
  from your local store, or
- Have an editor ping the brand site owner when an article needs to
  come down.

---

## 10. Checklist for onboarding a new brand

- [ ] Brand site exposes `POST /api/revalidate` (or equivalent).
- [ ] Endpoint verifies `Authorization: Bearer <secret>`.
- [ ] Brand generates a long random secret and shares it with the
      Transformidable team (out of band).
- [ ] Transformidable team sets `SYNDICATE_<BRAND>_URL` and
      `SYNDICATE_<BRAND>_SECRET` in the Payload deployment.
- [ ] Brand runs an initial backfill from the Payload API.
- [ ] Transformidable editor test-publishes an article to that brand
      and the brand team confirms cache invalidation.
- [ ] Brand site documents its local setup (env vars, how to trigger a
      manual backfill).

---

## Questions

File an issue in `phousecos/transformidable-cms` or ping the
Transformidable team. The webhook source is in
`src/collections/hooks/syndicate.ts` and the Articles collection
config is in `src/collections/Articles.ts`.
