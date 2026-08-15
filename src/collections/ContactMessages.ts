import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '../access/checkRole.ts'

// Messages submitted via the public /contact form. Lands here as an inbox —
// nothing here is public.
export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['name', 'email', 'subject', 'status', 'submittedAt'],
    description: 'Messages submitted through the public contact form.',
  },
  access: {
    create: () => true,
    read: isAdminOrEditor,
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
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'subject',
      type: 'text',
      admin: { description: 'Optional.' },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Read', value: 'read' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'submittedAt',
      type: 'date',
      admin: { readOnly: true },
      hooks: { beforeValidate: [({ value }) => value || new Date().toISOString()] },
    },
  ],
}
