# Transformidable / Payload CMS — CIO Advisra Integration Spec

**Audience:** whoever maintains the Payload CMS in the Transformidable repo.
**Author side:** CIO Advisra portal (separate repo/app). This documents what
the portal's content-consumption layer (`lib/payload/`) expects from Payload.
**Status:** the portal side is built and dormant; it lights up the moment
Payload satisfies this contract and the two env vars are set. Nothing here
requires the portal to change — it's all Payload-side.

> **Why this exists.** CIO Advisra and Transformidable share one Payload
> instance as the editorial backbone. Articles are authored once in Payload
> and consumed by the portal over the REST API. The portal personalizes the
> feed per member using **tag overlap** — so the article's tags and the
> member's profile tags must speak the **same controlled vocabulary**. That
> shared vocabulary is the entire integration. If the slugs don't match,
> nothing surfaces (no error — just an empty/weakly-ranked feed).

---

## 0. TL;DR — what almost certainly needs to be added

Based on the current Payload state, the likely gaps (confirm against your
schema):

| Item | Status | Action |
|---|---|---|
| **Topics collection + slugs** | ❌ likely missing | Create the `topics` collection and seed the 9 higher-ed slugs in §3.4. |
| **Verticals collection + slugs** | ❌ likely missing | Create the `verticals` collection and seed the 7 slugs in §3.3 (incl. `evergreen`). |
| **`brand` dimension on Articles** | ⚠️ confirm | Articles must carry brand `cio-advisra` (§3.2). |
| **`audienceTier` field** | ⚠️ confirm | Gating dimension (§3.5). |
| **`pillars` slugs match our codes** | ⚠️ confirm | Pillar slugs must equal the 6 codes in §3.4 **exactly** (uppercase, underscored). |
| **`bodyFormat` field on Articles** | ❌ likely missing | Add a select `markdown` / `html` / `lexical` so the reader renders `body` correctly (§3.6a). `markdown` is the automation-friendly option (e.g. n8n). |
| **Published-content read API token** | ⚠️ confirm | A service token scoped to read published, brand-tagged content (§4). |

The public homepage **Insights** section has a hard minimum field set — see
§3.8. Everything else (sections, issues, authors) is conventional Payload and
probably already exists in some form.

---

## 1. The wall (read this before designing fields)

The portal keeps a hard separation:

- **Payload = shared editorial.** Articles are brand/vertical/pillar/topic
  **designated**, never targeted at one customer account.
- **Per-account personalization lives in the portal's own database
  (Supabase), never in Payload.** The portal reads the member's profile and
  ranks your articles at read time. It stores no per-member data in Payload.

**One consequence for you:** there is **no "recommend this article to
customer X" field** on the Article. The portal models advisor
recommendations on its own side as a record that *points at* a Payload
article by `id`. You don't build anything for that — just keep article `id`s
stable.

---

## 2. The API contract the portal calls

The portal's client (`lib/payload/client.ts`) makes these requests. Confirm
each works against your deployment, or tell us where it differs (both are
one-line changes on our side — see §6 open questions).

### 2.1 Endpoint

```
GET {PAYLOAD_CMS_URL}/api/articles
```

Standard Payload REST collection endpoint for a collection with slug
`articles`. If your collection slug differs, tell us.

### 2.2 Auth

```
Authorization: Bearer {PAYLOAD_API_TOKEN}
Content-Type: application/json
```

We assumed a bearer token. Payload's API-key auth header is sometimes
`Authorization: {collectionSlug} API-Key {token}` instead. **Confirm which
form your deployment expects** (§6, Q1). The token must be scoped to **read
published content** only.

### 2.3 Queries the portal issues

All queries are **brand-scoped and published-only** — the portal never asks
for drafts or other brands:

