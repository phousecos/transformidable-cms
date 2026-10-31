// Select options and slots for Message Templates and Message Snippets. As with
// Assets, values are short, stable codes that KADE queries on, so never change a
// value once it is in use. KADE's docs/messages.md describes the same contract.

import { ASSET_TYPE_OPTIONS, TRACK_OPTIONS } from './assetOptions.ts'

export { SECTOR_EDITION_OPTIONS, STATUS_OPTIONS } from './assetOptions.ts'

export const SEQUENCE_OPTIONS = [
  { label: 'Cohort (ten weeks)', value: 'cohort' },
  { label: 'AI monthly invitation (Track 8)', value: 'ai-monthly' },
  { label: 'Webinar invitation', value: 'webinar-invite' },
]

export const STEP_OPTIONS = [
  { label: 'Week 2: personal note and Governance Brief', value: 'week-2' },
  { label: 'Week 5: webinar invitation', value: 'week-5' },
  { label: 'Week 8: attendee follow-up', value: 'week-8' },
  { label: 'Week 9: Board Brief', value: 'week-9' },
  { label: 'Week 10: invitation to a conversation', value: 'week-10' },
  { label: 'Invitation', value: 'invite' },
  { label: 'Follow-up', value: 'follow-up' },
]

// Which steps belong to which sequence.
export const SEQUENCE_STEPS: Record<string, string[]> = {
  cohort: ['week-2', 'week-5', 'week-8', 'week-9', 'week-10'],
  'ai-monthly': ['invite', 'follow-up'],
  'webinar-invite': ['invite', 'follow-up'],
}

export const AUDIENCE_OPTIONS = [
  { label: 'Everyone', value: 'all' },
  { label: 'Engaged (Week 10)', value: 'engaged' },
  { label: 'Not engaged (Week 10)', value: 'not-engaged' },
  { label: 'Attendees (Week 8)', value: 'attendees' },
]

// The audiences other than "all" that a step has.
export const STEP_AUDIENCES: Record<string, string[]> = {
  'week-8': ['attendees'],
  'week-10': ['engaged', 'not-engaged'],
}

// T1–T8, or one template shared by every track.
export const MESSAGE_TRACK_OPTIONS = [
  ...TRACK_OPTIONS.filter((o) => /^T[1-8]$/.test(o.value)),
  { label: 'Any track', value: 'any' },
]

const PLAIN_SLOTS = [
  'first_name',
  'organization',
  'hook',
  'webinar.title',
  'webinar.date',
  'webinar.description',
  'webinar.registration_link',
  'webinar.followup_link',
  'booking_link',
  'signature',
]
const ASSET_TYPES = ASSET_TYPE_OPTIONS.map((o) => o.value)

/**
 * The slots in a template or snippet that KADE can't fill, as messages for the
 * editor. Snippets can't include other snippets. The postal address and opt-out
 * line are never slots: KADE adds them to every email.
 */
export function unknownSlots(text: string, { inSnippet = false } = {}): string[] {
  const problems: string[] = []
  for (const [, raw] of text.matchAll(/\{\{\s*([^}]*?)\s*\}\}/g)) {
    const [kind, arg] = raw.split(':', 2)
    if (arg === undefined) {
      if (!PLAIN_SLOTS.includes(raw)) problems.push(`{{${raw}}} is not a slot`)
    } else if (kind === 'asset' || kind === 'secondary_asset') {
      if (!ASSET_TYPES.includes(arg)) problems.push(`{{${raw}}}: "${arg}" is not an asset type`)
    } else if (kind === 'snippet') {
      if (inSnippet) problems.push(`{{${raw}}}: a snippet can't include another snippet`)
      else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(arg)) problems.push(`{{${raw}}}: snippet keys are lowercase-and-hyphens`)
    } else {
      problems.push(`{{${raw}}} is not a slot`)
    }
  }
  return [...new Set(problems)]
}

export const SLOT_HELP =
  'Slots: {{first_name}}, {{organization}}, {{hook}}, {{webinar.title}}, {{webinar.date}}, {{webinar.description}}, ' +
  '{{webinar.registration_link}}, {{webinar.followup_link}}, {{booking_link}}, {{signature}}, {{asset:governance-brief}} ' +
  '(any asset type), {{secondary_asset:checklist}}, {{snippet:key}}. KADE adds the postal address and opt-out line itself.'
