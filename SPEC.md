# Transformidable CMS — System Specification

> **Last updated:** 2026-03-04
> **Status:** Phase 1 complete — Content management foundation deployed

---

## 1. Overview

Transformidable CMS is a headless content management system built on **Payload CMS v3** (3.14.x) with **Next.js 15** as its application framework. It serves as the central content hub for the Transformidable media ecosystem, providing structured authoring, role-based workflows, and a REST/GraphQL API that downstream publication sites consume.

### Production URLs

| Service | URL |
|---------|-----|
| CMS Admin | `https://cms.transformidable.media/admin` |
| REST API | `https://cms.transformidable.media/api/<collection>` |
| GraphQL | `https://cms.transformidable.media/api/graphql` |
| Media Assets | Served via Vercel Blob Storage (`assets.transformidable.media`) |

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| CMS Framework | Payload CMS | ^3.14.0 |
| App Framework | Next.js | 15.4.11 |
| Language | TypeScript | ^5.7.0 |
| Database | PostgreSQL (Neon on Vercel) | — |
| DB Adapter | `@payloadcms/db-postgres` | ^3.14.0 |
| Rich Text | Lexical (`@payloadcms/richtext-lexical`) | ^3.14.0 |
| Media Storage | Vercel Blob (`@payloadcms/storage-vercel-blob`) | ^3.14.0 |
| Image Processing | sharp | 0.32.6 |
| Runtime | Node.js | 22.x LTS |
| Hosting | Vercel | — |
| Package Manager | npm | — |

---

## 3. Collections

### 3.1 Users (`users`)

Authentication-enabled collection managing CMS operator accounts.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | email (built-in auth) | Yes | Used as admin title |
| `firstName` | text | No | |
| `lastName` | text | No | |
| `role` | select | Yes | Default: `brandContributor` |
| `assignedBrandPillar` | relationship → `brand-pillars` | No | Shown only when role = `brandContributor` |

**Roles:**
- `admin` — Full access to all collections and settings
- `editor` — Read/write on content collections; cannot manage users or brand pillars
- `brandContributor` — Scoped to content tagged with their assigned brand pillar
- `sponsorManager` — Access limited to the Sponsors collection

**Access control:**
- Create/delete: admin only
- Read: any logged-in user
- Update: admin sees all; non-admins can only update their own record
- `role` field update: admin only

### 3.2 Media (`media`)

Upload-enabled collection for images, audio files, and PDFs.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `alt` | text | Yes | Accessibility description |
| `caption` | text | No | |

**Upload configuration:**
- Accepted MIME types: `image/*`, `audio/*`, `application/pdf`
- Auto-generated image sizes:
  - `thumbnail` — 300 × 300
  - `card` — 768 × 432
  - `hero` — 1920 × 1080

**Storage:** When `BLOB_READ_WRITE_TOKEN` is set, media is stored in Vercel Blob Storage. Falls back to local filesystem otherwise.

**Access control:**
- Create: admin, editor, or brand contributor
- Read: public (unauthenticated)
- Update: admin or editor
- Delete: admin only

### 3.3 Articles (`articles`)

Primary written content collection with draft versioning.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | text | Yes | Used as admin title |
| `slug` | text | Yes | Unique; auto-generated from title via `beforeValidate` hook |
| `body` | richText (Lexical) | Yes | |
| `excerpt` | textarea | No | 2–3 sentence summary for cards/previews |
| `author` | relationship → `authors` | Yes | |
| `publishDate` | date (day + time picker) | No | |
| `featuredImage` | upload → `media` | No | |
| `brandPillars` | relationship → `brand-pillars` | No | hasMany; controls where content surfaces |
| `syndicateTo` | select | No | hasMany; options: `jerribland`, `unlimitedpowerhouse`, `agentpmo`, `prept`, `lumynr` |
| `status` | select | Yes | Default: `draft`; options: `draft`, `review`, `scheduled`, `published` |
| `seoTitle` | text | No | Override for `<title>` tag |
| `seoDescription` | textarea | No | Override for meta description |
| `isMemberOnly` | checkbox | No | Default: `false`; flags Lumynr-exclusive content |

**Versioning:** Drafts enabled (`versions.drafts: true`)

**Searchable fields:** `title`, `excerpt`

