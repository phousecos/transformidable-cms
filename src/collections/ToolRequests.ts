import type { CollectionConfig } from 'payload'
import { isAdmin, isLoggedIn } from '../access/checkRole.ts'

// Who asked for which Advisory tool on /advisory/tools/{slug}, with the
// campaign tags (?cohort=, utm_*) they arrived under.
export const ToolRequests: CollectionConfig = {
  slug: 'tool-requests',
  labels: { singular: 'Tool Download', plural: 'Tool Downloads' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'organization', 'asset', 'joinedBrief', 'createdAt'],
    description: 'People who downloaded an Advisory tool.',
  },
  access: {
    // Only the api/advisory-tools route creates these (it validates and
    // rate-limits, and the Local API bypasses this check).
    create: () => false,
    read: isLoggedIn,
    update: isLoggedIn,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true, index: true },
        { name: 'organization', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'asset', type: 'relationship', relationTo: 'assets', required: true, index: true },
        {
          name: 'joinedBrief',
          label: 'Joined the Brief',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Campaign',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'cohort', type: 'text', index: true },
            { name: 'utmSource', type: 'text' },
            { name: 'utmMedium', type: 'text' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'utmCampaign', type: 'text' },
            { name: 'utmTerm', type: 'text' },
            { name: 'utmContent', type: 'text' },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
