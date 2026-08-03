import type { CollectionConfig, Where } from 'payload'
import { isLoggedIn } from '../access/checkRole.ts'

// Publications — the edited, on-the-record output of the research: The
// Governance Files (flagship series), Articles, White Papers, and Annual
// Reports. Distinct from Case Files, which are primary field research.
export const Publications: CollectionConfig = {
  slug: 'publications',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'seriesLabel', 'publishedAt', 'featured', 'status'],
    description: 'Governance Files, Articles, White Papers, and Annual Reports.',
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
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'article',
      options: [
        { label: 'Governance File', value: 'governance-file' },
        { label: 'Article', value: 'article' },
        { label: 'White Paper', value: 'white-paper' },
        { label: 'Annual Report', value: 'annual-report' },
      ],
      admin: {
        description: 'Which publication series this belongs to. Drives the label shown on the site.',
      },
    },
    {
      name: 'dek',
      type: 'textarea',
      admin: {
        description: 'Short summary shown in listings.',
      },
    },
    {
      name: 'seriesLabel',
      type: 'text',
      admin: {
        description: 'Optional issue/series marker, e.g. "No. 07" or "Vol. I".',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional cover or lead image.',
      },
    },
    {
      name: 'body',
      type: 'richText',
      admin: {
        description: 'Full publication content (optional for externally hosted PDFs).',
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
      name: 'pageCount',
      type: 'number',
      admin: {
        description: 'For white papers and reports: page count of the PDF.',
      },
    },
    {
      name: 'assetUrl',
      type: 'text',
      admin: {
        description: 'Optional link to a downloadable PDF or externally hosted version.',
      },
    },
    {
      name: 'peerReviewed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show a "Peer-reviewed" marker (typically for white papers).',
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
        description: 'Surface this publication ahead of others on the homepage.',
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
