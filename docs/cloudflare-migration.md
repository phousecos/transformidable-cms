# Cloudflare Workers — Migration Notes

Internal reference for moving this app from Vercel to Cloudflare Workers.
The app keeps building and running on Vercel until cutover, so each step
can merge and ship on its own.

## Status

| Step | What | State |
| ---- | ---- | ----- |
| 1 | Next 16 + Payload 3.91, OpenNext adapter, host-agnostic DB/CSRF config | done |
| 2 | Vercel Blob → R2; drop `sharp` for on-the-fly image resizing | to do |
| 3 | Cron → Cron Trigger; test Proton SMTP; Vercel Analytics → Cloudflare | to do |
| 4 | Podcast: YouTube embed, MP3 on R2, RSS feed | to do |
| 5 | Dashboard setup, DNS cutover, retire Vercel | to do |

**The Worker cannot be deployed until step 2 is done**: `sharp` is a native
module and fails the Workers bundle.

## How it runs

[OpenNext](https://opennext.js.org/cloudflare) turns the Next build into a
Worker. Relevant files:

- `wrangler.jsonc` — Worker name, compatibility flags, bindings.
- `open-next.config.ts` — adapter config (no incremental cache; pages are dynamic).
- `cloudflare-env.d.ts` — types for bindings this app adds.
- `src/payload.config.ts` — detects the Workers runtime (`isWorkers`) and,
  only there: uses the Hyperdrive binding if present, opens a fresh database
  connection per use, and logs JSON lines instead of using pino.

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

## Commands

| Command | Does |
| ------- | ---- |
| `npm run dev` | Unchanged: Next dev server on Node. |
| `npm run preview:cf` | Builds the Worker and runs it locally in `wrangler dev`. Needs a `.dev.vars` file (gitignored) with the runtime variables below. |
| `npm run deploy:cf` | Builds and deploys the Worker from your machine (`npx wrangler login` first). |

## One-time Cloudflare setup (step 5)

1. **Workers Paid plan** ($5/month). The Worker is about 4.4 MB gzipped; the
   free plan caps at 3 MB.
2. **Hyperdrive**:
   ```bash
   npx wrangler hyperdrive create transformidable-db --connection-string="<POSTGRES_URL>"
   ```
   Paste the printed id into the commented `hyperdrive` block in
   `wrangler.jsonc` and uncomment it.
3. **Workers Builds** (Worker → Settings → Build), connected to this repo:
   - Build command: `npx opennextjs-cloudflare build`
   - Deploy command: `npx opennextjs-cloudflare deploy`
4. **Variables.** Two places, because Next reads some at build time.

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

### Runtime variables and secrets (Settings → Variables and Secrets)

| Variable | Notes |
| -------- | ----- |
| `POSTGRES_URL` | Fallback when no Hyperdrive binding is configured. |
| `PAYLOAD_SECRET` | Secret. |
| `PAYLOAD_CSRF_ORIGINS` | Add `https://transformidable-cms.<account>.workers.dev` to use the admin before DNS moves. |
| `SMTP_*`, `EMAIL_FROM`, `CONTACT_NOTIFY_EMAIL` | As on Vercel; SMTP on Workers is verified in step 3. |
| `CRON_SECRET` | As on Vercel; the cron trigger is reworked in step 3. |
| `SYNDICATE_<BRAND>_URL` / `_SECRET` | As on Vercel; see `syndication-operations.md`. |
| `BLOB_READ_WRITE_TOKEN` | Not needed on Cloudflare; replaced by R2 in step 2. |

## Known gaps

- `sharp` blocks the Workers bundle (step 2).
- Payload's "upload from URL" uses `undici`, which can't initialize on Workers
  (it logs a WebAssembly error at startup). Normal uploads are unaffected.
  Handled with storage in step 2.
- `npm run lint` calls `next lint`, which Next 16 removed. The repo has no
  ESLint config, so it wasn't linting before either.