```
# List / feed (the main magazine query)
?where[brand.slug][equals]=cio-advisra
&where[status][equals]=published
&where[verticals.slug][in]=higher-ed,evergreen   # member's vertical + evergreen
&where[audienceTier][in]=public,any-member,CORE  # tiers the viewer may see
&depth=1                                          # relationships as objects, not ids
&limit=50&page=1&sort=-publishedAt

# Single article by slug
?where[brand.slug][equals]=cio-advisra&where[status][equals]=published
&where[slug][equals]=some-article&depth=1&limit=1

# Specific articles by id (advisor recommendations resolve through this)
?where[brand.slug][equals]=cio-advisra&where[status][equals]=published
&where[id][in]=abc,def,ghi&depth=1

# Optional narrowing also used:
&where[section.slug][equals]=...   # a standing department
&where[issue.slug][equals]=...     # a monthly issue/theme
```

`depth=1` is required so relationships come back as nested objects (with
`slug`/`name`), not bare ids — the portal reads `.slug` off each relation.

### 2.4 Expected response shape

Standard Payload list envelope: `{ docs: [...], totalDocs, ... }`. The
portal reads these fields off each `doc` (anything missing degrades to a
safe default — it won't crash, but the field won't personalize):

| Field consumed | Type | Notes |
|---|---|---|
| `id` | string | Must be stable (recommendations point at it). |
| `slug` | string | Article URL slug. |
| `title` | string | |
| `dek` | string \| null | Subhead/summary. |
| `body` | rich text / HTML | Opaque to the portal; rendered as-is. Omit on list queries if you like. |
| `heroImage.url` *or* `heroImageUrl` | string \| null | Either shape accepted. |
| `publishedAt` | ISO date string | Drives recency ranking. |
| `status` | `'published'` | |
| `brand.slug` | string | Must be `cio-advisra`. |
| `verticals[].slug` | string[] | See §3.3. |
| `pillars[].slug` | string[] | See §3.4 — **must equal our pillar codes**. |
| `topics[].slug` | string[] | See §3.4. |
| `section` | `{id,slug,name}` \| null | |
| `issue` | `{id,slug,title}` \| null | |
| `author` | `{id,name,slug}` \| null | |
| `audienceTier` | enum | See §3.5. |
| `contentKind` | enum | See §3.6. |
| `sourceUrl` | string \| null | For summarize-and-link / licensed items. |

---

## 3. Required collections, fields & controlled vocabularies

### 3.1 Articles collection — designation fields

Beyond the usual editorial fields (`title`, `slug`, `dek`, `body`,
`heroImage`, `publishedAt`, `status`, author/section/issue relations), each
Article needs these **designation** fields:

- `brand` — relationship/select, the brand this article belongs to (§3.2).
- `verticals` — multi relationship to Verticals (§3.3).
- `pillars` — multi relationship to Pillars (§3.4).
- `topics` — multi relationship to Topics (§3.4).
- `audienceTier` — select, the gating dimension (§3.5).
- `contentKind` — select, content-rights posture (§3.6).
- `sourceUrl` — text, for non-owned content (§3.6).
- `bodyFormat` — select, how `body` is encoded so the reader renders it
  correctly (§3.6a): `markdown` | `html` | `lexical`.

### 3.2 Brand

The portal scopes every query to brand slug **`cio-advisra`**. Articles
intended for the CIO Advisra portal must carry this brand. (Articles for
other Transformidable brands are simply never fetched by the portal.)

### 3.3 Verticals — **likely needs creating**

A `verticals` collection (slug + name), seeded with these exact slugs. They
mirror the portal's sector taxonomy (lowercased, hyphenated):

| slug | name |
|---|---|
| `higher-ed` | Higher Education |
| `government` | Government |
| `healthcare` | Healthcare |
| `financial-services` | Financial Services |
| `nonprofit` | Nonprofit |
| `professional-services` | Professional Services |
| `other` | Other |
| `evergreen` | Evergreen (cross-vertical) |

**`evergreen` is special:** the portal always includes `evergreen` articles
for every member regardless of their vertical. Tag any cross-vertical /
"applies to everyone" content with `evergreen`.

> **Launch reality:** higher education is vertical #1. At launch the only
> verticals that need real content are `higher-ed` and `evergreen`. The
> others can exist as empty taxonomy for later.

