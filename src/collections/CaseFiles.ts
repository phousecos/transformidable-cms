import type { CollectionConfig, Where } from 'payload'
import { isLoggedIn } from '../access/checkRole.ts'

// Case Files — primary field research: anatomies of real governance decisions
// and their outcomes. Each file is a dossier assembled from many sources
// (timeline, documents, audits, coverage, notes) plus our own analysis.
//
// Content is organized into admin tabs that mirror the public case sections.
// The tabs are unnamed, so every field stays at the top level of the document
// (no nested data) — the tabs are purely an authoring convenience.
export const CaseFiles: CollectionConfig = {
  slug: 'case-files',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['caseNumber', 'title', 'sector', 'caseStatus', 'featured', 'status'],
    description: 'Anatomies of real governance decisions and why they held or failed.',
  },
  access: {
    create: isLoggedIn,
    read: ({ req: { user } }) => {
      if (!user) {
        const publishedOnly: Where = { status: { equals: 'published' } }
        return publishedOnly
      }
      return true
    },
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: { description: 'URL-friendly slug (auto-generated from title if left blank)' },
      hooks: {
        beforeValidate: [
          ({ value, siblingData }) => {
            if (!value && siblingData?.title) {
              return (siblingData.title as string)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },

    // ── Publishing controls (sidebar) ────────────────────────────────────
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'caseNumber',
      type: 'number',
      admin: { position: 'sidebar', description: 'Displayed as "Case File No. 014".' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Pin as the homepage Case File feature.' },
    },
    {
      name: 'displayOrder',
      type: 'number',
      admin: { position: 'sidebar', description: 'Lower numbers sort first (ties broken by date).' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar', description: 'Controls newest-first ordering.' },
    },

    // ── Tabbed content ───────────────────────────────────────────────────
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          description: 'The summary the case opens with.',
          fields: [
            {
              name: 'dek',
              type: 'textarea',
              admin: { description: 'One or two sentences shown in listings and beneath the title.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'sector',
                  type: 'text',
                  admin: { width: '33%', description: 'e.g. "Public university system".' },
                },
                {
                  name: 'jurisdiction',
                  type: 'text',
                  admin: { width: '33%', description: 'e.g. "California".' },
                },
                {
                  name: 'caseStatus',
                  type: 'select',
                  admin: { width: '34%', description: 'Where the case stands.' },
                  options: [
                    { label: 'Ongoing', value: 'ongoing' },
                    { label: 'Under review', value: 'under-review' },
                    { label: 'In litigation', value: 'in-litigation' },
                    { label: 'Resolved', value: 'resolved' },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'method', type: 'text', admin: { width: '50%', description: 'Research method, e.g. "Decision-trace".' } },
                { name: 'readTime', type: 'number', admin: { width: '50%', description: 'Estimated read time in minutes.' } },
              ],
            },
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Optional lead image.' },
            },
            {
              name: 'overview',
              type: 'richText',
              admin: { description: 'The full overview narrative.' },
            },
          ],
        },
        {
          label: 'Timeline',
          fields: [
            { name: 'timelineLabel', type: 'text', admin: { description: 'Optional caption, e.g. "The eleven-month decision window".' } },
            {
              name: 'timeline',
              type: 'array',
              labels: { singular: 'Event', plural: 'Events' },
              admin: { description: 'Chronological events. Mark the pivotal ones as key moments.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'time', type: 'text', required: true, admin: { width: '30%', description: 'Date or marker, e.g. "Mar 2020" or "Go-live".' } },
                    { name: 'title', type: 'text', required: true, admin: { width: '70%' } },
                  ],
                },
                { name: 'description', type: 'textarea' },
                { name: 'keyMoment', type: 'checkbox', defaultValue: false, admin: { description: 'Highlight this event.' } },
              ],
            },
          ],
        },
        {
          label: 'Organizations',
          fields: [
            {
              name: 'organizations',
              type: 'array',
              labels: { singular: 'Organization', plural: 'Organizations' },
              admin: { description: 'The parties involved and their role in the case.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', required: true, admin: { width: '55%' } },
                    { name: 'role', type: 'text', admin: { width: '45%', description: 'e.g. "Implementer", "Vendor", "Oversight".' } },
                  ],
                },
                { name: 'description', type: 'textarea' },
                { name: 'url', type: 'text', admin: { description: 'Optional link.' } },
              ],
            },
          ],
        },
        {
          label: 'Documents',
          fields: [
            {
              name: 'documents',
              type: 'array',
              labels: { singular: 'Document', plural: 'Documents' },
              admin: { description: 'Primary-source documents. Attach a file or link out.' },
              fields: [
                { name: 'title', type: 'text', required: true },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'docType',
                      type: 'select',
                      admin: { width: '50%' },
                      options: [
                        { label: 'Filing', value: 'filing' },
                        { label: 'Contract', value: 'contract' },
                        { label: 'Memo', value: 'memo' },
                        { label: 'Report', value: 'report' },
                        { label: 'Presentation', value: 'presentation' },
                        { label: 'Correspondence', value: 'correspondence' },
                        { label: 'Other', value: 'other' },
                      ],
                    },
                    { name: 'date', type: 'date', admin: { width: '50%' } },
                  ],
                },
                { name: 'file', type: 'upload', relationTo: 'media', admin: { description: 'Uploaded copy (optional).' } },
                { name: 'url', type: 'text', admin: { description: 'External link (optional).' } },
                { name: 'description', type: 'textarea' },
              ],
            },
          ],
        },
        {
          label: 'Audit Reports',
          fields: [
            {
              name: 'auditReports',
              type: 'array',
              labels: { singular: 'Audit report', plural: 'Audit reports' },
              fields: [
                { name: 'title', type: 'text', required: true },
                {
                  type: 'row',
                  fields: [
                    { name: 'auditor', type: 'text', admin: { width: '60%', description: 'Who conducted the audit.' } },
                    { name: 'date', type: 'date', admin: { width: '40%' } },
                  ],
                },
                { name: 'summary', type: 'textarea', admin: { description: 'Key findings in brief.' } },
                { name: 'url', type: 'text', admin: { description: 'Link to the report (optional).' } },
                { name: 'file', type: 'upload', relationTo: 'media', admin: { description: 'Uploaded copy (optional).' } },
              ],
            },
          ],
        },
        {
          label: 'News Coverage',
          fields: [
            {
              name: 'newsCoverage',
              type: 'array',
              labels: { singular: 'Article', plural: 'Articles' },
              fields: [
                { name: 'headline', type: 'text', required: true },
                {
                  type: 'row',
                  fields: [
                    { name: 'outlet', type: 'text', admin: { width: '60%' } },
                    { name: 'date', type: 'date', admin: { width: '40%' } },
                  ],
                },
                { name: 'url', type: 'text' },
                { name: 'excerpt', type: 'textarea' },
              ],
            },
          ],
        },
        {
          label: 'Research Notes',
          fields: [
            {
              name: 'researchNotes',
              type: 'array',
              labels: { singular: 'Note', plural: 'Notes' },
              admin: { description: 'Our working notes on the case.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'title', type: 'text', admin: { width: '70%' } },
                    { name: 'date', type: 'date', admin: { width: '30%' } },
                  ],
                },
                { name: 'note', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'Governance Mechanisms',
          fields: [
            {
              name: 'governanceMechanisms',
              type: 'array',
              labels: { singular: 'Mechanism', plural: 'Mechanisms' },
              admin: { description: 'The governance structures at play, and how each held up.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', required: true, admin: { width: '65%', description: 'e.g. "Board oversight committee".' } },
                    {
                      name: 'assessment',
                      type: 'select',
                      admin: { width: '35%' },
                      options: [
                        { label: 'Strength', value: 'strength' },
                        { label: 'Weakness', value: 'weakness' },
                        { label: 'Observation', value: 'observation' },
                      ],
                    },
                  ],
                },
                { name: 'description', type: 'textarea' },
              ],
            },
          ],
        },
        {
          label: 'Analysis',
          description: 'Podcast, AI summary, and lessons.',
          fields: [
            {
              name: 'podcastEpisode',
              type: 'relationship',
              relationTo: 'podcast-episodes',
              admin: { description: 'A related podcast episode, if any.' },
            },
            {
              name: 'aiSummary',
              type: 'textarea',
              admin: { description: 'An AI-generated summary of the case. Shown with an "AI-generated" label.' },
            },
            {
              name: 'lessonsLearned',
              type: 'array',
              labels: { singular: 'Lesson', plural: 'Lessons' },
              fields: [
                { name: 'lesson', type: 'text', required: true },
                { name: 'detail', type: 'textarea' },
              ],
            },
          ],
        },
        {
          label: 'Related',
          fields: [
            {
              name: 'relatedCases',
              type: 'relationship',
              relationTo: 'case-files',
              hasMany: true,
              admin: { description: 'Other case files a reader should see next.' },
            },
            {
              name: 'topics',
              type: 'relationship',
              relationTo: 'topics',
              hasMany: true,
              admin: { description: 'Subject-area tags.' },
            },
          ],
        },
      ],
    },
  ],
}
