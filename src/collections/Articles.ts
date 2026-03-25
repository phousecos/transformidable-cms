import type { CollectionConfig, Where } from 'payload'
import { isLoggedIn } from '../access/checkRole.ts'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'issue', 'vertical', 'displayOrder', 'isFlagship', 'status'],
  },
  versions: true,
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
    // ── New schema fields ──────────────────────────────────────
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
      name: 'issue',
      type: 'relationship',
      relationTo: 'issues',
      admin: {
        description: 'Which issue this article belongs to',
      },
    },
    {
      name: 'vertical',
      type: 'relationship',
      relationTo: 'verticals',
      admin: {
        description: 'Editorial vertical (e.g. Technology Strategy)',
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      admin: {
        description: '1 = flagship, 2–5 = supporting. Controls TOC layout order.',
      },
    },
    {
      name: 'isFlagship',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Check for the flagship article (large TOC treatment). One per issue.',
      },
    },
    {
      name: 'dek',
      type: 'textarea',
      admin: {
        description: 'Short editorial summary written specifically for the TOC display',
      },
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
    },
    {
      name: 'readTime',
      type: 'number',
      admin: {
        description: 'Estimated read time in minutes',
      },
    },
    {
      name: 'citationsNotes',
      type: 'textarea',
      admin: {
        description: 'Internal field — source verification notes. Not rendered publicly.',
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
    {
      name: 'publishedAt',
      type: 'date',
    },

    // ── Legacy fields (kept for existing data) ─────────────────
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      admin: {
        description: '(Legacy) Original author relationship — data preserved for migration',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: '(Legacy) Replaced by dek — data preserved for migration',
      },
    },
    {
      name: 'publishDate',
      type: 'date',
      admin: {
        description: '(Legacy) Replaced by publishedAt — data preserved for migration',
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
        description: '(Legacy) Hero/featured image — data preserved for migration',
      },
    },
    {
      name: 'brandPillars',
      type: 'relationship',
      relationTo: 'brand-pillars',
      hasMany: true,
      admin: {
        description: '(Legacy) Replaced by vertical — data preserved for migration',
      },
    },
    {
      name: 'syndicateTo',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Jerri Bland', value: 'jerribland' },
        { label: 'UnlimITed Powerhouse', value: 'unlimitedpowerhouse' },
        { label: 'AgentPMO', value: 'agentpmo' },
        { label: 'Prept', value: 'prept' },
        { label: 'Lumynr', value: 'lumynr' },
        { label: 'Vetters Group', value: 'vettersgroup' },
      ],
      admin: {
        description: '(Legacy) Brand syndication — data preserved for migration',
      },
    },
    {
      name: 'cycleNumber',
      type: 'number',
      admin: {
        description: '(Legacy) Editorial calendar cycle — data preserved for migration',
      },
    },
    {
      name: 'seoTitle',
      type: 'text',
      admin: {
        description: '(Legacy) SEO title override — data preserved for migration',
      },
    },
    {
      name: 'seoDescription',
      type: 'textarea',
      admin: {
        description: '(Legacy) SEO description — data preserved for migration',
      },
    },
    {
      name: 'isMemberOnly',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: '(Legacy) Lumynr exclusive flag — data preserved for migration',
      },
    },
  ],
}
