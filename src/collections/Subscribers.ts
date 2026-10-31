import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '../access/checkRole.ts'

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'source', 'subscribedAt', 'status'],
    description: 'Newsletter subscribers collected from the subscribe page.',
  },
  access: {
    // Public submissions go through the matching /api route, which runs the
    // spam checks and writes with the local API (access rules skipped). The
    // auto-generated REST endpoint stays closed to the public so bots can't
    // post here directly and skip those checks.
    create: isAdminOrEditor,
    read: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'name',
      type: 'text',
      admin: {
        description: 'Optional — collected if provided',
      },
    },
    {
      // Which mailing lists this person asked for. Empty on subscribers who
      // signed up before lists existed; they all joined the Brief.
      name: 'lists',
      type: 'select',
      hasMany: true,
      defaultValue: ['brief'],
      options: [
        { label: 'The Transformidable Brief', value: 'brief' },
        { label: 'Book updates', value: 'book' },
      ],
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'website',
      options: [
        { label: 'Website', value: 'website' },
        { label: 'Reading Room', value: 'reading_room' },
        { label: 'Article', value: 'article' },
        { label: 'Manual', value: 'manual' },
      ],
    },
    {
      name: 'subscribedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ value }) => value || new Date().toISOString(),
        ],
      },
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
  ],
}
