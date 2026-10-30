import type { CollectionConfig } from 'payload'

import { isLoggedIn, isStaffOrApiClient } from '../../access/checkRole.ts'
import {
  MESSAGE_TRACK_OPTIONS,
  SECTOR_EDITION_OPTIONS,
  SLOT_HELP,
  STATUS_OPTIONS,
  unknownSlots,
} from './messageOptions.ts'

// Standard paragraphs that templates include as {{snippet:key}}: a track's value
// statement, a line for one sector. KADE picks the current Final snippet for a key
// the way it picks templates: the account's track before "any", its sector edition
// before "all".
export const MessageSnippets: CollectionConfig = {
  slug: 'message-snippets',
  admin: {
    useAsTitle: 'key',
    defaultColumns: ['key', 'track', 'sectorEdition', 'status', 'version'],
    listSearchableFields: ['key', 'body'],
    description: 'Reusable paragraphs for Message Templates, included as {{snippet:key}}.',
  },
  access: {
    read: isStaffOrApiClient,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      index: true,
      validate: (value: string | null | undefined) => {
        if (!value) return 'This field is required.'
        return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) || 'Use lowercase letters, numbers and hyphens only.'
      },
      admin: {
        description: 'Templates use it as {{snippet:key}}. Several snippets can share a key, one per track or sector edition.',
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
      type: 'row',
      fields: [
        {
          name: 'track',
          type: 'select',
          required: true,
          defaultValue: 'any',
          options: MESSAGE_TRACK_OPTIONS,
        },
        {
          name: 'sectorEdition',
          type: 'select',
          required: true,
          defaultValue: 'all',
          options: SECTOR_EDITION_OPTIONS,
        },
      ],
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      validate: (value: string | null | undefined) => {
        if (!value?.trim()) return 'This field is required.'
        const problems = unknownSlots(value, { inSnippet: true })
        return problems.length ? problems.join('; ') : true
      },
      admin: {
        rows: 6,
        description: `Plain text. ${SLOT_HELP} A snippet can't include another snippet.`,
      },
    },
  ],
}
