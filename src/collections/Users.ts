import type { CollectionConfig } from 'payload'
import { isAdmin, isLoggedIn, isAdminFieldAccess } from '../access/checkRole'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'role'],
  },
  access: {
    create: isAdmin,
    read: isLoggedIn,
    update: ({ req: { user } }) => {
      if (!user) return false
      if ((user as Record<string, unknown>).role === 'admin') return true
      return { id: { equals: user.id } }
    },
    delete: isAdmin,
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
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'brandContributor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Brand Contributor', value: 'brandContributor' },
        { label: 'Sponsor Manager', value: 'sponsorManager' },
      ],
      access: {
        update: isAdminFieldAccess,
      },
    },
    {
      name: 'assignedBrandPillar',
      type: 'relationship',
      relationTo: 'brand-pillars',
      admin: {
        condition: (data) => data?.role === 'brandContributor',
        description: 'The brand pillar this contributor is assigned to (for Brand Contributors only)',
      },
    },
  ],
}
