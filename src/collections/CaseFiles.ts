import type { CollectionConfig, Where } from 'payload'
import { isLoggedIn } from '../access/checkRole.ts'
import { DOMAINS } from '../lib/governanceDomains.ts'
import { CONSEQUENCE_TYPES, SEGMENT_TYPES, selectOptions } from '../lib/governanceCodebook.ts'

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
                { name: 'url', type: 'text', admin: { description: 'Link to the source (preferred).' } },
                { name: 'file', type: 'upload', relationTo: 'media', admin: { description: 'Or upload a copy (optional).' } },
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
                { name: 'url', type: 'text', admin: { description: 'Link to the report (preferred).' } },
                { name: 'file', type: 'upload', relationTo: 'media', admin: { description: 'Or upload a copy (optional).' } },
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
              type: 'relationship',
              relationTo: 'research-notes',
              hasMany: true,
              admin: { description: 'Research notes from the Research section that inform this case.' },
            },
          ],
        },
        {
          label: 'Governance Mechanisms',
          fields: [
            {
              name: 'governanceMechanisms',
              type: 'array',
              labels: { singular: 'Coded finding', plural: 'Coded findings' },
              admin: {
                description:
                  'One row per coded segment from the coding sheet. Normally loaded with `npm run import:coding` rather than typed here — re-running that import makes this list match the CSV exactly, so hand edits to an imported case will be overwritten.',
                initCollapsed: true,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      // The coding sheet's own id (e.g. "D2-01"). It is the key
                      // the importer matches on, so changing one here detaches
                      // the row from its source and the next import re-creates it.
                      name: 'segment',
                      type: 'text',
                      admin: { width: '25%', description: 'Segment id from the coding sheet.' },
                    },
                    {
                      name: 'segmentType',
                      type: 'select',
                      defaultValue: 'narrative-finding',
                      admin: {
                        width: '35%',
                        description: 'Only narrative findings are tallied in the tables.',
                      },
                      options: SEGMENT_TYPES.map((t) => ({ label: t.label, value: t.value })),
                    },
                    {
                      name: 'primaryDomain',
                      type: 'select',
                      admin: { width: '40%', description: 'The domain this finding is counted under.' },
                      options: DOMAINS.map((d) => ({ label: `${d.code} — ${d.short}`, value: d.code })),
                    },
                  ],
                },
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  admin: { description: 'The governance mechanism, as worded in the coding sheet.' },
                },
                {
                  // Recorded because the codebook allows a segment to touch more
                  // than one domain, but deliberately NOT counted: tallying a
                  // finding under every domain it touches would inflate every
                  // total and double-count the same evidence.
                  name: 'secondaryDomains',
                  type: 'select',
                  hasMany: true,
                  admin: { description: 'Other domains this finding touches. Recorded, not counted.' },
                  options: DOMAINS.map((d) => ({ label: `${d.code} — ${d.short}`, value: d.code })),
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'design', type: 'select', admin: { width: '50%', description: 'Q1 — Was it set up? (§8 design state)' }, options: selectOptions('design') },
                    { name: 'operational', type: 'select', admin: { width: '50%', description: 'Q2 — Did it work in practice? (§8 operational state)' }, options: selectOptions('operational') },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'evidence', type: 'select', admin: { width: '50%', description: 'Q3 — How solid is the proof? (§8 evidence state)' }, options: selectOptions('evidence') },
                    { name: 'relationship', type: 'select', admin: { width: '50%', description: 'Q4 — Did it matter? (§11 governance–consequence relationship)' }, options: selectOptions('relationship') },
                  ],
                },
                {
                  name: 'effectiveness',
                  type: 'select',
                  admin: { description: 'Overall — did it work? (§9 effectiveness). Assessed after the other four, not inferred from the outcome.' },
                  options: selectOptions('effectiveness'),
                },
                {
                  name: 'consequenceTypes',
                  type: 'select',
                  hasMany: true,
                  admin: { description: '§10 consequence domains. Recorded separately from governance.' },
                  options: CONSEQUENCE_TYPES.map((c) => ({ label: c, value: c })),
                },
                {
                  name: 'assessment',
                  type: 'select',
                  admin: {
                    description:
                      '(Legacy) The old Strength/Weakness/Observation scale, superseded by the coded questions above. Kept so pre-coding rows do not lose their value.',
                  },
                  options: [
                    { label: 'Strength', value: 'strength' },
                    { label: 'Weakness', value: 'weakness' },
                    { label: 'Observation', value: 'observation' },
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
