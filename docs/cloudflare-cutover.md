# Cloudflare Cutover — Step-by-Step

The order to move transformidablethinking.com from Vercel to Cloudflare.
Background and the reasons behind each setting are in
[`cloudflare-migration.md`](./cloudflare-migration.md).

The live site stays on Vercel until **Part 5**. Everything before that can be
done at your own pace and undone. Allow about 2 hours for Parts 1–4 and
30 minutes for Part 5. Expect a few minutes of downtime during Part 5.

Cloudflare renames dashboard menus from time to time. If a label below doesn't
match exactly, use the search box at the top of the dashboard.

---

## Part 0 — Ship the code on Vercel first

The migration code also runs on Vercel. Shipping it there first means the
database changes (new podcast fields, removed image-size columns) happen while
Vercel is still live and known-good. Cloudflare then starts from a settled
database.

- [ ] On GitHub, open a pull request from `claude/modest-thompson-kfsigy` into
      `main`.
- [ ] Wait for Vercel's preview deployment on the pull request to go green.
      Open the preview link and check the homepage, a case file and
      `/admin`.
      **Note:** if Vercel's preview environment uses the production
      `POSTGRES_URL`, the preview build already applies the database changes
      to production. They are safe for the live site either way.
- [ ] Merge the pull request. Wait for the Vercel production deploy to finish.
- [ ] Check the live site and admin still work.
- [ ] In the admin you'll now see **Podcast Episodes** and, under Globals,
      **Podcast Settings**. Don't upload the episode MP3 yet (Vercel's 4.5 MB
      upload limit). Everything else can be filled in now.

---

## Part 1 — Collect your current settings from Vercel

Vercel → your project → **Settings → Environment Variables**. For each
variable below, click it and copy the **Production** value into a password
manager or another private note. Never paste these into chat.

| Variable | Needed for |
| -------- | ---------- |
| `POSTGRES_URL` | Database (build and runtime) |
| `PAYLOAD_SECRET` | Logins (build and runtime). Must be identical, or every user is logged out. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Email |
| `EMAIL_FROM`, `CONTACT_NOTIFY_EMAIL` | Email |
| `CRON_SECRET` | Daily digest |
| any `SYNDICATE_..._URL` / `SYNDICATE_..._SECRET` | Syndication to brand sites |
| `BLOB_READ_WRITE_TOKEN` | Only for copying media in Part 4. Not set on Cloudflare. |

---

## Part 2 — Set up the Cloudflare account

Log in to the Cloudflare account that holds the `transformidablethinking.com`
domain.

### 2.1 Workers Paid plan ($5/month)

- [ ] **Workers & Pages → Plans** (or **Compute → Workers → Plans**) → choose
      **Paid**. The app is too big for the free plan, and the free plan's
      10 ms CPU limit per request fails case file pages with error 1102
      ("Worker exceeded CPU time limit"). The Paid plan allows 30 seconds.

### 2.2 Media bucket (R2)

- [ ] **R2 Object Storage → Create bucket**.
  - Name: `transformidable-media` (exactly this, since the code expects it)
  - Location: Automatic
- [ ] Leave public access **off**. The site serves files through the app.

### 2.3 Database connection (Hyperdrive) — required

The Worker cannot reach Supabase directly (the connection drops during the
TLS handshake); Hyperdrive connects for it. Done: `transformidable-db`, id in
`wrangler.jsonc`. To recreate it:

- [ ] Supabase → project → **Connect** → **Session pooler** → copy the URI
      (`postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres`).
      Not "Direct connection" (IPv6-only) and not "Transaction pooler".
- [ ] Cloudflare → **Storage & Databases → Hyperdrive → Create
      configuration** → name `transformidable-db`, paste the URI.
- [ ] Check **Hyperdrive → transformidable-db → Settings**: the port must be
      **5432**. With 6543 (the transaction pooler) pages that read the
      database spin forever and Hyperdrive's Metrics tab shows errors. Fix
      it there with the pencil icon; no rebuild is needed.
