import type { CollectionConfig } from 'payload'
import { isLoggedIn } from '../access/checkRole.ts'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName'],
  },
  access: {
    create: isLoggedIn,
    read: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
    },
    // Legacy role field — kept so existing DB column is not orphaned
    {
      name: 'role',
      type: 'select',
      defaultValue: 'admin',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Brand Contributor', value: 'brandContributor' },
        { label: 'Sponsor Manager', value: 'sponsorManager' },
      ],
      admin: {
        description: '(Legacy) Role-based access has been simplified. All logged-in users have full access.',
      },
    },
    {
      name: 'assignedBrandPillar',
      type: 'relationship',
      relationTo: 'brand-pillars',
      admin: {
        description: '(Legacy) Brand pillar assignment — data preserved for migration',
      },
    },
  ],
}
