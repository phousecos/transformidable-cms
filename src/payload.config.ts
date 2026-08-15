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

const serverURL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.NEXT_PUBLIC_SERVER_URL || ''

// Origins that own the admin session cookie. CSRF-validated state-changing
// requests must come from one of these. Keep this list tight — adding an
// origin here lets it issue authenticated cookie-bearing requests.
const csrfOrigins = [
  serverURL,
  'https://cms.transformidablethinking.com',
].filter(Boolean) as string[]

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