- [ ] Put the ID it shows in the `hyperdrive` block of `wrangler.jsonc`.

### 2.4 Web Analytics

- [ ] **Analytics & Logs → Web Analytics → Add a site** →
      `transformidablethinking.com`.
- [ ] Choose the **JavaScript snippet** option (not automatic setup). The
      snippet contains `"token": "…"`. Copy that token value.

---

## Part 3 — Create the Worker from GitHub

### 3.1 Connect the repository

- [ ] **Workers & Pages → Create → Import a repository** (Workers, not
      Pages) → connect GitHub → choose `phousecos/transformidable-cms`.
- [ ] Settings on the setup screen:

| Setting | Value |
| ------- | ----- |
| Project / Worker name | `transformidable-cms` (must match `wrangler.jsonc`) |
| Production branch | `main` |
| Root directory | `/` (leave blank) |
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx opennextjs-cloudflare deploy -- --keep-vars` |

- [ ] After creating it: **Settings → Build → Branch control** → turn off
      **Builds for non-production branches**. Preview builds would run
      database migrations against the production database.

If it starts building straight away, let the first build fail. The variables
come next, then you retry.

### 3.2 Find the temporary address

- [ ] **Workers & Pages → transformidable-cms**: note the
      `https://transformidable-cms.<your-subdomain>.workers.dev` address. It
      is used for testing until Part 5.

### 3.3 Build variables

**transformidable-cms → Settings → Build → Variables and secrets.** These are
read while the site is built. Use **Secret** for the ones marked 🔒.

| Name | Value |
| ---- | ----- |
| `NODE_ENV` | `production` |
| `NPM_CONFIG_INCLUDE` | `dev` (otherwise `NODE_ENV` makes npm skip packages the build needs) |
| `NODE_VERSION` | `22` |
| `POSTGRES_URL` 🔒 | Supabase **Session pooler** URI (see 2.3) |
| `PAYLOAD_SECRET` 🔒 | from Vercel |
| `NEXT_PUBLIC_SERVER_URL` | **for now:** your `workers.dev` address, with `https://`. Changed in Part 5. |
| `NEXT_PUBLIC_SITE_URL` | `https://transformidablethinking.com` |
| `CF_WEB_ANALYTICS_TOKEN` | token from 2.4 |

Why `NEXT_PUBLIC_SERVER_URL` starts as the workers.dev address: the admin sends
all its requests to that address. If it named the real domain now, the admin
you open on workers.dev would quietly talk to the live Vercel site.

### 3.4 Runtime variables

**transformidable-cms → Settings → Variables and Secrets.** These are read
while the site runs.

