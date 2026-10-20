import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor } from '../access/checkRole.ts'
import { isWorkers } from '../lib/runtime.ts'

// Downloadable documents (checklists, guides, overviews) that the brand sites
// list for visitors. Each record is the file itself plus what a downloads page
// needs to show and filter it, so documents stay out of the Media library.
// Files are stored under their own documents/ prefix in R2. Each brand site pulls
// only the documents tagged with its brand, e.g. jlynne.co asks for
// brand = jlynne and status = published.
//
// The option values below are what the brand sites filter on, so renaming a
// value (not a label) breaks those sites' filters — add new values instead.

export const DOCUMENT_BRANDS = [
  { label: 'J. Lynne', value: 'jlynne' },
  { label: 'Transformidable', value: 'transformidable' },
  { label: 'Jerri Bland', value: 'jerribland' },
]

// Grouped under two headings on the sites: Governance and Leadership. The
// heading is in the label so editors see the grouping in the admin too.
export const DOCUMENT_SERVICE_AREAS = [
  { label: 'Governance — AI / Artificial Intelligence', value: 'ai' },
  { label: 'Governance — ERP / Core', value: 'erp-core' },
  { label: 'Governance — General Technology', value: 'general-technology' },
  { label: 'Governance — Mergers & Acquisitions', value: 'mergers-acquisitions' },
  { label: 'Leadership — Fractional CIO', value: 'fractional-cio' },
  { label: 'Leadership — Leadership Transitions', value: 'leadership-transitions' },
  { label: 'Leadership — Transformations', value: 'transformations' },
]

export const DOCUMENT_SECTORS = [
  { label: 'General (all sectors)', value: 'general' },
  { label: 'Higher Education & Nonprofit', value: 'highered-nonprofit' },
  { label: 'Credit Unions', value: 'credit-unions' },
]

export const DOCUMENT_TYPES = [
  { label: 'Overview', value: 'overview' },
  { label: 'Checklist', value: 'checklist' },
  { label: 'Guide', value: 'guide' },
  { label: 'Brief', value: 'brief' },
  { label: 'Framework', value: 'framework' },
  { label: 'Template', value: 'template' },
  { label: 'Worksheet', value: 'worksheet' },
  { label: 'Report', value: 'report' },
]

export const DOCUMENT_STATUSES = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
]

export const Documents: CollectionConfig = {
  slug: 'documents',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'filename', 'brand', 'serviceAreas', 'sector', 'status'],
    description:
      'Downloadable documents for the brand sites. Each site lists the published documents tagged with its brand.',
  },
  access: {
    create: isAdminOrEditor,
    read: ({ req: { user } }) => {
      if (!user) return { status: { equals: 'published' } }
      const u = user as Record<string, unknown>
      if (u.role === 'admin' || u.role === 'editor') return true
      return { status: { equals: 'published' } }
    },
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  upload: {
    mimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ],
    // Same reasons as Media: no sharp on Workers, and safeFetch needs Node.
    crop: false,
    focalPoint: false,
    skipSafeFetch: isWorkers,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'One or two sentences shown on the download card.',
      },
    },
    {
      name: 'documentType',
      type: 'select',
      options: DOCUMENT_TYPES,
      admin: {
        description: 'Shown as the small label above the title on the card.',
      },
    },
    {
      name: 'brand',
      type: 'select',
      hasMany: true,
      required: true,
      options: DOCUMENT_BRANDS,
      admin: {
        position: 'sidebar',
        description: 'Which brand sites list this document.',
      },
    },
    {
      name: 'serviceAreas',
      type: 'select',
      hasMany: true,
      required: true,
      options: DOCUMENT_SERVICE_AREAS,
      admin: {
        position: 'sidebar',
        description: 'The service areas this document supports. Pick every one that applies.',
      },
    },
    {
      name: 'sector',
      type: 'select',
      required: true,
      defaultValue: 'general',
      options: DOCUMENT_SECTORS,
      admin: {
        position: 'sidebar',
        description: 'General documents appear under every sector filter.',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Optional. Lower numbers are listed first; ties sort by title.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: DOCUMENT_STATUSES,
      admin: {
        position: 'sidebar',
        description: 'Only published documents are visible to the brand sites.',
      },
    },
  ],
}
