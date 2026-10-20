# Cloudflare Workers — Migration Notes

Internal reference for moving this app from Vercel to Cloudflare Workers.
The app keeps building and running on Vercel until cutover, so each step
can merge and ship on its own.

## Status

| Step | What | State |
| ---- | ---- | ----- |
| 1 | Next 16 + Payload 3.91, OpenNext adapter, host-agnostic DB/CSRF config | done |
| 2 | Vercel Blob → R2; drop `sharp` and image sizes; Blob→R2 copy script | done |
| 3 | Cron → Cron Trigger; SMTP verified on Workers; Cloudflare Web Analytics; visitor IP on Cloudflare | done |
| 4 | Podcast: settings global, YouTube embed, MP3 audio, RSS feed | done |
| 5 | Dashboard setup, DNS cutover, retire Vercel | done; Vercel-only code removed |

## How it runs

[OpenNext](https://opennext.js.org/cloudflare) turns the Next build into a
Worker. Relevant files:

- `wrangler.jsonc` — Worker name, compatibility flags, bindings, cron schedule.
- `worker.ts` — the Worker entry: OpenNext's fetch handler plus the
  `scheduled` handler for Cron Triggers.
- `open-next.config.ts` — adapter config (no incremental cache; pages are dynamic).
- `cloudflare-env.d.ts` — types for bindings this app adds.
- `src/lib/runtime.ts` — `isWorkers`, true only in the Workers runtime.
- `src/payload.config.ts` — uses `isWorkers` and,
  only there: stores media in R2, uses the Hyperdrive binding if present,
  opens a fresh database connection per use, and logs JSON lines instead of
  using pino.

`npm run build` now runs `next build --webpack`. Turbopack, the Next 16
default, emits hashed module names for Payload's externals (`drizzle-kit`)
that the Workers bundler cannot resolve.

### Database connections on Workers

Workers close a socket when the request that opened it ends, while Payload's
connection pool lives across requests. On Workers the pool is therefore set to
`maxUses: 1` and an effectively unlimited `max`, so no connection is ever handed
from one request to another. In a local `wrangler dev` load test, `maxUses: 1`
alone failed 21 of 30 parallel requests with "This socket has been closed"
(queued requests were handed connections opened by other requests); with both
settings, 120 of 120 succeeded.

**Hyperdrive is required.** It holds warm connections to Supabase, so each
new connection the Worker opens is cheap. More importantly, without it the
Worker cannot connect at all: a direct connection to Supabase's pooler drops
during the TLS handshake, and every page fails with "cannot connect to
Postgres … Connection terminated unexpectedly". The binding is in
`wrangler.jsonc`.

The database is Supabase. Use the **Session pooler** connection string
(`…pooler.supabase.com:5432`) for both Hyperdrive and `POSTGRES_URL`. The
direct connection is IPv6-only, and the transaction pooler (port 6543) breaks
the session-level lock `migrate.ts` takes.

### Scheduled jobs

Vercel Cron called `/api/cron/case-digest` over HTTP with
`Authorization: Bearer $CRON_SECRET`. Cloudflare Cron Triggers call the
Worker's `scheduled` handler instead, so `worker.ts` maps each schedule to its
route and sends the request through the app itself with the same header. The
route is unchanged and still rejects anyone without the secret. A non-2xx
response fails the run, which shows in the Worker's Cron Events.

To add a job: add the schedule to `triggers.crons` in `wrangler.jsonc` and the
schedule → route pair to `CRON_ROUTES` in `worker.ts`. Run one locally with
`wrangler dev --test-scheduled` and
`curl "http://localhost:8787/cdn-cgi/handler/scheduled?cron=0+13+*+*+*"`.

The route's `maxDuration` export is Vercel-only; Workers ignore it and apply
their own limits to scheduled runs.

### Email (Proton SMTP)

Nodemailer works unchanged on Workers. Tested against a local SMTP server
through the Worker: the digest (fired by the cron trigger) and the contact form
both delivered over plain SMTP, STARTTLS (the 587 setup Proton uses) and
implicit TLS (465). The server certificate is verified: a self-signed one was
rejected. Cloudflare blocks outbound port 25 only.

Nodemailer resolves the SMTP host with `node:dns`, which on Workers goes over
DNS-over-HTTPS to Cloudflare, so `SMTP_HOST` must be a public DNS name (as
`smtp.protonmail.ch` is) or an IP. A Proton Mail Bridge on a private machine
is unreachable from Workers, as it was from Vercel.

### Analytics

`layout.tsx` renders the Cloudflare Web Analytics beacon when
`CF_WEB_ANALYTICS_TOKEN` is set.

### Visitor IP

The rate limiters on the public API routes key on the visitor's IP. On Workers
`getClientIp` (`src/lib/apiRequestGuards.ts`) reads `cf-connecting-ip`, which
Cloudflare sets and clients cannot override; elsewhere it keeps reading
`x-forwarded-for`. The contact and subscribe routes had private copies of the
old helper and now use the shared one.

### Podcast

| Piece | Where |
| ----- | ----- |
| Show details (title, author, owner email, cover art, categories, explicit) | Admin → Globals → Podcast Settings (`src/globals/PodcastSettings.ts`). Defaults live in `src/lib/podcast.ts`. |
| Episodes | Admin → Podcast Episodes (`src/collections/PodcastEpisodes.ts`), no longer hidden. |
| Episode list / page | `/podcast`, `/podcast/<slug>` |
| RSS feed | `/podcast/feed.xml` (`src/app/(frontend)/podcast/feed.xml/route.ts`) |

Cover art is checked on save against Apple's rules (square JPG/PNG,
1400–3000 px), so a wrong size is caught in the admin, not by Apple.

