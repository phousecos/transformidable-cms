import type { CollectionConfig, Where } from 'payload'
import { isLoggedIn } from '../access/checkRole.ts'
import { validateHttpUrl } from '../access/validateUrl.ts'

export const Books: CollectionConfig = {
  slug: 'books',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'section', 'is_current_selection', 'status'],
    description: 'The Reading Room — curated book catalog for transformidable.media/reading-room',
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
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // When a book is marked as the current selection, uncheck all others
        if (data?.is_current_selection) {
          await req.payload.update({
            collection: 'books',
            where: {
              is_current_selection: { equals: true },
            },
            data: {
              is_current_selection: false,
            },
          })
        }
        return data
      },
    ],
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
      name: 'author',
      type: 'text',
      required: true,
      admin: {
        description: 'Author name',
      },
    },
    {
      name: 'cover_image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Book cover image',
      },
    },
    {
      name: 'editorial_note',
      type: 'textarea',
      admin: {
        description: 'Short description (2–3 sentences). Written by Jerri. Optional.',
      },
    },
    {
      name: 'section',
      type: 'select',
      required: true,
      options: [
        { label: 'Book Club', value: 'book_club' },
        { label: 'Career & Leadership', value: 'career_leadership' },
        { label: 'Professional Development', value: 'professional_development' },
        { label: 'PMO & Technology', value: 'pmo_technology' },
        { label: 'Staff Picks', value: 'staff_picks' },
      ],
      admin: {
        description: 'Which Reading Room section this book appears in',
      },
    },
    {
      name: 'illuminate_badge',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show Illuminate Book Club badge on this book',
      },
    },
    {
      name: 'is_current_selection',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Mark as the current Book Club selection (drives the hero). Only one book should be active at a time — checking this will automatically uncheck any other current selection.',
      },
    },
    {
      name: 'bookshop_url',
      type: 'text',
      validate: validateHttpUrl,
      admin: {
        description: 'Full Bookshop.org affiliate URL — required for third-party titles',
      },
    },
    {
      name: 'amazon_url',
      type: 'text',
      validate: validateHttpUrl,
      admin: {
        description: 'Amazon affiliate URL — optional. Secondary CTA only.',
      },
    },
    {
      name: 'payhip_url',
      type: 'text',
      validate: validateHttpUrl,
      admin: {
        description: 'Payhip product URL — for titles sold directly (e.g. Transformidable)',
      },
    },
    {
      name: 'published_date',
      type: 'date',
      admin: {
        description: 'Date the book was published to The Reading Room. Used to sort Past Selections.',
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
  ],
}
