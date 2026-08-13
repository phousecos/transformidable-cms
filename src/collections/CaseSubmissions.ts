import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '../access/checkRole.ts'

// Documents and feedback submitted by readers via the case file page. Lands
// here as a moderation queue — nothing here is public or linked from a case
// file until a reviewer approves it and manually adds it to the case.
export const CaseSubmissions: CollectionConfig = {
  slug: 'case-submissions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['type', 'caseFile', 'submitterEmail', 'status', 'submittedAt'],
    description: 'Documents and feedback submitted by readers for review, from the case file "Contribute" form.',
  },
  access: {
    create: () => true,
    read: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Document', value: 'document' },
        { label: 'Feedback', value: 'feedback' },
      ],
    },
    {
      name: 'caseFile',
      type: 'relationship',
      relationTo: 'case-files',
      required: true,
    },
    {
      name: 'submitterName',
      type: 'text',
      admin: { description: 'Optional.' },
    },
    {
      name: 'submitterEmail',
      type: 'email',
      admin: { description: 'Optional — provide for follow-up on this submission.' },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      admin: { description: 'Description/context for a document, or the feedback itself.' },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      admin: { description: 'Optional link to the document (documents only).' },
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional uploaded copy (documents only).' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending review', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      name: 'submittedAt',
      type: 'date',
      admin: { readOnly: true },
      hooks: { beforeValidate: [({ value }) => value || new Date().toISOString()] },
    },
    {
      name: 'reviewerNote',
      type: 'textarea',
      admin: { description: 'Internal note for reviewers — not shown to the submitter.' },
    },
  ],
}