**Access control:**
- Create: admin, editor, or brand contributor
- Read (unauthenticated): published articles only
- Read (admin/editor): all articles
- Read (brand contributor): published articles + articles tagged with their assigned pillar
- Update (admin/editor): all articles
- Update (brand contributor): only articles tagged with their assigned pillar
- Delete: admin only
- `status` field update: admin or editor only

### 3.4 Podcast Episodes (`podcast-episodes`)

Audio content collection with draft versioning.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | text | Yes | Used as admin title |
| `slug` | text | Yes | Unique; auto-generated from title |
| `episodeNumber` | number | Yes | |
| `season` | number | Yes | Default: `1` |
| `description` | textarea | No | Show notes summary |
| `audioUrl` | text | No | Embed URL or hosted file path |
| `transcript` | richText (Lexical) | No | Full episode transcript |
| `showNotes` | richText (Lexical) | No | Links, references, resources |
| `guest` | relationship → `authors` | No | Guest appearing on episode |
| `publishDate` | date (day + time picker) | No | |
| `featuredImage` | upload → `media` | No | Episode artwork |
| `brandPillars` | relationship → `brand-pillars` | No | hasMany |
| `syndicateTo` | select | No | hasMany; same options as Articles |
| `status` | select | Yes | Default: `draft`; options: `draft`, `review`, `scheduled`, `published` |

**Versioning:** Drafts enabled

**Access control:**
- Create/update: admin or editor
- Read (unauthenticated): published episodes only
- Read (admin/editor): all episodes
- Delete: admin only

### 3.5 Authors (`authors`)

Profiles for writers, contributors, and podcast guests.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | text | Yes | Used as admin title |
| `bio` | textarea | No | |
| `headshot` | upload → `media` | No | |
| `role` | text | No | e.g., "Founder & CEO, Powerhouse Industries" |
| `associatedBrand` | relationship → `brand-pillars` | No | |
| `type` | select | Yes | Default: `staff`; options: `staff`, `guestContributor`, `podcastGuest` |
| `socialLinks` | array | No | Each entry: `platform` (select) + `url` (text) |
| `isActive` | checkbox | No | Default: `true` |

**Social link platforms:** `linkedin`, `twitter`, `website`, `instagram`, `other`

**Access control:**
- Create/update: admin or editor
- Read: public (unauthenticated)
- Delete: admin only

### 3.6 Brand Pillars (`brand-pillars`)

Defines the brand verticals in the Transformidable ecosystem. Used to scope content and contributor access.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | text | Yes | Unique; used as admin title |
| `slug` | text | Yes | Unique; auto-generated from name |
| `mappedDomain` | text | Yes | e.g., `unlimitedpowerhouse.com` |
| `contentFocus` | textarea | No | Brief description of the pillar's content focus |

**Access control:** Admin only for create/update/delete; public read.

### 3.7 Sponsors (`sponsors`)

Advertising and sponsorship campaign management.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `brandName` | text | Yes | Used as admin title |
| `logo` | upload → `media` | No | |
| `adCreative` | array | No | Each entry: `label` (text), `asset` (upload → media), `format` (select: image/audio/html) |
| `placementType` | select | Yes | hasMany; options: `podcastMidRoll`, `articleSidebar`, `newsletter` |
| `campaignStartDate` | date | Yes | |
| `campaignEndDate` | date | Yes | |
| `linkUrl` | text | Yes | Click destination URL |
| `isActive` | checkbox | No | Default: `true` |

**Access control:**
- Create/read/update: sponsor manager or admin
- Delete: admin only

### 3.8 Newsletter Issues (`newsletter-issues`)

Curated newsletter issues assembling articles and podcast episodes.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `issueNumber` | number | Yes | Unique |
| `issueLabel` | text | — | Auto-computed hidden field: `"Issue #<issueNumber>"` |
| `issueDate` | date | Yes | |
| `editorsNote` | richText (Lexical) | No | Brief intro from Jerri |
| `featuredArticles` | relationship → `articles` | No | hasMany; 2–3 featured articles |
| `featuredEpisode` | relationship → `podcast-episodes` | No | |
| `status` | select | Yes | Default: `draft`; options: `draft`, `scheduled`, `sent` |

**Access control:**
- Create/update: admin or editor
- Read (unauthenticated): sent issues only
- Read (admin/editor): all issues
- Delete: admin only

---

## 4. Access Control Model

### 4.1 Roles

