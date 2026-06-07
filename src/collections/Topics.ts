import type { CollectionConfig } from 'payload'
import { isLoggedIn } from '../access/checkRole.ts'

/**
 * Topics — a controlled vocabulary used to tag the subject area of an
 * Article. Distinct from Verticals (editorial sections) and Brand Pillars
 * (brand→domain mapping): a Topic is *what the article is about* and is the
 * dimension downstream consumers (e.g. the CIO Advisra site) personalise on
 * via tag overlap. Because matching is by `slug`, the slug is the contract —
 * keep it stable and lowercase-hyphenated.
 */
export const Topics: CollectionConfig = {
  slug: 'topics',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
    description: 'Subject-area tags for articles (e.g. AI, Cybersecurity, Cloud strategy).',
  },
  access: {
    // Public read so downstream sites can resolve topic slugs at depth.
    read: () => true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
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
        description:
          'Lowercase-hyphenated identifier downstream sites match on. Auto-generated from name if left blank.',
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
      admin: {
        description: 'Optional editorial note on what belongs under this topic.',
      },
    },
  ],
}