The episode page shows the YouTube video as a click-to-play thumbnail: no
YouTube scripts or cookies load until someone presses play, and then the player
uses `youtube-nocookie.com`. Below it is a plain audio player for the uploaded
MP3.

An episode is in the feed when it is **Published**, its publish date has
passed, and it has audio (an uploaded file, or failing that the external audio
URL). Each item's `<guid>` is `transformidable-podcast-<id>`; it must never
change, or apps list the episode twice. Uploaded audio is served with byte-range
support (`206 Partial Content`), which Apple requires.

**Upload episode audio only after cutover.** On Vercel, uploads pass through a
function capped at 4.5 MB, so a 25-minute MP3 (about 25 MB) fails there. On
Cloudflare the admin sends it straight to R2 in 5 MB chunks.

#### Publishing an episode

1. Upload the episode to YouTube as usual.
2. Admin → Podcast Episodes → Create: title, episode and season number,
   description (shown in podcast apps), YouTube link, the MP3 (upload it from
   the audio field), duration (e.g. `25:00`), publish date, and optionally show
   notes, transcript and episode artwork. Set status to Published.
3. Podcast apps pick it up the next time they check the feed (usually within
   hours).

#### Submitting the show (once, after cutover)

The feed URL is `https://transformidablethinking.com/podcast/feed.xml`.

- Apple Podcasts: podcastsconnect.apple.com → Add a show → RSS feed.
- Spotify: creators.spotify.com → Add an existing show → RSS feed.

Both send a verification code to the owner email in Podcast Settings. Set the
cover art first; Apple rejects a feed without it.

### Media storage

The storage adapter is picked per environment in `payload.config.ts`:

| Where | Storage |
| ----- | ------- |
| Cloudflare Worker | R2, through the `MEDIA_BUCKET` binding. Uploads from the admin go browser → R2 in 5 MB chunks (`clientUploads`), so large files such as podcast audio never sit in one request or in the Worker's memory. |
| Anywhere else (build-time migrations, `npm run dev`) | Local disk; the storage fields are still added. |

Every store keys files by filename and Payload serves them at
`/api/media/file/<filename>`, so moving stores means copying objects. No
database rows change.

The storage plugin adds `prefix` and `_objectKey` columns to `media`.
`alwaysInsertFields` is set in all three cases so the schema is identical: the
build pushes the schema under Node, without the R2 binding, and would otherwise
drop columns the Worker then queries.

There is no `sharp` (a native module that cannot run on Workers), so Media no
longer generates thumbnail/card/hero sizes and has no crop or focal point. The
site only ever displayed the original file; the admin now shows originals as
thumbnails. Payload still records width and height. `src/migrate.ts` drops the
old `sizes_*` and `focal_*` columns, which also stops the schema push asking
whether `prefix` is a renamed column. The old size files stay in Blob and are
copied with everything else; nothing references them.

## Commands

| Command | Does |
| ------- | ---- |
| `npm run dev` | Unchanged: Next dev server on Node. |
| `npm run preview:cf` | Builds the Worker and runs it locally in `wrangler dev`. Needs a `.dev.vars` file (gitignored) with the runtime variables below. |
| `npm run deploy:cf` | Builds and deploys the Worker from your machine (`npx wrangler login` first). |

## One-time Cloudflare setup (step 5)

The click-by-click version, in order, is [`cloudflare-cutover.md`](./cloudflare-cutover.md).

