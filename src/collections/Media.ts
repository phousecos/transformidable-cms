import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor, isAdminOrEditorOrContributor } from '../access/checkRole.ts'
import { isWorkers } from '../lib/runtime.ts'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'filename', 'mimeType', 'updatedAt'],
  },
  access: {
    create: isAdminOrEditorOrContributor,
    read: () => true,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  upload: {
    mimeTypes: ['image/*', 'audio/*', 'application/pdf'],
    // No imageSizes, crop, or focal point: all three need sharp, which can't
    // run on Cloudflare Workers. The site only ever used the original file.
    crop: false,
    focalPoint: false,
    // Duplicating a media item downloads the stored file through Payload's
    // safeFetch, which needs Node's DNS and undici and fails on Workers. Its
    // job — refusing private network addresses — is already done there by
    // the global_fetch_strictly_public flag in wrangler.jsonc, so on Workers
    // plain fetch() is as safe.
    skipSafeFetch: isWorkers,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Descriptive alt text for accessibility',
      },
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
}
