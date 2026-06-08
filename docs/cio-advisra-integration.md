# CIO Advisra ⇄ Transformidable Payload — Integration One-Sheet

**For:** the team building the CIO Advisra site.
**What this is:** how the Transformidable Payload CMS is structured and exactly
what CIO Advisra needs to do to pull and render articles. Payload is the single
source of truth; CIO Advisra is a **read-only consumer**.

---

## 1. The model in one paragraph

Editors (and an automated **n8n** pipeline) author **Articles** in Payload.
Each article is tagged with one editorial **Vertical**, zero-or-more **Topics**
(the capability areas below), and belongs to an **Issue**. Article body is
authored as **Markdown** (`bodyMarkdown`) and auto-converted to rich text
(`body`) on save. CIO Advisra reads published articles over Payload's REST API,
filters/personalizes by **Topic slug**, and renders the body.

---

## 2. What you consume — Articles

`GET {PAYLOAD_CMS_URL}/api/articles`

Base URL (production): `https://cms.transformidable.media`

### Fields you'll read off each article

| Field | Type | Notes |
|---|---|---|
| `id` | number | Stable identifier — safe to store/reference. |
| `slug` | string | URL slug, unique. |
| `title` | string | |
| `dek` | string \| null | Short editorial summary for cards/teasers. |
| `bodyMarkdown` | string | **Raw markdown — render this.** Source of truth. |
| `body` | Lexical JSON | Rich-text equivalent, auto-generated from `bodyMarkdown`. Read this only if you prefer rendering Lexical over markdown. |
| `topics` | array | Capability tags — **this is what you personalize on.** With `depth=1`, each is `{ id, name, slug }`. |
| `vertical` | object \| null | Editorial section, e.g. "Technology Strategy". `{ id, name, slug }` at `depth=1`. |
| `issue` | object \| null | The issue it belongs to. |
| `author` | object \| null | Byline (legacy field, still populated for some content). |
| `featuredImage` | object \| null | Upload object; `featuredImage.url` is the image URL at `depth=1`. |
| `readTime` | number \| null | Estimated minutes. |
| `pullQuotes` | array | Callout quotes (`quote`, `position`). |
| `publishedAt` | ISO date \| null | Use for recency sorting. |
| `status` | string | Always `published` for anything you can read anonymously. |

> **Body rendering — pick one:** render `bodyMarkdown` with any Markdown
> renderer (simplest, recommended), **or** render the Lexical `body`. They are
> the same content. Don't render both.

---

## 3. Topics — the controlled vocabulary you match on

Topics are a Payload collection (`/api/topics`) and a multi-relationship on
each Article. **Match by `slug`** — slugs are the stable contract:

| slug | name |
|---|---|
| `governance-strategy` | Governance & Strategy |
| `security-risk` | Security & Risk |
| `operations` | Operations |
| `infrastructure` | Infrastructure |
| `data-information` | Data & Information |
| `people-capability` | People Capability |

These are seeded automatically. New topics may be added later — fetch
`/api/topics` if you want the live list rather than hardcoding.

---

## 4. The queries to issue

All reads should be **published-only**. Anonymous requests are automatically
restricted to `status = published`, so no token is required for published
content (see §6).

```http
# Feed, newest first, with relationships expanded
GET /api/articles?where[status][equals]=published
  &depth=1&limit=50&sort=-publishedAt

# Filter by one or more topic slugs (personalization)
GET /api/articles?where[status][equals]=published
  &where[topics.slug][in]=governance-strategy,security-risk
  &depth=1&sort=-publishedAt

# A single article by slug
GET /api/articles?where[status][equals]=published
  &where[slug][equals]=some-article&depth=1&limit=1

# Specific articles by id
GET /api/articles?where[status][equals]=published
  &where[id][in]=12,34,56&depth=1
```

`depth=1` is important: it returns `topics`, `vertical`, `issue`, `author`,
and `featuredImage` as nested objects (with `.slug` / `.url`) instead of bare
ids.

### Response shape

Standard Payload list envelope:

```json
{ "docs": [ { /* article */ } ], "totalDocs": 42, "page": 1, "totalPages": 1, "limit": 50 }
```

---

## 5. The structure behind it (reference)

| Collection | Slug | Role |
|---|---|---|
| Articles | `articles` | The content you consume. |
| Topics | `topics` | Capability tags (§3). |
| Verticals | `verticals` | Editorial sections (e.g. Technology Strategy). |
| Issues | `issues` | Magazine issues an article belongs to. |
| Authors | `authors` | Bylines. |
| Media | `media` | Uploaded images (referenced by `featuredImage`). |

`bodyMarkdown` → `body` conversion is a `beforeValidate` hook on Articles, so
the markdown an editor or n8n submits is always reflected in the rich-text
`body` you can read.

---

## 6. Access, auth, CORS

- **Published content is publicly readable** — anonymous API requests are
  filtered to `status = published`. You likely need **no token** to read the
  feed. (Drafts and unpublished content require an authenticated Payload user
  and are never exposed anonymously.)
- **Fetch server-side.** Do your API calls from the CIO Advisra server (SSR /
  route handlers / build step), not the browser. Server-to-server requests
  aren't subject to CORS.
- **If you must fetch from the browser**, the CIO Advisra origin has to be
  added to the `cors` array in `src/payload.config.ts` on the Payload side —
  it is **not** currently listed. Ask the Transformidable team to add it.

---

## 7. Open decision — how CIO Advisra content is designated

Today there is **no per-article "this belongs to CIO Advisra" flag**. Options,
in order of preference:

1. **Consume by Topic** (no Payload change). CIO Advisra pulls all published
   articles and filters/ranks by the topic slugs in §3. Simplest; ship now.
2. **Add a brand designation.** If you need an explicit "publish to CIO
   Advisra" switch (and a push notification when one is published), the
   Transformidable team can add `cio-advisra` to the existing **Syndicate To**
   field and register a CIO Advisra revalidate webhook — same mechanism the
   other brand sites use (see `docs/syndication-integration.md`).

Pick (1) to launch; move to (2) if/when you want editor-controlled targeting
and push-based revalidation.