1. **Workers Paid plan** ($5/month). The Worker is about 4.4 MB gzipped; the
   free plan caps at 3 MB.
2. **R2 bucket** for media:
   ```bash
   npx wrangler r2 bucket create transformidable-media
   ```
   Existing files were copied from Vercel Blob at cutover; the copy script
   was removed afterwards (it is in the git history).

   The old config noted media "serves from assets.transformidablethinking.com".
   If that domain points at the Blob store, anything linking to it directly
   breaks when Blob goes away. Check it, and if so connect it to the bucket
   instead (R2 → bucket → Settings → Custom Domains). Keys are identical, so
   the same paths keep working.
3. **Hyperdrive** (required; see above): already configured as
   `transformidable-db`, id in `wrangler.jsonc`. Its origin port must be
   5432; on 6543 database requests hang. The `localConnectionString` in
   `wrangler.jsonc` is a placeholder the deploy step needs; production
   never uses it.
4. **Workers Builds** (Worker → Settings → Build), connected to this repo:
   - Build command: `npx opennextjs-cloudflare build`
   - Deploy command: `npx opennextjs-cloudflare deploy -- --keep-vars`
     (`--keep-vars` stops each deploy deleting variables set in the dashboard)
   - Branch control: turn off builds for non-production branches. They
     would run migrations against the production database.
5. **Web Analytics**: Analytics & Logs → Web Analytics → Add a site → the
   domain, and choose the JavaScript snippet. Copy the token from it into
   `CF_WEB_ANALYTICS_TOKEN` (below). Vercel Analytics history does not move.
6. **Variables.** Two places, because Next reads some at build time.

### Build variables and secrets (Settings → Build)

The build runs `src/migrate.ts` against the database and inlines every
`NEXT_PUBLIC_*` value into the bundle, so these must be set here:

| Variable | Notes |
| -------- | ----- |
| `NODE_ENV` | `production`. Otherwise Payload regenerates `src/payload-types.ts` when the migration step starts it, and the code does not typecheck against the full generated types (true before this migration too), so `next build` fails. |
| `NPM_CONFIG_INCLUDE` | `dev`. `NODE_ENV=production` makes `npm ci` skip devDependencies, and the build needs them (Tailwind, TypeScript, tsx). |
| `NODE_VERSION` | `22` (the build image defaults to 24). |
| `POSTGRES_URL` | Supabase Session pooler URL; the build runs migrations from Node, outside Hyperdrive. |
| `PAYLOAD_SECRET` | Same value as runtime. |
| `NEXT_PUBLIC_SERVER_URL` | `https://cms.transformidablethinking.com`, including `https://`. **Required on Cloudflare** — Vercel had a fallback, Cloudflare has none, and a wrong value silently locks the admin out (see the CSRF notes in `payload.config.ts`). |
| `NEXT_PUBLIC_SITE_URL` | `https://transformidablethinking.com` |
| `CF_WEB_ANALYTICS_TOKEN` | From step 5. Needed here because static pages are rendered at build time. |

### Runtime variables and secrets (Settings → Variables and Secrets)

| Variable | Notes |
| -------- | ----- |
| `POSTGRES_URL` | Fallback when no Hyperdrive binding is configured. |
| `PAYLOAD_SECRET` | Secret. |
| `PAYLOAD_CSRF_ORIGINS` | Add `https://transformidable-cms.<account>.workers.dev` to use the admin before DNS moves. |
| `SMTP_*`, `EMAIL_FROM`, `CONTACT_NOTIFY_EMAIL` | Same values as on Vercel. |
| `CRON_SECRET` | Same value as on Vercel. The digest refuses to run without it. |
| `CF_WEB_ANALYTICS_TOKEN` | Same as the build variable (dynamic pages read it at runtime). |
| `SYNDICATE_<BRAND>_URL` / `_SECRET` | As on Vercel; see `syndication-operations.md`. |

## Known gaps

- `undici` (bundled by Payload) may log one
  "WebAssembly.compile(): Wasm code generation disallowed" error when the
  Worker starts. Payload uses it in `safeFetch` when it downloads a stored
  file, e.g. to duplicate a media item; that failed on Workers, so Media sets
  `skipSafeFetch` there (see the comment in `Media.ts`). The startup log line
  is harmless.
- A duplicated media item records `filesize: 0`. Payload takes the size from
  the `Content-Length` header, and R2 responses through the Worker are
  streamed without one. The file itself is copied intact.
- `npm run lint` calls `next lint`, which Next 16 removed. The repo has no
  ESLint config, so it wasn't linting before either.