| Name | Type | Value |
| ---- | ---- | ----- |
| `POSTGRES_URL` | Secret | Supabase Session pooler URI (Hyperdrive is used instead while it's configured) |
| `PAYLOAD_SECRET` | Secret | from Vercel |
| `SMTP_HOST` | Text | from Vercel (e.g. `smtp.protonmail.ch`) |
| `SMTP_PORT` | Text | from Vercel |
| `SMTP_SECURE` | Text | from Vercel |
| `SMTP_USER` | Text | from Vercel |
| `SMTP_PASS` | Secret | from Vercel |
| `EMAIL_FROM` | Text | from Vercel |
| `CONTACT_NOTIFY_EMAIL` | Text | from Vercel |
| `CRON_SECRET` | Secret | from Vercel |
| `CF_WEB_ANALYTICS_TOKEN` | Text | token from 2.4 |
| `PAYLOAD_CSRF_ORIGINS` | Text | your `workers.dev` address |
| `SYNDICATE_…` | Secret | each one from Vercel |

**Do not add `BLOB_READ_WRITE_TOKEN`.** On Cloudflare, media uses the R2
bucket.

### 3.5 Build it

- [ ] **Deployments → Retry build** (or push any commit to `main`).
- [ ] The build log should show `[migrate] Schema push complete.` and end with
      a successful deploy. It takes a few minutes.
- [ ] If it fails, copy the log's last 50 lines to Claude.

---

## Part 4 — Test on the temporary address

The workers.dev site uses the **real production database**, so anything you
create or change here is live data.

### 4.1 Copy existing media to R2

> Done at cutover. The copy workflow and script have since been removed; they
> are in the git history if ever needed again.

GitHub copies the files; nothing is installed on your computer.

**One-time setup: three repository secrets.** GitHub → the repo →
**Settings → Secrets and variables → Actions → New repository secret**, one
for each:

| Name | Where to get it |
| ---- | --------------- |
| `BLOB_READ_WRITE_TOKEN` | Vercel → project → **Storage** → the Blob store → copy `BLOB_READ_WRITE_TOKEN` |
| `CLOUDFLARE_API_TOKEN` | Cloudflare (Transformidable account) → **My Profile → API Tokens → Create Token → Custom token**. Permission: **Account → Workers R2 Storage → Edit**, for the Transformidable account only. Copy the token it shows once. |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare → **Workers & Pages** → **Account ID** on the right |

**Run it.** GitHub → **Actions → Copy media to R2 → Run workflow**:

- [ ] First with **Only list what would be copied** ticked (the default).
      Open the run: it lists every file and ends with `Would copy N
      object(s)`. This checks the Vercel token.
- [ ] Then again with the box **unticked**. It ends with `Copied N
      object(s)`. If any failed, run it again; it is safe to repeat.

After the move (Part 6), delete the three secrets and the Cloudflare token.

<details><summary>Running it from a computer instead</summary>

With the repo checked out and Node 22 installed:

```bash
git pull
npm ci
npx wrangler login          # log in to the account with the bucket
# put BLOB_READ_WRITE_TOKEN=... in .env (never commit .env)
npm run media:copy-to-r2 -- --dry-run    # lists what it would copy
npm run media:copy-to-r2                 # copies it
```

</details>

### 4.2 Check the site

On `https://transformidable-cms.<subdomain>.workers.dev`:

- [ ] Homepage, a publication, a case file: pages load and **images show**
- [ ] `/podcast` and `/podcast/feed.xml` load
- [ ] `/admin`: log in with your normal account
- [ ] Admin → Media → upload a small image → it saves and its preview shows
- [ ] Admin → **Podcast Settings** → Cover Art → upload
      `governance-files-cover-2000.jpg` → Save (it is checked automatically)
- [ ] Contact form (`/contact`): send a test message → it arrives at
      `CONTACT_NOTIFY_EMAIL`. This is the real test of Proton SMTP from
      Cloudflare.

Anything broken: stop here and tell Claude. The live site is untouched.

---

## Part 5 — Switch over

Pick a quiet time. Downtime is the few minutes between removing the old DNS
records and Cloudflare activating the new ones.

### 5.1 Freeze and final media copy

- [ ] Stop uploading in the admin (on either site) until this part is done.
- [ ] Run **Actions → Copy media to R2** once more (box unticked) to pick up
      recent uploads.

### 5.2 Point the build at the real domain

- [ ] Build variables (3.3): change `NEXT_PUBLIC_SERVER_URL` to
      `https://cms.transformidablethinking.com`.
- [ ] **Retry build** and wait for it to deploy.

### 5.3 Stop Vercel's jobs

Do this now, or both platforms will send the daily digest.

- [ ] Vercel → project → **Settings → Cron Jobs** → **Disable**.
- [ ] Vercel → project → **Settings → Git** → **Disconnect**, so pushes no
      longer build on Vercel (each build would run database migrations).

### 5.4 Move the domains

In Cloudflare **DNS → Records** for `transformidablethinking.com`, find the
records pointing at Vercel: a `CNAME` to `cname.vercel-dns.com` (or similar)
or an `A` record to `76.76.21.21`. Screenshot them first, so you can put them
back if needed.

For each hostname below, **delete the Vercel record**, then add it to the
Worker: **transformidable-cms → Settings → Domains & Routes → Add → Custom
domain**.

- [ ] `transformidablethinking.com`
- [ ] `www.transformidablethinking.com`
- [ ] `cms.transformidablethinking.com`
- [ ] Legacy, if those domains are in this Cloudflare account and still
      wanted: `transformidable.media`, `www.transformidable.media`,
      `cms.transformidable.media`

Cloudflare creates the DNS records and certificates itself. Each domain shows
**Active** within a few minutes.

### 5.5 The assets domain

The old config mentioned `assets.transformidablethinking.com`.

- [ ] In **DNS → Records**, check whether `assets` exists and what it points
      to.
  - Points at Vercel Blob (`…blob.vercel-storage.com` or similar): delete it,
    then **R2 → transformidable-media → Settings → Custom Domains → Connect
    domain** → `assets.transformidablethinking.com`. Old links keep working
    because the file paths are identical.
  - Doesn't exist: nothing to do.

### 5.6 Check the live site

- [ ] `https://transformidablethinking.com`: pages and images load
- [ ] `https://cms.transformidablethinking.com/admin`: log in, edit and save
      something
- [ ] Contact form sends
- [ ] Next day after 13:00 UTC: **transformidable-cms → Settings → Triggers →
      Cron Events** shows a successful run

### If something goes wrong

Remove the custom domains from the Worker, restore the Vercel DNS records from
your screenshots, and re-enable Vercel's cron job. The Vercel deployment is
still there and uses the same database.

---

## Part 6 — After the switch

- [ ] Admin → Podcast Episodes → the pilot → upload the MP3 in **Audio file**,
      set the duration, status **Published**.
- [ ] Open `https://transformidablethinking.com/podcast/feed.xml` and check
      the episode is listed.

**Website video (Cloudflare Stream).** The site plays its own copy of each
episode from Stream; YouTube is only used for an episode with no Stream
video.

- [ ] Cloudflare → **Stream** → subscribe (billed by minutes stored and
      minutes watched; see the plans on that page).
- [ ] **Stream → Upload** the episode's video file (MP4 or MOV). When it
      finishes processing, open the video: copy its **Video ID** (32 letters
      and numbers) and, from its HLS link, the address that looks like
      `customer-xxxx.cloudflarestream.com`.
- [ ] Optional: in the video's **Captions** tab, generate English captions.
      The player shows a **CC** button once a video has them.
- [ ] Admin → **Podcast Settings** → **Cloudflare Stream address**: paste the
      `customer-xxxx.cloudflarestream.com` address (once, for all episodes).
- [ ] Admin → Podcast Episodes → the episode → **Cloudflare Stream video**:
      paste the Video ID.
- [ ] Same episode → **Chapters**: add each chapter's start time (e.g.
      `6:05`) and title. Pick a **Case file section** to show a "Discussed in
      the episode at 6:05" link in that section of the linked case file.
- [ ] Check the episode page and the case file: the video plays, chapters
      jump, and the "Discussed" links start the video at the right moment.
- [ ] Submit the feed URL once:
  - Apple: podcastsconnect.apple.com → **+** → New Show → **Add a show with an
    RSS feed**
  - Spotify: creators.spotify.com → **Add an existing show** → paste the feed
    URL
  Both email a verification code to the owner email in Podcast Settings.
- [ ] Delete the three repository secrets from 4.1 and the Cloudflare API
      token (My Profile → API Tokens).
- [x] Remove the Vercel-only code (`vercel.json`, the Blob plugin, Vercel
      Analytics, the media copy script and its workflow). Done.
- [ ] Delete the Vercel project and **downgrade Vercel Pro**. That is where the savings
      start.
