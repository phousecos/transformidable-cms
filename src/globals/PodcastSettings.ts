import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access/checkRole.ts'
import { COVER_ART_MAX, COVER_ART_MIN, PODCAST_CATEGORIES, PODCAST_DEFAULTS } from '../lib/podcast.ts'

// Show-level details for the podcast RSS feed (/podcast/feed.xml), which is
// what Apple Podcasts, Spotify and other apps read.
export const PodcastSettings: GlobalConfig = {
  slug: 'podcast-settings',
  label: 'Podcast Settings',
  admin: {
    description:
      'Show details for the podcast feed at /podcast/feed.xml. Apple Podcasts and Spotify read these; changes reach them the next time they check the feed.',
  },
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: PODCAST_DEFAULTS.title,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      defaultValue: PODCAST_DEFAULTS.description,
      admin: {
        description: 'Shown on the show page in podcast apps.',
      },
    },
    {
      name: 'author',
      type: 'text',
      required: true,
      defaultValue: PODCAST_DEFAULTS.author,
    },
    {
      name: 'ownerEmail',
      type: 'email',
      required: true,
      defaultValue: PODCAST_DEFAULTS.ownerEmail,
      admin: {
        description:
          'Listed in the feed. Apple and Spotify send ownership verification codes here, so it must receive mail.',
      },
    },
    {
      name: 'coverArt',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { in: ['image/jpeg', 'image/png'] } },
      admin: {
        description: `Square JPG or PNG, ${COVER_ART_MIN}–${COVER_ART_MAX} px on each side (Apple's requirement).`,
      },
      validate: async (value: unknown, { req }: { req: any }) => {
        if (!value) return true
        const id = typeof value === 'object' ? (value as { id: number }).id : value
        const media = await req.payload.findByID({ collection: 'media', id, depth: 0, req })
        if (!['image/jpeg', 'image/png'].includes(media?.mimeType)) {
          return 'Cover art must be a JPG or PNG.'
        }
        const { width, height } = media
        if (width !== height) return `Cover art must be square (this one is ${width}×${height}).`
        if (width < COVER_ART_MIN || width > COVER_ART_MAX) {
          return `Cover art must be ${COVER_ART_MIN}–${COVER_ART_MAX} px on each side (this one is ${width}×${height}).`
        }
        return true
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'primaryCategory',
          type: 'select',
          required: true,
          defaultValue: PODCAST_DEFAULTS.primaryCategory,
          options: PODCAST_CATEGORIES,
        },
        {
          name: 'secondaryCategory',
          type: 'select',
          defaultValue: PODCAST_DEFAULTS.secondaryCategory,
          options: PODCAST_CATEGORIES,
        },
      ],
    },
    {
      name: 'explicit',
      type: 'checkbox',
      defaultValue: PODCAST_DEFAULTS.explicit,
      admin: {
        description: 'Mark the show as containing explicit content.',
      },
    },
  ],
}
