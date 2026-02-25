import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '../access/checkRole.ts'

export const PodcastEpisodes: CollectionConfig = {
  slug: 'podcast-episodes',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'episodeNumber', 'season', 'status', 'publishDate'],
    listSearchableFields: ['title', 'description'],
  },
  versions: {
    drafts: true,
  },
  access: {
    create: isAdminOrEditor,
    read: ({ req: { user } }) => {
      if (!user) return { status: { equals: 'published' } }
      const u = user as Record<string, unknown>
      if (u.role === 'admin' || u.role === 'editor') return true
      return { status: { equals: 'published' } }
    },
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly slug (auto-generated from title if left blank)',
      },
      hooks: {
        beforeValidate: [
          ({ value, siblingData }) => {
            if (!value && siblingData?.title) {
              return (siblingData.title as string)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'episodeNumber',
      type: 'number',
      required: true,
    },
    {
      name: 'season',
      type: 'number',
      required: true,
      defaultValue: 1,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Show notes summary',
      },
    },
    {
      name: 'audioUrl',
      type: 'text',
      admin: {
        description: 'Embed URL or hosted file path for the episode audio',
      },
    },
    {
      name: 'transcript',
      type: 'richText',
      admin: {
        description: 'Full episode transcript',
      },
    },
    {
      name: 'showNotes',
      type: 'richText',
      admin: {
        description: 'Links, references, and resources mentioned in the episode',
      },
    },
    {
      name: 'guest',
      type: 'relationship',
      relationTo: 'authors',
      admin: {
        description: 'Guest appearing on this episode',
      },
    },
    {
      name: 'publishDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Episode artwork',
      },
    },
    {
      name: 'brandPillars',
      type: 'relationship',
      relationTo: 'brand-pillars',
      hasMany: true,
      admin: {
        description: 'Tag with brand pillars to control where this episode surfaces',
      },
    },
    {
      name: 'syndicateTo',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'jerribland.com', value: 'jerribland' },
        { label: 'unlimitedpowerhouse.com', value: 'unlimitedpowerhouse' },
        { label: 'agentpmo.com', value: 'agentpmo' },
        { label: 'prept.com', value: 'prept' },
        { label: 'lumynr.com', value: 'lumynr' },
      ],
      admin: {
        description: 'Which brand properties may republish this episode',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Review', value: 'review' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Published', value: 'published' },
      ],
    },
  ],
}
