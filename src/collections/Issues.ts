import type { CollectionConfig } from 'payload'

export const Issues: CollectionConfig = {
  slug: 'issues',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'issueNumber', 'volume', 'status', 'publicationDate'],
    description: 'Magazine-style issues. Each issue groups articles and carries its own theme.',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return { status: { equals: 'published' } }
      return true
    },
  },
  fields: [
    {
      name: 'issueNumber',
      type: 'number',
      required: true,
    },
    {
      name: 'volume',
      type: 'number',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'e.g. "Issue 01 — Spring 2026"',
      },
    },
    {
      name: 'themeTagline',
      type: 'text',
      admin: {
        description: 'e.g. "When technology outruns leadership..."',
      },
    },
    {
      name: 'themeSubheading',
      type: 'text',
      admin: {
        description: 'e.g. "This issue — Technology, Trust..."',
      },
    },
    {
      name: 'publicationDate',
      type: 'date',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Published', value: 'published' },
      ],
    },
    {
      name: 'editorLetter',
      type: 'group',
      fields: [
        {
          name: 'body',
          type: 'richText',
          admin: {
            description: 'Issue-specific editor letter (recurring per issue)',
          },
        },
        {
          name: 'signoff',
          type: 'text',
          admin: {
            description: 'e.g. "— Dr. Jerri Bland"',
          },
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
        },
        {
          name: 'metaDescription',
          type: 'textarea',
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Preview image for social sharing (LinkedIn, Twitter, etc.)',
          },
        },
      ],
    },
  ],
}
