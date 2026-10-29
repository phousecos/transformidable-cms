# Moving to the J. Lynne Cloudflare account

One Payload instance for Transformidable and the J. Lynne library, running in
the **J. Lynne** Cloudflare account with its admin at **transformidable.net/admin**.

**Nothing is deleted along the way.** The current Transformidable Worker and
jlynne.io keep running, untouched, until each is switched off on purpose
later.

## Where everything lives

| | Before | After |
| --- | --- | --- |
| Code | transformidable-cms, jlynne-cms | transformidable-cms only (wrangler.jlynne.jsonc) |
| Worker | `transformidable-cms` (Transformidable account), `jlynne-cms` (J. Lynne account) | `transformidable-cms` (J. Lynne account) |
| Database | **Supabase Postgres** (Transformidable); D1 `jlynne-cms` (J. Lynne) | **Supabase Postgres**, the same database, reached through a Hyperdrive in the J. Lynne account |
| Files | R2 `transformidable-media` (Transformidable account); R2 `jlynne-cms` | R2 `transformidable-media` in the J. Lynne account. J. Lynne files go under `asset-files/` |
| Admin | cms.transformidablethinking.com, jlynne.io/admin | transformidable.net/admin |

> **The database is Supabase, outside Cloudflare.** It does not move in this
> step. Both Workers use the same database while they run side by side, so
> content edited in either admin appears in both. Moving off Supabase is a
> separate, later project.

What the J. Lynne library becomes in this instance:

| jlynne.io | here |
| --- | --- |
| `assets` | `assets` (same fields, same `/api/assets/current` lookup) |
| `media` | `asset-files` (Transformidable already has a `media`) |
| `users`, role Admin | `users` (same email and password) |
| `users`, role Editor | `users`, only if you choose: see step 7 |
| `users`, role Reader (KADE) | `api-clients`, with a new key: see step 8 |

## 0. Order of merges, and why

Every build runs `src/migrate.ts`, which updates the Supabase database to
match the code being built. Both accounts will build against that one
database, so code that doesn't know about the new tables must never be built
against it again.

- [ ] Merge the Advisory PR into `main` first, then this PR.
- [ ] In the **Transformidable** account, open Workers & Pages →
      `transformidable-cms` → Settings → Build. Turn off builds for branches
      other than `main` (non-production builds), or remove `POSTGRES_URL` from
      them.

This PR also makes migrate.ts **stop** a build whose schema push would drop a
table or column, rather than going ahead. It also stops clearing Articles and
Podcast Episodes version history on every build. Both have overrides for the
rare build that needs them (`ALLOW_SCHEMA_DROPS=true`,
`MIGRATE_TRUNCATE_VERSIONS=true`). Builds of older code don't have these
protections, which is why the order above matters.

## 1. File storage in the J. Lynne account

- [x] J. Lynne account → R2 → **Create bucket** `transformidable-media`.
- [x] Copy the files from the Transformidable account's `transformidable-media`
      into it. Use R2 → **Data Migration**: the source is the Transformidable
      bucket, using an R2 API token from the Transformidable account. Copying
      leaves the source as it is.

You don't need to copy `jlynne-cms` by hand. The import in step 7 copies its
61 files (7 MB).

## 2. Database connection (Hyperdrive)

- [ ] J. Lynne account → Storage & Databases → Hyperdrive → **Create**.
      Use the same Supabase **Session pooler** connection string as the
      Transformidable account's Hyperdrive (`…pooler.supabase.com:5432`).
- [x] Put the new Hyperdrive's ID in `wrangler.jlynne.jsonc`
      (`ccad495920d74de8933471385e2ba4b6`). The ID isn't secret.

## 3. The domain

- [ ] Add **transformidable.net** to the J. Lynne account (Websites → Add a
      domain), and change its nameservers at the registrar to the two
      Cloudflare gives you.

The Worker attaches transformidable.net itself on its first deploy.

## 4. The Worker

J. Lynne account → Workers & Pages → Create → Import a repository →
`phousecos/transformidable-cms`, branch `main`.

- Build command: `npx opennextjs-cloudflare build --config wrangler.jlynne.jsonc`
- Deploy command: `npx opennextjs-cloudflare deploy --config wrangler.jlynne.jsonc -- --keep-vars`
- The account needs **Workers Paid** ($5/month). The bundle is over the free
  plan's size limit, and jlynne-cms already needed Paid.

