import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '../access/checkRole.ts'

export const NewsletterIssues: CollectionConfig = {
  slug: 'newsletter-issues',
  admin: {
    useAsTitle: 'issueLabel',
    defaultColumns: ['issueLabel', 'issueDate', 'status'],
  },
  access: {
    create: isAdminOrEditor,
    read: ({ req: { user } }) => {
      if (!user) return { status: { equals: 'sent' } }
      const u = user as Record<string, unknown>
      if (u.role === 'admin' || u.role === 'editor') return true
      return { status: { equals: 'sent' } }
    },
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'issueNumber',
      type: 'number',
      required: true,
      unique: true,
    },
    {
      name: 'issueLabel',
      type: 'text',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeValidate: [
          ({ siblingData }) => {
            return `Issue #${siblingData?.issueNumber || '?'}`
          },
        ],
      },
    },
    {
      name: 'issueDate',
      type: 'date',
      required: true,
    },
    {
      name: 'editorsNote',
      type: 'richText',
      admin: {
        description: "Brief intro from Jerri",
      },
    },
    {
      name: 'featuredArticles',
      type: 'relationship',
      relationTo: 'articles',
      hasMany: true,
      admin: {
        description: '2-3 featured articles for this issue',
      },
    },
    {
      name: 'featuredEpisode',
      type: 'relationship',
      relationTo: 'podcast-episodes',
      admin: {
        description: 'Featured podcast episode for this issue',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Sent', value: 'sent' },
      ],
    },
  ],
}
