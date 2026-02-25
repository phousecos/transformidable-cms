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
import { PodcastEpisodes } from './collections/PodcastEpisodes.ts'
import { Authors } from './collections/Authors.ts'
import { BrandPillars } from './collections/BrandPillars.ts'
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

  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— Transformidable CMS',
    },
  },

  editor: lexicalEditor(),

  collections: [
    Users,
    Media,
    Articles,
    PodcastEpisodes,
    Authors,
    BrandPillars,
    Sponsors,
    NewsletterIssues,
  ],

  db: postgresAdapter({
    pool: {
      connectionString,
    },
    push: true,
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
