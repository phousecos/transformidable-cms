import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/checkRole.ts'

export const BrandPillars: CollectionConfig = {
  slug: 'brand-pillars',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'mappedDomain', 'contentFocus'],
  },
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier (auto-generated from name if left blank)',
      },
      hooks: {
        beforeValidate: [
          ({ value, siblingData }) => {
            if (!value && siblingData?.name) {
              return siblingData.name
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
      name: 'mappedDomain',
      type: 'text',
      required: true,
      admin: {
        description: 'The brand domain this pillar maps to (e.g., unlimitedpowerhouse.com)',
      },
    },
    {
      name: 'contentFocus',
      type: 'textarea',
      admin: {
        description: 'Brief description of the content focus for this pillar',
      },
    },
  ],
}
