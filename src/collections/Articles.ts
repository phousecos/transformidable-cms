import type { CollectionConfig, Where } from 'payload'
import { isAdmin, isAdminOrEditorOrContributor, isAdminOrEditorFieldAccess } from '../access/checkRole.ts'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'publishDate'],
    listSearchableFields: ['title', 'excerpt'],
  },
  versions: {
    drafts: true,
  },
  access: {
    create: isAdminOrEditorOrContributor,
    read: ({ req: { user } }) => {
      const publishedOnly: Where = { status: { equals: 'published' } }
      if (!user) return publishedOnly
      const u = user as Record<string, unknown>
      if (u.role === 'admin' || u.role === 'editor') return true
      if (u.role === 'brandContributor' && u.assignedBrandPillar) {
        const pillarId =
          typeof u.assignedBrandPillar === 'string'
            ? u.assignedBrandPillar
            : (u.assignedBrandPillar as Record<string, unknown>).id
        const where: Where = {
          or: [
            { status: { equals: 'published' } },
            { brandPillars: { equals: pillarId } },
          ],
        }
        return where
      }
      return publishedOnly
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      const u = user as Record<string, unknown>
      if (u.role === 'admin' || u.role === 'editor') return true
      if (u.role === 'brandContributor' && u.assignedBrandPillar) {
        const pillarId =
          typeof u.assignedBrandPillar === 'string'
            ? u.assignedBrandPillar
            : (u.assignedBrandPillar as Record<string, unknown>).id
        return {
          brandPillars: { equals: pillarId },
        }
      }
      return false
    },
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
      name: 'body',
      type: 'richText',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: '2-3 sentence summary for cards and previews',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      required: true,
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
    },
    {
      name: 'brandPillars',
      type: 'relationship',
      relationTo: 'brand-pillars',
      hasMany: true,
      admin: {
        description: 'Tag with brand pillars to control where this article surfaces',
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
        { label: 'vettersgroup.com', value: 'vettersgroup' },
      ],
      admin: {
        description: 'Which brand properties may republish this article',
      },
    },
    {
      name: 'cycleNumber',
      type: 'number',
      admin: {
        description: 'Editorial calendar cycle this article belongs to (e.g. 1, 2, 3).',
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
      access: {
        update: isAdminOrEditorFieldAccess,
      },
    },
    {
      name: 'seoTitle',
      type: 'text',
      admin: {
        description: 'Optional override for the page title tag',
      },
    },
    {
      name: 'seoDescription',
      type: 'textarea',
      admin: {
        description: 'Optional override for the meta description',
      },
    },
    {
      name: 'isMemberOnly',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Flag for Lumynr exclusive content',
      },
    },
  ],
}
