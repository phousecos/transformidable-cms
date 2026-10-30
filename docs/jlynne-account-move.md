# Moving to the J. Lynne Cloudflare account

One Payload instance for Transformidable and the J. Lynne library. It runs as
the existing **`jlynne-cms`** Worker in the **J. Lynne** Cloudflare account,
with its admin at **transformidable.net/admin** (jlynne.io/admin also works).

**Nothing is deleted along the way.**
- The current Transformidable Worker keeps running, untouched, until it's
  switched off on purpose later.
- On `jlynne-cms`, the code is replaced, but its D1 database and R2 bucket
  stay as they are. The import only reads them.
- Cloudflare keeps every deployed version of a Worker, so the old J. Lynne
  version can be restored from the Worker's **Deployments** tab.

## Where everything lives

| | Before | After |
| --- | --- | --- |
| Code | transformidable-cms, jlynne-cms | transformidable-cms only (wrangler.jlynne.jsonc) |
| Worker | `transformidable-cms` (Transformidable account), `jlynne-cms` (J. Lynne account) | `jlynne-cms` (J. Lynne account), running this repo |
| Database | **Supabase Postgres** (Transformidable); D1 `jlynne-cms` (J. Lynne) | **Supabase Postgres**, the same database, reached through a Hyperdrive in the J. Lynne account |
| Files | R2 `transformidable-media` (Transformidable account); R2 `jlynne-cms` | R2 `transformidable-media` in the J. Lynne account. J. Lynne files go under `asset-files/` |
| Admin | cms.transformidablethinking.com, jlynne.io/admin | transformidable.net/admin (and jlynne.io/admin). Both are admin-only: other paths redirect to /admin |
| Public site | transformidablethinking.com (Transformidable account) | **betransformidable.com** (this Worker). transformidablethinking.com keeps running on the old Worker until it's redirected |

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
      into it. Done 29 Oct 2026: 26 objects, sizes and checksums verified. The
      source was only read.

You don't need to copy `jlynne-cms` by hand. The import in step 7 copies its
61 files (7 MB).

## 2. Database connection (Hyperdrive)

- [x] J. Lynne account → Storage & Databases → Hyperdrive → **Create**.
      Use the same Supabase **Session pooler** connection string as the
      Transformidable account's Hyperdrive (`…pooler.supabase.com:5432`).
- [x] Put the new Hyperdrive's ID in `wrangler.jlynne.jsonc`
      (`ccad495920d74de8933471385e2ba4b6`). The ID isn't secret.

## 3. The domain

- [x] **transformidable.net** is active in the J. Lynne account and attached to
      the `jlynne-cms` Worker, next to jlynne.io. The config lists both, so
      deploys keep them attached. Both are admin-only.
- [ ] **betransformidable.com** (and `www.`) is the public website. The config
      attaches both on the next deploy. If the domain already has a website
      record (an A or CNAME record for `betransformidable.com` or `www`), the
      deploy stops with "already has externally managed DNS records". Delete
      those two records in DNS and rerun the build. Leave the email (MX/TXT)
      records alone.
- [ ] Change the build variable `NEXT_PUBLIC_SITE_URL` to
      `https://betransformidable.com`. It sets canonical links, the sitemap and
      email links, and is read at build time.

## 4. Switch `jlynne-cms` to this code

From this step on, jlynne.io runs this code. Do steps 4–8 in one sitting:

- **KADE:** its old key stops working at this step and works again after step 8.
- **Library:** jlynne.io/admin shows an empty library until step 7.

J. Lynne account → Workers & Pages → `jlynne-cms` → Settings → **Build**:

- [ ] Change the connected repository from `phousecos/jlynne-cms` to
      `phousecos/transformidable-cms`, branch `main`. Otherwise a push to
      jlynne-cms would put the old code back.
