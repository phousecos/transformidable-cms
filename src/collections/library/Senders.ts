import type { CollectionConfig } from 'payload'

import { isLoggedIn, isStaffOrApiClient } from '../../access/checkRole.ts'

// The people KADE sends email as. KADE matches a sender by mailbox and puts the
// signature where a template has {{signature}}. Mailbox access, pacing and
// warm-up are KADE's, not kept here.
export const Senders: CollectionConfig = {
  slug: 'senders',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'mailbox', 'active'],
    description: 'Who KADE sends email as, and their signatures.',
  },
  access: {
    read: isStaffOrApiClient,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'mailbox',
          type: 'email',
          required: true,
          unique: true,
          admin: { description: 'The address KADE sends from.' },
        },
        {
          name: 'active',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'signature',
      type: 'textarea',
      required: true,
      admin: {
        rows: 5,
        description: 'Plain text: name, title, phone. The postal address and opt-out line come from Messaging Settings.',
      },
    },
  ],
}
