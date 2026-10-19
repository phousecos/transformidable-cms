import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '../access/checkRole.ts'
import { validateHttpUrl } from '../access/validateUrl.ts'
import { durationSeconds, youtubeId } from '../lib/podcast.ts'

export const PodcastEpisodes: CollectionConfig = {
  slug: 'podcast-episodes',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'episodeNumber', 'season', 'status', 'publishDate'],
  },
  versions: true,
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
      name: 'youtubeUrl',
      type: 'text',
      admin: {
        description: 'The episode on YouTube (any youtube.com or youtu.be link). Embedded on the episode page.',
      },
      validate: (value: string | null | undefined) =>
        !value || youtubeId(value) ? true : 'Not a recognisable YouTube video link.',
    },
    {
      name: 'audioFile',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { contains: 'audio' } },
      admin: {
        description:
          'The episode audio (MP3). This is what podcast apps download from the RSS feed; an episode without audio is left out of the feed.',
      },
    },
    {
      name: 'duration',
      type: 'text',
      admin: {
        description: 'Running time, e.g. 25:00 or 1:02:30. Shown in podcast apps.',
      },
      validate: (value: string | null | undefined) =>
        !value || durationSeconds(value) !== null ? true : 'Use mm:ss or h:mm:ss, e.g. 25:00.',
    },
    {
      name: 'audioUrl',
      type: 'text',
      validate: validateHttpUrl,
      admin: {
        description:
          'Only if the audio is hosted elsewhere: a direct link to the audio file. Ignored when an audio file is uploaded above.',
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
        { label: 'Jerri Bland', value: 'jerribland' },
        { label: 'AgentPMO', value: 'agentpmo' },
        { label: 'Prept', value: 'prept' },
        { label: 'Lumynr', value: 'lumynr' },
        { label: 'Vetters Group', value: 'vettersgroup' },
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
