import type { CollectionConfig } from 'payload'
import crypto from 'crypto'
import { isAdmin, isAdminOrEditor } from '../access/checkRole.ts'

// Readers following a specific Case File for daily update digests. Distinct
// from Subscribers (the general newsletter list) because a follow is scoped
// to one case, not the whole publication.
export const CaseFollows: CollectionConfig = {
  slug: 'case-follows',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'caseFile', 'status', 'subscribedAt'],
    description: 'Readers following a case file for daily update digests. Created from the "Follow this case" form.',
  },
  access: {
    // Public can create (follow) but not read/update/delete via the API —
    // the case-follow route and unsubscribe link handle those server-side.
    create: () => true,
    read: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  // One active-or-not follow per (email, case) pair — enforced at the DB
  // level so a concurrent double-submit can't create duplicates.
  indexes: [{ fields: ['email', 'caseFile'], unique: true }],
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'caseFile',
      type: 'relationship',
      relationTo: 'case-files',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Unsubscribed', value: 'unsubscribed' },
      ],
    },
    {
      name: 'unsubscribeToken',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        description: 'One-click unsubscribe link token, generated automatically.',
      },
      hooks: {
        beforeValidate: [({ value }) => value || crypto.randomBytes(24).toString('hex')],
      },
    },
    {
      name: 'subscribedAt',
      type: 'date',
      admin: { readOnly: true },
      hooks: { beforeValidate: [({ value }) => value || new Date().toISOString()] },
    },
    {
      name: 'lastNotifiedAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'When this follower last received a digest mentioning this case.',
      },
    },
  ],
}