### 3.4 Pillars & Topics — **the join that must match exactly**

**Pillars** (a `pillars` collection — may already exist for Transformidable;
if so, just confirm the slugs). The portal's pillar **codes are the slugs**
— uppercase, underscored, verbatim:

| slug (= code) | display name |
|---|---|
| `GOVERNANCE_STRATEGY` | Governance and Strategy |
| `SECURITY_RISK` | Security and Risk |
| `OPERATIONS` | Operations |
| `INFRASTRUCTURE` | Infrastructure |
| `DATA_INFORMATION` | Data and Information |
| `PEOPLE_CAPABILITY` | People and Capability |

> ⚠️ These are **not** kebab-case. If your Payload pillar slugs are
> `governance-strategy` etc., either change them to match, or tell us and
> we'll map — but matching is cleaner. The portal joins article pillars to
> the member's `focusPillars` and to their Health Score pillar gaps using
> these exact strings.

**Topics** — **almost certainly needs creating.** A `topics` collection
(slug + name). Topics are **vertical-scoped**; this is the **higher-ed
launch set** (the only one needed at launch):

| slug | label |
|---|---|
| `ai` | AI |
| `cybersecurity` | Cybersecurity |
| `erp-workday` | ERP & Workday |
| `cloud-strategy` | Cloud strategy |
| `data-governance` | Data governance |
| `it-funding` | IT funding |
| `change-management` | Change management |
| `vendor-management` | Vendor management |
| `compliance-audit` | Compliance & audit |

When a second vertical launches, it adds a new topic set — no schema change,
just more rows.

### 3.5 `audienceTier` — gating

The portal enforces the paywall (Payload only *stores* the designation).
`audienceTier` is a single select with these exact values:

| value | who sees it |
|---|---|
| `public` | everyone, including anonymous visitors (the acquisition surface) |
| `any-member` | any signed-in subscriber (any paid tier) |
| `CORE` | CORE tier and above |
| `SIGNATURE` | SIGNATURE tier and above |
| `STRATEGIC` | STRATEGIC tier only |

Higher tiers inherit everything below them (a STRATEGIC member sees CORE-
and SIGNATURE-gated content). Default new articles to `public` or
`any-member` unless they're premium.

### 3.6 `contentKind` — content rights

Governs how the portal renders the piece. Single select:

| value | meaning | `sourceUrl` |
|---|---|---|
| `owned` | CIO Advisra owns it; render full text | not needed |
| `summarize_and_link` | third-party; show a summary + link out | **required** |
| `licensed` | licensed full text | optional |

Default `owned`.

### 3.6a `bodyFormat` — how the body is encoded

The reader needs to know how to interpret `body`. Single select:

| value | meaning |
|---|---|
| `markdown` | Markdown source — the portal converts it to HTML at render time. **Recommended for automated publishing (e.g. n8n):** push the article text as markdown and set `bodyFormat=markdown`. |
| `html` | Raw HTML — rendered as-is. |
| `lexical` | Payload rich-text (Lexical JSON) — full rich rendering lands with the in-portal editor; until then the reader falls back to the dek. |

> ⚠️ **If `bodyFormat` is absent, a string `body` is treated as HTML** for
> backward compatibility — so markdown sent without the flag will render
> literal `##` / `**`. Always set `bodyFormat=markdown` when sending markdown.

### 3.7 Sections, Issues, Authors

Conventional, probably already present:

- **Sections** — standing departments (slug + name). Optional per article.
- **Issues** — monthly themes (slug + title). Optional per article.
- **Authors** — bylines (name + slug). Optional per article.

No special vocabulary required; the portal just displays them.

### 3.8 Homepage "Insights" section — minimum required fields

The public marketing homepage renders an **Insights** strip: the latest
public articles as cards (pillar chip · "Updated" date · title · dek),
each linking to the in-portal reader at `/insights/<slug>`. It queries
**published + brand `cio-advisra` + `audienceTier=public`**, newest first,
top 6. For an article to appear there correctly:

**Required — miss one and the card won't show, or shows wrong:**