**Build variables** (the build runs migrations):

| Name | Value |
| --- | --- |
| `POSTGRES_URL` | Supabase Session pooler URL, as on the Transformidable account |
| `PAYLOAD_SECRET` | **Exactly** the Transformidable value. A different one logs everyone out and breaks existing API keys. |
| `NEXT_PUBLIC_SERVER_URL` | `https://transformidable.net` |
| `NEXT_PUBLIC_SITE_URL` | `https://transformidablethinking.com` |

**Runtime variables and secrets** (Worker → Settings → Variables and Secrets):
the four above, plus the same values as the Transformidable Worker for
`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`,
`EMAIL_FROM`, `CONTACT_NOTIFY_EMAIL`, `CRON_SECRET`, and any `SYNDICATE_…`.
Also add `CAL_WEBHOOK_SECRET` (step 9).

There is no cron on this Worker yet. The Transformidable Worker still sends the
daily digest, and two schedulers would send it twice.

## 5. First check

- [ ] Open **transformidable.net/admin** and sign in with your existing
      Transformidable account. It's the same database, so the same login.
- [ ] Check that Case Files, Publications and Media all open, and that an image
      loads.
- [ ] The sidebar should have a **J. Lynne Library** group (Assets, Asset Files,
      API Clients) and **Advisory Bookings**, all empty for now.

## 6. Freeze jlynne.io

From now on, make library changes only at transformidable.net. Anything added
at jlynne.io before step 7 is copied. Anything changed there after step 7 isn't
(the import skips what's already copied).

## 7. Copy the J. Lynne library

Signed in at transformidable.net/admin as an admin:

- [ ] Open **transformidable.net/api/admin/import-jlynne**. This is a dry run:
      it lists every file, asset and person it would copy, and changes nothing.
      It also lists the J. Lynne items in Transformidable's **Documents**
      collection (`jlynneDocuments`) for you to review later. Those aren't
      changed.
- [ ] To copy, open the browser console on that page and run:

  ```js
  await (await fetch('/api/admin/import-jlynne', { method: 'POST' })).json()
  ```

  It's safe to run again. Anything already copied is skipped, never overwritten.

People: J. Lynne **admins** are copied with the same email and password (you
already have an account here, so you're skipped). **Editors** (Ben) aren't
copied by default, because every person in this admin has full access to all
Transformidable content. To copy them anyway, use
`/api/admin/import-jlynne?includeEditors=1` in both the dry run and the copy.

## 8. KADE

KADE's old key belonged to jlynne.io and doesn't carry over.

- [ ] transformidable.net/admin → J. Lynne Library → **API Clients** → Create
      `KADE Analytics` → tick **Enable API Key** → Save → copy the key into
      KADE.
- [ ] Update KADE's settings:
  - Base URL: `https://transformidable.net`
  - Header: `Authorization: api-clients API-Key <key>` (was `users API-Key`)
  - Files: `/api/asset-files/…` (was `/api/media/…`)
  - `/api/assets` and `/api/assets/current` are unchanged.

API clients can read Assets and Asset Files and nothing else. They can't open
the admin, and they see only published Transformidable content, like a visitor.

## 9. Advisory bookings (Cal.com)

- [ ] Cal.com → Settings → Developer → Webhooks → New:
  - Subscriber URL: `https://transformidable.net/api/advisory-booking`
  - Triggers: Booking Created, Booking Rescheduled, Booking Cancelled
  - Secret: a long random value. Put the same value in the Worker's
    `CAL_WEBHOOK_SECRET` secret.
- [ ] Book a test conversation from /advisory/conversation and check that it
      appears under **Advisory Bookings**, with the intake answers and any
      `?cohort=` tag.

## Later (separate steps, nothing deleted)

- **jlynne.co** still reads jlynne.io. Point it at transformidable.net (with an
  API client key) before jlynne.io is ever switched off.
- **transformidablethinking.com**: when you're ready, move the domain to the
  J. Lynne account and attach it to this Worker. Then:
  - add the cron to `wrangler.jlynne.jsonc`,
  - remove it from the Transformidable Worker, and
  - turn off that Worker's builds.
- **Leftovers:** jlynne.io, the `jlynne-cms` D1 and R2, and the Transformidable
  account's bucket stay as they are until you decide to retire them.
