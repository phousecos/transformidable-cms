import type { CollectionConfig } from 'payload'
import { isLoggedIn, isStaffOrApiClient } from '../../access/checkRole.ts'
import { isWorkers } from '../../lib/runtime.ts'

// Files used by Assets: Word originals, tagged PDFs, video, images. This was
// the `media` collection on the jlynne.io instance; it has its own slug here
// because Transformidable's public `media` already exists. Not public: files
// are read through the API with a login or an API client key, and reach
// prospects only through jlynne.co. Stored in R2 under asset-files/.
export const AssetFiles: CollectionConfig = {
  slug: 'asset-files',
  labels: { singular: 'Asset File', plural: 'Asset Files' },
  admin: {
    useAsTitle: 'filename',
    description:
      'Name files T{n}_{AssetType}_{Sector}_v{n}.{ext}, for example T6_GovBrief_PrivateSector_v1.docx.',
  },
  access: {
    read: isStaffOrApiClient,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      admin: {
        description: 'Alt text, required for images shown to readers.',
      },
    },
  ],
  upload: {
    // No sharp on Workers; see the Media collection.
    crop: false,
    focalPoint: false,
    skipSafeFetch: isWorkers,
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'video/*',
      'image/*',
    ],
  },
}
