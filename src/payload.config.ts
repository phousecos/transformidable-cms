import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import sharp from 'sharp'

import { Users } from './collections/Users.ts'
import { Media } from './collections/Media.ts'
import { Articles } from './collections/Articles.ts'
import { Issues } from './collections/Issues.ts'
import { Verticals } from './collections/Verticals.ts'
import { Books } from './collections/Books.ts'
import { SiteSettings } from './globals/SiteSettings.ts'

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

export default buildConfig({
  serverURL,

  cors: [
    'https://transformidable.media',
    'https://www.transformidable.media',
    'https://jerribland.com',
    'https://lumynr.com',
    'https://agentpmo.com',
    'https://unlimitedpowerhouse.com',
    'https://vettersgroup.com',
  ],

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

  collections: [
    // Active collections
    Users,
    Media,
    Articles,
    Issues,
    Verticals,
    Books,
    // Legacy collections — hidden from nav, kept for data access
    { ...Authors, admin: { ...Authors.admin, hidden: true } },
    { ...BrandPillars, admin: { ...BrandPillars.admin, hidden: true } },
    { ...PodcastEpisodes, admin: { ...PodcastEpisodes.admin, hidden: true } },
    { ...Sponsors, admin: { ...Sponsors.admin, hidden: true } },
    { ...NewsletterIssues, admin: { ...NewsletterIssues.admin, hidden: true } },
  ],

  globals: [SiteSettings],

  db: postgresAdapter({
    pool: {
      connectionString,
    },
    push: false,
  }),

  secret: process.env.PAYLOAD_SECRET || 'CHANGE-ME-IN-PRODUCTION',

  sharp,

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  plugins: [
    // Vercel Blob Storage for media uploads
    // Serves from assets.transformidable.media in production
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
