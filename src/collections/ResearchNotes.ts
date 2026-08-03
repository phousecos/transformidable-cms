import type { CollectionConfig, Where } from 'payload'
import { isLoggedIn } from '../access/checkRole.ts'

// Research Notes — the "Research Notes" area of the Research section: shorter,
// working findings that stand on their own and can also be attached to a Case
// File (case-files.researchNotes references this collection).
export const ResearchNotes: CollectionConfig = {
  slug: 'research-notes',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', 'status'],
    description: 'Working findings in the Research section. Can be linked from Case Files.',
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
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: { description: 'URL-friendly slug (auto-generated from title if left blank)' },
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
    { name: 'dek', type: 'textarea', admin: { description: 'Short summary shown in listings.' } },
    { name: 'body', type: 'richText', admin: { description: 'The note itself.' } },
    { name: 'readTime', type: 'number', admin: { description: 'Estimated read time in minutes.' } },
    {
      name: 'topics',
      type: 'relationship',
      relationTo: 'topics',
      hasMany: true,
      admin: { description: 'Subject-area tags.' },
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
      admin: { position: 'sidebar' },
    },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar', description: 'Controls newest-first ordering.' } },
  ],
}
