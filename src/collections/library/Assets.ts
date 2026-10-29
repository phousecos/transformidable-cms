import { APIError, type CollectionConfig, type Where } from 'payload'

import { isLoggedIn, isStaffOrApiClient } from '../../access/checkRole.ts'
import { currentAsset } from './currentAsset.ts'
import {
  ASSET_TYPE_OPTIONS,
  SECTOR_EDITION_OPTIONS,
  STATUS_OPTIONS,
  TRACK_OPTIONS,
} from './assetOptions.ts'

const PUBLISHED_STATUSES = ['final', 'retired']

// One record per piece of collateral in the J. Lynne library (moved here from
// the jlynne.io instance). Select values are short, stable codes so connected
// systems (KADE, jlynne.co) can query them; labels are for people. Internal
// only: nothing here is public, and none of it appears on the public site.
export const Assets: CollectionConfig = {
  slug: 'assets',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'track', 'assetType', 'sectorEdition', 'status', 'version'],
    listSearchableFields: ['title', 'slug'],
    group: 'J. Lynne Library',
  },
  access: {
    read: isStaffOrApiClient,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  endpoints: [currentAsset],
  hooks: {
    beforeChange: [
      ({ data, originalDoc, operation }) => {
        // Slugs appear in printed jlynne.co links, so they freeze once published.
        if (
          operation === 'update' &&
          originalDoc &&
          PUBLISHED_STATUSES.includes(originalDoc.status) &&
          data.slug !== undefined &&
          data.slug !== originalDoc.slug
        ) {
          throw new APIError(
            `The slug "${originalDoc.slug}" is published and can't change. Create a new asset instead.`,
            400,
            undefined,
            true,
          )
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      maxLength: 240,
      admin: {
        description: 'One or two sentences shown on the jlynne.co Resources card.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: (value: string | null | undefined) => {
        if (!value) return true
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))
          return 'Use lowercase letters, numbers and hyphens only.'
        // jlynne.co/downloads/updated is the "this resource has been updated" page.
        return value !== 'updated' || 'This slug is reserved.'
      },
      admin: {
        description:
          'Used in jlynne.co/downloads/{slug}. Locked once the asset is Final or Retired.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'draft',
          index: true,
          options: STATUS_OPTIONS,
        },
        {
          name: 'version',
          type: 'text',
          admin: { placeholder: 'v1' },
        },
        {
          name: 'versionDate',
          type: 'date',
        },
      ],
    },
    {
      name: 'track',
      type: 'select',
      hasMany: true,
      index: true,
      options: TRACK_OPTIONS,
    },
    {
      name: 'assetType',
      type: 'select',
      index: true,
      options: ASSET_TYPE_OPTIONS,
    },
    {
      name: 'sectorEdition',
      type: 'select',
      index: true,
      options: SECTOR_EDITION_OPTIONS,
    },
    {
      name: 'playbookWeeks',
      type: 'number',
      hasMany: true,
      min: 1,
      max: 10,
      admin: {
        description: 'Signal Communications Playbook weeks (1–10).',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'brand',
          type: 'select',
          required: true,
          defaultValue: 'jlynne',
          options: [
            { label: 'J. Lynne', value: 'jlynne' },
            { label: 'Transformidable', value: 'transformidable' },
          ],
          admin: {
            description: 'Transformidable items are referenced by URL, not stored here.',
          },
        },
        {
          name: 'use',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Public', value: 'public' },
            { label: 'Direct mail', value: 'direct-mail' },
            { label: 'Email', value: 'email' },
            { label: 'Webinar takeaway', value: 'webinar-takeaway' },
            { label: 'Website download', value: 'website-download' },
          ],
        },
      ],
    },
    {
      name: 'sourceFile',
      type: 'upload',
      relationTo: 'asset-files',
      admin: {
        description: 'Word original.',
        condition: (data) => data?.brand !== 'transformidable',
      },
    },
    {
      name: 'publishedFile',
      type: 'upload',
      relationTo: 'asset-files',
      admin: {
        description: 'Accessible (tagged) PDF, or video.',
        condition: (data) => data?.brand !== 'transformidable',
      },
    },
    {
      name: 'externalUrl',
      type: 'text',
      validate: (
        value: string | null | undefined,
        { siblingData }: { siblingData: { brand?: string } },
      ) => {
        if (!value) {
          return siblingData?.brand === 'transformidable'
            ? 'Transformidable items need a URL.'
            : true
        }
        try {
          const { protocol } = new URL(value)
          return protocol === 'https:' || 'Use an https:// URL.'
        } catch {
          return 'Enter a full URL, starting with https://.'
        }
      },
      admin: {
        description: 'For Transformidable items or hosted video.',
      },
    },
    {
      name: 'derivedFrom',
      type: 'relationship',
      relationTo: 'assets',
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
      admin: {
        description: 'The asset this one was cut from, e.g. Brief 06 ← Vendor Governance Guide.',
      },
    },
    {
      name: 'replacedBy',
      type: 'relationship',
      relationTo: 'assets',
      filterOptions: ({ id }): Where => ({
        and: [{ status: { equals: 'final' } }, ...(id ? [{ id: { not_equals: id } }] : [])],
      }),
      admin: {
        description:
          'Where jlynne.co/downloads/{slug} sends people once this is Retired. Leave empty to show a "this resource has been updated" page.',
        condition: (data) => data?.status === 'retired',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}
