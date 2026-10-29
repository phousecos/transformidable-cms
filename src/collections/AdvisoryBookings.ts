import type { CollectionConfig } from 'payload'
import { isAdmin, isLoggedIn } from '../access/checkRole.ts'

// Conversations booked from /advisory/conversation. Cal.com holds the booking;
// its webhook (/api/advisory-booking) copies each one here with the intake
// answers and the campaign tags (?cohort=, utm_*) it was booked under, so
// conversations can be traced to the outreach that produced them.
export const AdvisoryBookings: CollectionConfig = {
  slug: 'advisory-bookings',
  labels: { singular: 'Advisory Booking', plural: 'Advisory Bookings' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'organization', 'area', 'startTime', 'status', 'cohort'],
    description: 'Copied from Cal.com when a conversation is booked, rescheduled, or cancelled.',
  },
  access: {
    // Only the webhook route creates these (it verifies Cal.com's signature,
    // and the Local API bypasses this check).
    create: () => false,
    read: isLoggedIn,
    update: isLoggedIn,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'calUid',
      label: 'Cal.com booking ID',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'booked',
          index: true,
          options: [
            { label: 'Booked', value: 'booked' },
            { label: 'Rescheduled', value: 'rescheduled' },
            { label: 'Cancelled', value: 'cancelled' },
          ],
        },
        { name: 'startTime', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'endTime', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'timeZone', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'organization', type: 'text' },
        { name: 'role', type: 'text' },
        { name: 'area', type: 'text' },
      ],
    },
    {
      name: 'problem',
      label: "What's the governance problem?",
      type: 'textarea',
    },
    {
      type: 'collapsible',
      label: 'Campaign',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'cohort', type: 'text', index: true },
            { name: 'utmSource', type: 'text' },
            { name: 'utmMedium', type: 'text' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'utmCampaign', type: 'text' },
            { name: 'utmTerm', type: 'text' },
            { name: 'utmContent', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'rescheduledFrom',
      label: 'Rescheduled from (Cal.com booking ID)',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'notes',
      label: 'Booking notes (as sent to Cal.com)',
      type: 'textarea',
      admin: { readOnly: true },
    },
    {
      name: 'followUp',
      label: 'Follow-up notes',
      type: 'textarea',
    },
  ],
  timestamps: true,
}
