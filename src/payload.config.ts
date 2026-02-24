import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Articles } from './collections/Articles'
import { PodcastEpisodes } from './collections/PodcastEpisodes'
import { Authors } from './collections/Authors'
import { BrandPillars } from './collections/BrandPillars'
import { Sponsors } from './collections/Sponsors'
import { NewsletterIssues } from './collections/NewsletterIssues'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
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
      connectionString: process.env.DATABASE_URL || '',
    },
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