| field | rule |
|---|---|
| `brand` | slug exactly `cio-advisra` |
| `status` | `published` |
| `audienceTier` | exactly `public` (anything else stays off the public page; it still appears in the member Library) |
| `title` | the card heading |
| `slug` | url-safe; the `/insights/<slug>` reader link |
| `publishedAt` | a real date — drives sort order **and** the "Updated" label |
| `pillars` | at least one, slug = one of the 6 codes in §3.4 (drives the pillar chip) |

**Strongly recommended:**

| field | why |
|---|---|
| `dek` | the card description under the title |
| `body` + `bodyFormat` | the reader-page content; set `bodyFormat=markdown` for n8n (§3.6a) |
| `contentKind` | defaults `owned`; if `summarize_and_link`, `sourceUrl` is required |

**Optional (not shown on the card; used by the reader / portal feed):**
`heroImage`, `author`, `section`, `issue`, `verticals`, `topics`.

> The same articles also fill the member **Library** (every published,
> brand-scoped article, any `audienceTier`) and the per-member **For you**
> feed (ranked by `verticals` / `pillars` / `topics`). Tagging an article
> well makes it land correctly across all three surfaces.

---

## 4. Environment / access handshake

The portal needs two pieces of config (already wired on our side as optional
env vars — until both are set, the portal runs with an empty feed and no
errors):

1. **`PAYLOAD_CMS_URL`** — base URL of the Payload deployment (no trailing
   slash), e.g. `https://cms.transformidable.com`.
2. **`PAYLOAD_API_TOKEN`** — a service token/API key scoped to **read
   published content** for the `cio-advisra` brand. Read-only is sufficient;
   the portal never writes to Payload.

**CORS / network:** requests come from the CIO Advisra Vercel deployment
(server-side, so it's server-to-server — not a browser fetch — but if any
edge/WAF rules apply, allow the portal's deployment). Confirm the token has
no IP allowlist that would block Vercel's egress.

---

## 5. Migration checklist (Payload side)

- [ ] Create/confirm `verticals` collection; seed the 8 slugs in §3.3
      (including `evergreen`).
- [ ] Create `topics` collection; seed the 9 higher-ed slugs in §3.4.
- [ ] Confirm/relabel `pillars` slugs to the 6 codes in §3.4 (exact case).
- [ ] Add `brand` to Articles; tag CIO Advisra content `cio-advisra`.
- [ ] Add `audienceTier` select to Articles (§3.5); set a sensible default.
- [ ] Add `contentKind` select + `sourceUrl` to Articles (§3.6).
- [ ] Confirm `verticals`, `pillars`, `topics` are multi-relationships on
      Articles and return `.slug` at `depth=1`.
- [ ] Issue a read-scoped service token; send us `PAYLOAD_CMS_URL` + token
      (securely).
- [ ] Tag at least a handful of published higher-ed + evergreen articles so
      we can validate the feed end-to-end.

---

## 6. Open questions for Transformidable (we need answers to finalize)

1. **Auth header form** — does the token go as `Authorization: Bearer
   {token}`, or Payload's `Authorization: {collectionSlug} API-Key {token}`?
2. **Articles collection slug** — is it `articles` (so `/api/articles`), or
   something else?
3. **Pillar slugs** — do they already exist, and in what case? (We need
   `GOVERNANCE_STRATEGY` form; tell us if yours differ so we map vs. you
   relabel.)
4. **`heroImage`** — does it return a nested upload object with `.url`, or a
   flat URL string? (We handle either, just confirming.)
5. **Rate limits / caching** — any constraints? The portal caches list
   queries for ~1 hour by default; we can tune.

---

*Generated from the CIO Advisra consumption layer (`lib/payload/`). The
vocabularies above are pulled from the portal's source of truth
(`lib/validation/profile.ts`, the seeded `Pillar` and `SectorTaxonomy`
tables) — they are authoritative for the portal side. If Payload can't match
a slug exactly, flag it and we'll add a mapping rather than have you fight
your own conventions.*
