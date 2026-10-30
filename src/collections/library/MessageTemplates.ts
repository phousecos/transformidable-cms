import type { CollectionConfig } from 'payload'

import { isLoggedIn, isStaffOrApiClient } from '../../access/checkRole.ts'
import { currentTemplate } from './currentTemplate.ts'
import {
  AUDIENCE_OPTIONS,
  MESSAGE_TRACK_OPTIONS,
  SECTOR_EDITION_OPTIONS,
  SEQUENCE_OPTIONS,
  SEQUENCE_STEPS,
  SLOT_HELP,
  STATUS_OPTIONS,
  STEP_AUDIENCES,
  STEP_OPTIONS,
  unknownSlots,
} from './messageOptions.ts'

type Sibling = { sequence?: string; step?: string }

// A custom validate replaces Payload's own, so the required check is repeated here.
const slotsValid = (value: string | null | undefined) => {
  if (!value?.trim()) return 'This field is required.'
  const problems = unknownSlots(value)
  return problems.length ? problems.join('; ') : true
}

// The copy of each email KADE sends: one template per sequence, step, track,
// sector edition and audience. KADE fills in the slots per account (the opening
// about their event, links, signature) and freezes the text when it is approved,
// so editing a Final template changes only emails not yet approved.
export const MessageTemplates: CollectionConfig = {
  slug: 'message-templates',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sequence', 'step', 'track', 'sectorEdition', 'audience', 'status', 'version'],
    listSearchableFields: ['name', 'subject'],
    description: 'Email copy for KADE. KADE uses the current Final template for each step and adds the postal address and opt-out line.',
  },
  access: {
    read: isStaffOrApiClient,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  endpoints: [currentTemplate],
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { placeholder: 'T2 Week 2: Governance Brief note' },
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
          name: 'sequence',
          type: 'select',
          required: true,
          index: true,
          options: SEQUENCE_OPTIONS,
        },
        {
          name: 'step',
          type: 'select',
          required: true,
          index: true,
          options: STEP_OPTIONS,
          validate: (value: string | null | undefined, { siblingData }: { siblingData: Sibling }) => {
            if (!value) return 'This field is required.'
            const steps = SEQUENCE_STEPS[siblingData?.sequence ?? '']
            return !steps || steps.includes(value) || `This sequence's steps are ${steps.join(', ')}.`
          },
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
          index: true,
          options: MESSAGE_TRACK_OPTIONS,
        },
        {
          name: 'sectorEdition',
          type: 'select',
          required: true,
          defaultValue: 'all',
          index: true,
          options: SECTOR_EDITION_OPTIONS,
        },
        {
          name: 'audience',
          type: 'select',
          required: true,
          defaultValue: 'all',
          options: AUDIENCE_OPTIONS,
          validate: (value: string | null | undefined, { siblingData }: { siblingData: Sibling }) => {
            if (!value) return 'This field is required.'
            if (value === 'all') return true
            const allowed = STEP_AUDIENCES[siblingData?.step ?? ''] ?? []
            return allowed.includes(value) || 'Only Week 8 (attendees) and Week 10 (engaged, not engaged) have audiences.'
          },
        },
      ],
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      validate: slotsValid,
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      validate: slotsValid,
      admin: {
        rows: 14,
        description: `Plain text, no images or tracking. ${SLOT_HELP}`,
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: { description: 'For editors only; never sent.' },
    },
  ],
}
