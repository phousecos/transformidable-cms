import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '../access/checkRole.ts'
import { validateHttpUrl } from '../access/validateUrl.ts'

export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'type', 'associatedBrand', 'isActive'],
  },
  access: {
    create: isAdminOrEditor,
    read: () => true,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'headshot',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'role',
      type: 'text',
      admin: {
        description: 'e.g., "Founder and Editor-in-Chief, Transformidable LLC"',
      },
    },
    {
      name: 'associatedBrand',
      type: 'relationship',
      relationTo: 'brand-pillars',
      admin: {
        description: 'Which brand this author represents',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'staff',
      options: [
        { label: 'Staff', value: 'staff' },
        { label: 'Guest Contributor', value: 'guestContributor' },
        { label: 'Podcast Guest', value: 'podcastGuest' },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      admin: {
        description: 'Social media and website links',
      },
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'Twitter / X', value: 'twitter' },
            { label: 'Website', value: 'website' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          validate: validateHttpUrl,
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
