import type { CollectionConfig, Where } from 'payload'
import { isLoggedIn } from '../access/checkRole.ts'

// Case Files — primary field research: anatomies of real governance
// decisions and their outcomes. The evidence base the Publications draw on.
export const CaseFiles: CollectionConfig = {
  slug: 'case-files',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['caseNumber', 'title', 'sector', 'publishedAt', 'featured', 'status'],
    description: 'Anatomies of real governance decisions and why they held or failed.',
  },
  access: {
    create: isLoggedIn,
    read: ({ req: { user } }) => {
      if (!user) {
        const publishedOnly: Where = { status: { equals: 'published' } }
        return publishedOnly
      }
      return true
    },
    update: isLoggedIn,
    delete: isLoggedIn,
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
      name: 'caseNumber',
      type: 'number',
      admin: {
        description: 'Sequential case number. Displayed as "Case File No. 014".',
      },
    },
    {
      name: 'dek',
      type: 'textarea',
      admin: {
        description: 'Short summary shown in listings and beneath the title.',
      },
    },
    {
      name: 'sector',
      type: 'text',
      admin: {
        description: 'Sector studied, e.g. "Financial cooperative".',
      },
    },
    {
      name: 'method',
      type: 'text',
      admin: {
        description: 'Research method, e.g. "Decision-trace".',
      },
    },
    {
      name: 'readTime',
      type: 'number',
      admin: {
        description: 'Estimated read time in minutes.',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional lead image.',
      },
    },
    {
      name: 'body',
      type: 'richText',
      admin: {
        description: 'Full case-file content.',
      },
    },
    {
      // The decision timeline rendered as "Exhibit A" on the homepage feature.
      name: 'exhibit',
      type: 'array',
      admin: {
        description: 'Optional decision timeline. Each row is one moment in the case.',
      },
      fields: [
        {
          name: 'time',
          type: 'text',
          required: true,
          admin: { description: 'Time marker, e.g. "-11 mo" or "Go-live".' },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: { description: 'What happened at this moment.' },
        },
        {
          name: 'detail',
          type: 'text',
          admin: { description: 'One-line elaboration.' },
        },
        {
          name: 'keyMoment',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Highlight this row as a pivotal decision.' },
        },
      ],
    },
    {
      name: 'exhibitLabel',
      type: 'text',
      admin: {
        description: 'Caption for the exhibit, e.g. "The eleven-month decision window".',
      },
    },
    {
      name: 'topics',
      type: 'relationship',
      relationTo: 'topics',
      hasMany: true,
      admin: {
        description: 'Subject-area tags.',
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      admin: {
        description: 'Lower numbers sort first within a listing (ties broken by date).',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Surface this case file as the homepage feature.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        description: 'Publication date. Controls newest-first ordering.',
      },
    },
  ],
}