- Build command: `npx opennextjs-cloudflare build --config wrangler.jlynne.jsonc`
- Deploy command: `npx opennextjs-cloudflare deploy --config wrangler.jlynne.jsonc -- --keep-vars`
- The account is already on **Workers Paid**, which the bundle size needs.

**Build variables** (the build runs migrations):

| Name | Value |
| --- | --- |
| `POSTGRES_URL` | Supabase Session pooler URL, the same one the J. Lynne Hyperdrive uses |
| `PAYLOAD_SECRET` | A new value from `openssl rand -hex 32`. Use the same value for the build variable and the runtime secret. |
| `NEXT_PUBLIC_SERVER_URL` | `https://transformidable.net` |
| `NEXT_PUBLIC_SITE_URL` | `https://betransformidable.com` |

**Runtime variables and secrets** (Settings → Variables and Secrets):
- Set the four above. `PAYLOAD_SECRET` *replaces* the old J. Lynne value.
- Email: `SMTP_HOST=smtp.protonmail.ch`, `SMTP_PORT=587`, `SMTP_SECURE=false`,
  `SMTP_USER` (the Proton address), and `SMTP_PASS` (a **new** Proton SMTP token,
  so the current site's token isn't touched). Also `EMAIL_FROM` and
  `CONTACT_NOTIFY_EMAIL`. Without these, email isn't sent, and nothing else
  fails.
- `CRON_SECRET`: a new value from `openssl rand -hex 32`.
- `SYNDICATE_…`: optional. If they're left out, syndication is skipped and logged.
- Add `CAL_WEBHOOK_SECRET` (step 9).

**New secrets are fine.**
- With a new `PAYLOAD_SECRET`, everyone signs in again with the same
  password, since passwords don't depend on it. Only API keys made under the
  old secret stop working, and KADE gets a new one in step 8.
- Set the `jlynne-cms` secrets at switch time, not before. Changing them on
  the running old library would sign everyone out and break KADE's current
  key early.
- Paste generated values straight into the dashboard.
- `PUBLIC_DOWNLOAD_BASE_URL` is set in `wrangler.jlynne.jsonc`.

Then trigger a build (Deployments → **Retry** / redeploy, or push to `main`).

There is no cron on this Worker yet. The Transformidable Worker still sends the
daily digest, and two schedulers would send it twice.

**To roll back:** Deployments → pick the last J. Lynne version → **Rollback**.
Then reconnect the jlynne-cms repo. The old D1 and R2 were never changed.
The old library would need fresh sign-ins and a new KADE key, but passwords
still work.

## 5. First check

- [ ] Open **transformidable.net/admin** and sign in with your existing
      Transformidable account. It's the same database, so the same login.
- [ ] Check that Case Files, Publications and Media all open, and that an image
      loads.
- [ ] The sidebar should have a **Advisory** group (Assets, Asset Files,
      API Clients) and **Advisory Bookings**, all empty for now.

## 6. (Nothing to freeze)

The old library stopped taking edits when step 4 replaced its code, so the
import in step 7 copies everything it ever held.

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

- [ ] transformidable.net/admin → Advisory → **API Clients** → Create
      `KADE Analytics` → tick **Enable API Key** → Save → copy the key into
      KADE.
- [ ] Update KADE's settings:
  - Base URL: `https://transformidable.net` (`https://jlynne.io` also works for now)
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

- **Downloads** now point at `betransformidable.com/advisory/tools/{slug}`
  (`PUBLIC_DOWNLOAD_BASE_URL` in `wrangler.jlynne.jsonc`), so jlynne.co can go.
- **transformidablethinking.com**: when you're ready, redirect it to
  betransformidable.com. Then:
  - add the cron to `wrangler.jlynne.jsonc`,
  - remove it from the Transformidable Worker, and
  - turn off that Worker's builds.
- **Leftovers:** the `jlynne-cms` D1 and R2, the phousecos/jlynne-cms repo, and
  the Transformidable account's bucket stay as they are until you decide to
  retire them.
