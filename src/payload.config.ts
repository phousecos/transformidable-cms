import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import sharp from 'sharp'

import { Users } from './collections/Users.ts'
import { Media } from './collections/Media.ts'
import { Articles } from './collections/Articles.ts'
import { Publications } from './collections/Publications.ts'
import { CaseFiles } from './collections/CaseFiles.ts'
import { ResearchNotes } from './collections/ResearchNotes.ts'
import { Issues } from './collections/Issues.ts'
import { Verticals } from './collections/Verticals.ts'
import { Topics } from './collections/Topics.ts'
import { Books } from './collections/Books.ts'
import { Subscribers } from './collections/Subscribers.ts'
import { CaseFollows } from './collections/CaseFollows.ts'
import { CaseSubmissions } from './collections/CaseSubmissions.ts'
import { ContactMessages } from './collections/ContactMessages.ts'
import { SiteSettings } from './globals/SiteSettings.ts'
import { TransformidableFeature } from './globals/TransformidableFeature.ts'

// Legacy collections — kept so Payload can still read/write their DB tables.
// Articles still references authors and brand-pillars via legacy fields.
import { Authors } from './collections/Authors.ts'
import { BrandPillars } from './collections/BrandPillars.ts'
import { PodcastEpisodes } from './collections/PodcastEpisodes.ts'
import { Sponsors } from './collections/Sponsors.ts'
import { NewsletterIssues } from './collections/NewsletterIssues.ts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// On Vercel, force sslmode=no-verify so pg accepts Neon's certificate.
// Setting ssl in the pool config doesn't work because pg's Object.assign
// overwrites it with the sslmode parsed from the connection string.
const rawConnectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || ''
const connectionString =
  process.env.VERCEL && rawConnectionString
    ? rawConnectionString.includes('sslmode=')
      ? rawConnectionString.replace(/sslmode=[^&]*/, 'sslmode=no-verify')
      : rawConnectionString + (rawConnectionString.includes('?') ? '&' : '?') + 'sslmode=no-verify'
    : rawConnectionString

// Prefer an explicitly configured URL over Vercel's guess.
// VERCEL_PROJECT_PRODUCTION_URL is set on every deployment and names the
// project's *primary* production domain. This project serves both the public
// site and the admin, so that primary domain is not necessarily the host the
// admin is browsed at — and letting it win meant NEXT_PUBLIC_SERVER_URL could
// never take effect in production, however it was set. serverURL feeds the
// CSRF allowlist below (Payload appends it during config sanitization), so
// pointing it at the wrong host silently locks the admin out of its own API.
const serverURL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : '')

// Origins allowed to carry the admin session cookie on API requests.
//
// Payload matches the browser's Origin header against this list with an exact
// string comparison (auth/extractJWT.js). On a miss it does not reject the
// request — it silently drops the session cookie, so the call is processed as
// unauthenticated and returns 401. Nothing identifies CSRF as the reason.
//
// In the admin that failure is invisible and badly misleading: adding an array
// row 401s on the doc-preferences call it makes first, so the new row shimmers
// forever with no error; and logout cannot authenticate, so the cookie is
// never cleared and you land back on the dashboard still logged in. Meanwhile
// every page still renders fine, because server-side rendering reads the
// cookie directly and never goes through this check.
//
// So: every host the admin is actually served from must be listed here, and
// the cost of omitting one is hours of misdirected debugging.
const csrfOrigins = Array.from(
  new Set(
    [
      serverURL,
      'https://cms.transformidablethinking.com',
      // Vercel gives each deployment its own hostnames. Without these, the
      // admin hits the same silent 401 on every preview deployment.
      process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
      process.env.VERCEL_BRANCH_URL && `https://${process.env.VERCEL_BRANCH_URL}`,
      process.env.VERCEL_PROJECT_PRODUCTION_URL &&
        `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
      // Escape hatch: comma-separated extra origins. Lets a domain change be
      // fixed with an env var instead of a code change and a redeploy.
      ...(process.env.PAYLOAD_CSRF_ORIGINS?.split(',').map((origin) => origin.trim()) ?? []),
    ].filter(Boolean) as string[],
  ),
)

export default buildConfig({
  serverURL,

  // CORS: origins permitted to read responses from the Payload REST/GraphQL
  // API. These are the public brand sites that may call the read-only API.
  cors: [
    'https://transformidablethinking.com',
    'https://www.transformidablethinking.com',
    'https://jerribland.com',
    'https://lumynr.com',
    'https://agentpmo.com',
    'https://vettersgroup.com',
  ],

  // CSRF: only requests from these origins can carry the admin session cookie
  // and mutate data. Without this, any site a logged-in admin visits could
  // POST to the CMS API on their behalf.
  csrf: csrfOrigins,

  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— Transformidable CMS',
    },
  },

  localization: {
    locales: ['en'],
    defaultLocale: 'en',
  },

  editor: lexicalEditor(),

  // Case-follow digest emails (see api/cron/case-digest) need an adapter to
  // actually send through. Sends via Proton SMTP. Falls back to Payload's
  // default no-op/console adapter when the SMTP env vars aren't set, so
  // local dev without them doesn't break.
  // Note: if SMTP_HOST points at a local Proton Mail Bridge instance, it
  // must be reachable from wherever this app runs (e.g. a persistent
  // server or a Bridge instance exposed to Vercel) — Bridge running on a
  // developer's laptop won't be reachable from serverless functions.
  email:
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
      ? nodemailerAdapter({
          defaultFromAddress: process.env.EMAIL_FROM || 'hello@transformidablethinking.com',
          defaultFromName: 'Transformidable',
          transportOptions: {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          },
        })
      : undefined,

  collections: [
    // Active collections
    Users,
    Media,
    Publications,
    CaseFiles,
    ResearchNotes,
    Articles,
    Issues,
    Verticals,
    Topics,
    Books,
    Subscribers,
    CaseFollows,
    CaseSubmissions,
    ContactMessages,
    // Legacy collections — hidden from nav, kept for data access
    { ...Authors, admin: { ...Authors.admin, hidden: true } },
    { ...BrandPillars, admin: { ...BrandPillars.admin, hidden: true } },
    { ...PodcastEpisodes, admin: { ...PodcastEpisodes.admin, hidden: true } },
    { ...Sponsors, admin: { ...Sponsors.admin, hidden: true } },
    { ...NewsletterIssues, admin: { ...NewsletterIssues.admin, hidden: true } },
  ],

  globals: [SiteSettings, TransformidableFeature],

  db: postgresAdapter({
    pool: {
      connectionString,
    },
    push: false,
  }),

  secret: (() => {
    const secret = process.env.PAYLOAD_SECRET
    if (secret) return secret
    if (process.env.NODE_ENV === 'production') {
      throw new Error('PAYLOAD_SECRET is required in production')
    }
    return 'dev-only-insecure-secret'
  })(),

  sharp,

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  plugins: [
    // Vercel Blob Storage for media uploads
    // Serves from assets.transformidablethinking.com in production
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: {
              media: true,
            },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
  ],
})