| Role | Scope |
|------|-------|
| `admin` | Full CRUD on all collections; user management; brand pillar management |
| `editor` | Full read/write on content (articles, episodes, newsletters, authors, media); cannot manage users or brand pillars |
| `brandContributor` | Create articles; read/update articles scoped to their assigned brand pillar; upload media |
| `sponsorManager` | CRUD on sponsors collection only |

### 4.2 Shared Access Helpers

Defined in `src/access/checkRole.ts`:

| Helper | Grants access to |
|--------|-----------------|
| `isAdmin` | admin |
| `isAdminOrEditor` | admin, editor |
| `isAdminOrEditorOrContributor` | admin, editor, brandContributor |
| `isSponsorManagerOrAdmin` | sponsorManager, admin |
| `isLoggedIn` | Any authenticated user |
| `isAdminFieldAccess` | admin (field-level) |
| `isAdminOrEditorFieldAccess` | admin, editor (field-level) |

### 4.3 Public API Access

The following data is readable without authentication:
- Media files
- Authors
- Brand Pillars
- Published articles (`status = 'published'`)
- Published podcast episodes (`status = 'published'`)
- Sent newsletter issues (`status = 'sent'`)

---

## 5. Syndication Model

Articles and Podcast Episodes carry a `syndicateTo` multi-select field with these brand property targets:

| Value | Domain |
|-------|--------|
| `jerribland` | jerribland.com |
| `unlimitedpowerhouse` | unlimitedpowerhouse.com |
| `agentpmo` | agentpmo.com |
| `prept` | prept.com |
| `lumynr` | lumynr.com |

Publication sites query the API filtering by their `syndicateTo` value to pull only content designated for their property. Brand Pillars additionally provide a `mappedDomain` field to associate structural taxonomy with specific domains.

---

## 6. API Surface

Payload CMS v3 auto-generates both REST and GraphQL APIs for all collections.

### 6.1 REST Endpoints

Each collection exposes standard CRUD endpoints:

```
GET    /api/<slug>           — List (with pagination, filtering, sorting)
GET    /api/<slug>/:id       — Get by ID
POST   /api/<slug>           — Create
PATCH  /api/<slug>/:id       — Update
DELETE /api/<slug>/:id       — Delete
```

**Available collection slugs:**
`users`, `media`, `articles`, `podcast-episodes`, `authors`, `brand-pillars`, `sponsors`, `newsletter-issues`

### 6.2 GraphQL

Full GraphQL API available at `/api/graphql` with introspection enabled.

### 6.3 Authentication

- `POST /api/users/login` — Returns JWT token
- `POST /api/users/logout` — Invalidates session
- Auth tokens passed via `Authorization: Bearer <token>` header or cookie

### 6.4 Filtering for Publication Sites

Example query to fetch articles syndicated to a specific brand:

```
GET /api/articles?where[status][equals]=published&where[syndicateTo][contains]=unlimitedpowerhouse&depth=2
```

The `depth` parameter controls relationship population (e.g., `depth=2` populates author and featured image).

---

## 7. Infrastructure & Deployment

### 7.1 Hosting

- **Platform:** Vercel
- **Framework preset:** Next.js (configured in `vercel.json`)
- **Node.js runtime:** 22.x LTS

### 7.2 Database

- **Provider:** Neon (PostgreSQL on Vercel)
- **Connection:** Via `POSTGRES_URL` or `DATABASE_URL` environment variable
- **SSL:** Automatically set to `sslmode=no-verify` on Vercel to accept Neon's certificate
- **Schema management:** `push: true` in the Postgres adapter (schema sync on startup)

### 7.3 Build Pipeline

```
npm run build
  → tsx src/migrate.ts        # Push schema + run pending migrations
  → payload generate:importmap
  → next build
```

The custom `src/migrate.ts` script:
1. Initializes a Payload instance
2. Calls Drizzle Kit's `pushSchema()` directly (bypasses interactive prompts for CI)
3. Logs warnings and applies schema changes
4. Runs any pending Payload migration files
5. Exits cleanly

### 7.4 Environment Variables

| Variable | Purpose |
|----------|---------|
| `POSTGRES_URL` | PostgreSQL connection string (Vercel) |
| `DATABASE_URL` | PostgreSQL connection string (local dev fallback) |
| `PAYLOAD_SECRET` | JWT signing and encryption secret |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Storage token for media uploads |
| `NEXT_PUBLIC_SERVER_URL` | Base URL for the CMS |
| `VERCEL` | Set automatically by Vercel; triggers SSL config |
| `VERCEL_PROJECT_PRODUCTION_URL` | Auto-set; used to derive `serverURL` |

