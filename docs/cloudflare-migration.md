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
| 4 | Podcast: YouTube embed, MP3 on R2, RSS feed | to do |
| 5 | Dashboard setup, DNS cutover, retire Vercel | to do |

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

Each query opening a new connection is only cheap behind **Hyperdrive**, which
keeps warm connections to Neon. Without it every query pays a TLS handshake to
the database. Set it up before going live (below).

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

`layout.tsx` renders Vercel Analytics only when `VERCEL` is set (it 404s
anywhere else), and the Cloudflare Web Analytics beacon when
`CF_WEB_ANALYTICS_TOKEN` is set. Both can be on during the overlap.

### Visitor IP

The rate limiters on the public API routes key on the visitor's IP. On Workers
`getClientIp` (`src/lib/apiRequestGuards.ts`) reads `cf-connecting-ip`, which
Cloudflare sets and clients cannot override; elsewhere it keeps reading
`x-forwarded-for`. The contact and subscribe routes had private copies of the
old helper and now use the shared one.

### Media storage

The storage adapter is picked per environment in `payload.config.ts`:

| Where | Storage |
| ----- | ------- |
| Cloudflare Worker | R2, through the `MEDIA_BUCKET` binding. Uploads from the admin go browser → R2 in 5 MB chunks (`clientUploads`), so large files such as podcast audio never sit in one request or in the Worker's memory. |
| Vercel (until cutover) | Vercel Blob, as before. |
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
| `npm run media:copy-to-r2` | Copies every Vercel Blob object to the R2 bucket under the same key. Needs `BLOB_READ_WRITE_TOKEN` and wrangler logged in. `-- --dry-run` lists what it would copy; `-- --local` writes to the local R2 used by `preview:cf`. Safe to re-run. |

## One-time Cloudflare setup (step 5)

1. **Workers Paid plan** ($5/month). The Worker is about 4.4 MB gzipped; the
   free plan caps at 3 MB.
2. **R2 bucket** for media:
   ```bash
   npx wrangler r2 bucket create transformidable-media
   ```
   Then copy existing files with `npm run media:copy-to-r2`. Run it again
   right before the DNS switch to pick up anything uploaded on Vercel in
   between (or freeze uploads for the window).

   The old config noted media "serves from assets.transformidablethinking.com".
   If that domain points at the Blob store, anything linking to it directly
   breaks when Blob goes away. Check it, and if so connect it to the bucket
   instead (R2 → bucket → Settings → Custom Domains). Keys are identical, so
   the same paths keep working.
3. **Hyperdrive**:
   ```bash
   npx wrangler hyperdrive create transformidable-db --connection-string="<POSTGRES_URL>"
   ```
   Paste the printed id into the commented `hyperdrive` block in
   `wrangler.jsonc` and uncomment it.
4. **Workers Builds** (Worker → Settings → Build), connected to this repo:
   - Build command: `npx opennextjs-cloudflare build`
   - Deploy command: `npx opennextjs-cloudflare deploy`
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
| `POSTGRES_URL` | Direct Neon URL; the build runs migrations. |
| `PAYLOAD_SECRET` | Same value as runtime. |
| `NEXT_PUBLIC_SERVER_URL` | `https://cms.transformidablethinking.com`. **Required on Cloudflare** — Vercel had a fallback, Cloudflare has none, and a wrong value silently locks the admin out (see the CSRF notes in `payload.config.ts`). |
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
| `BLOB_READ_WRITE_TOKEN` | **Do not set** on Cloudflare. Media uses the R2 binding. |

## Known gaps

- `undici` (bundled by Payload and by `@vercel/blob`) logs one
  "WebAssembly.compile(): Wasm code generation disallowed" error when the
  Worker starts. Payload uses it in `safeFetch` when it downloads a stored
  file, e.g. to duplicate a media item; that failed on Workers, so Media sets
  `skipSafeFetch` there (see the comment in `Media.ts`). Blob is never active
  on Workers. The startup log line is harmless.
- A duplicated media item records `filesize: 0`. Payload takes the size from
  the `Content-Length` header, and R2 responses through the Worker are
  streamed without one. The file itself is copied intact.
- `npm run lint` calls `next lint`, which Next 16 removed. The repo has no
  ESLint config, so it wasn't linting before either.
