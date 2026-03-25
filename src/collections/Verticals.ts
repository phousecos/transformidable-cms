import type { CollectionConfig } from 'payload'

export const Verticals: CollectionConfig = {
  slug: 'verticals',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'color'],
    description: 'Editorial verticals (e.g. Technology Strategy, Women in Tech, Leadership & Change)',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        description: 'Auto-generated from name if left blank',
      },
      hooks: {
        beforeValidate: [
          ({ value, siblingData }) => {
            if (!value && siblingData?.name) {
              return (siblingData.name as string)
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
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'color',
      type: 'text',
      admin: {
        description: 'Hex color for label rendering in TOC (e.g. #4A90D9)',
      },
    },
  ],
}