### 7.5 Media Storage

When `BLOB_READ_WRITE_TOKEN` is present, the Vercel Blob Storage plugin handles all media uploads. In local development without the token, files are stored on the local filesystem.

---

## 8. Project Structure

```
transformidable-cms/
├── src/
│   ├── access/
│   │   └── checkRole.ts              # Role-checking helpers & access functions
│   ├── app/
│   │   ├── (diagnostic)/             # Health & diagnostic routes (dev/ops)
│   │   │   ├── api/diag/route.ts
│   │   │   ├── health/route.ts
│   │   │   ├── layout.tsx
│   │   │   └── test/page.tsx
│   │   ├── (payload)/                # Payload admin UI & API routes
│   │   │   ├── admin/
│   │   │   │   ├── [[...segments]]/  # Catch-all admin pages
│   │   │   │   └── importMap.js      # Auto-generated import map
│   │   │   ├── api/[...slug]/route.ts
│   │   │   ├── layout.tsx            # Root layout with Payload CSS
│   │   │   └── page.tsx
│   │   └── global-error.tsx
│   ├── collections/
│   │   ├── Articles.ts
│   │   ├── Authors.ts
│   │   ├── BrandPillars.ts
│   │   ├── Media.ts
│   │   ├── NewsletterIssues.ts
│   │   ├── PodcastEpisodes.ts
│   │   ├── Sponsors.ts
│   │   └── Users.ts
│   ├── migrations/
│   │   └── index.ts
│   ├── migrate.ts                    # Custom schema push script for CI
│   ├── payload.config.ts             # Main Payload configuration
│   └── payload-types.ts              # TypeScript type definitions
├── .env.example
├── next.config.mjs
├── package.json
├── tsconfig.json
└── vercel.json
```

---

## 9. What Has NOT Been Built Yet

The following capabilities are **not yet implemented** and would be needed for downstream publication sites:

1. **Globals** — No site-wide settings, navigation configs, or footer content globals have been defined
2. **Webhooks / Revalidation hooks** — No `afterChange` hooks to trigger ISR revalidation on publication sites when content is published or updated
3. **Scheduled publishing** — The `scheduled` status exists in the schema but there is no cron job or serverless function to auto-transition content to `published` at the `publishDate`
4. **Content preview** — No draft preview integration for publication sites to preview unpublished content
5. **Search indexing** — No Payload search plugin or Algolia/Meilisearch integration
6. **Email / Newsletter delivery** — The Newsletter Issues collection stores issue data but does not integrate with an email delivery service (e.g., Resend, SendGrid)
7. **Analytics / impression tracking** — Sponsors collection has no click/impression tracking mechanism
8. **Custom admin components** — No custom React components in the admin UI beyond the default Payload interface
9. **Seed data** — No seed script or fixture data for development/staging
10. **Tests** — No unit or integration test suite
11. **CORS configuration** — No explicit CORS settings for cross-origin API access from publication site domains

---

## 10. API Consumption Guide for Publication Sites

Publication sites should query the Payload REST API to fetch content. Key patterns:

### Fetch published articles for a specific brand

```
GET /api/articles?where[status][equals]=published&where[syndicateTo][contains]={brand}&sort=-publishDate&depth=2&limit=10
```

### Fetch a single article by slug

```
GET /api/articles?where[slug][equals]={slug}&where[status][equals]=published&depth=2
```

### Fetch published podcast episodes

```
GET /api/podcast-episodes?where[status][equals]=published&sort=-publishDate&depth=2
```

### Fetch active sponsors for a placement type

```
GET /api/sponsors?where[isActive][equals]=true&where[placementType][contains]={type}&where[campaignStartDate][less_than_equal]={today}&where[campaignEndDate][greater_than_equal]={today}&depth=1
```

### Fetch the latest sent newsletter issue

```
GET /api/newsletter-issues?where[status][equals]=sent&sort=-issueDate&limit=1&depth=2
```

### Fetch all brand pillars

```
GET /api/brand-pillars?depth=0
```

### Fetch authors

```
GET /api/authors?where[isActive][equals]=true&depth=1
```

> **Note:** All responses follow Payload's standard pagination format with `docs`, `totalDocs`, `page`, `totalPages`, `hasNextPage`, and `hasPrevPage` fields.
