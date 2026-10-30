import type { GlobalConfig } from 'payload'

import { isLoggedIn, isStaffOrApiClient } from '../access/checkRole.ts'
import { validateHttpUrl } from '../access/validateUrl.ts'

// What every KADE email carries. KADE adds the postal address and the opt-out line
// after the body of every email (CAN-SPAM), and tags the booking link with the
// cohort and step it was sent in, which Advisory Bookings records.
export const MessagingSettings: GlobalConfig = {
  slug: 'messaging-settings',
  label: 'Messaging Settings',
  admin: {
    description: 'Footer and booking link for every email KADE sends.',
  },
  access: {
    read: isStaffOrApiClient,
    update: isLoggedIn,
  },
  fields: [
    {
      name: 'postalAddress',
      type: 'textarea',
      required: true,
      admin: { rows: 3, description: 'Required in every commercial email.' },
    },
    {
      name: 'optOutLine',
      type: 'text',
      required: true,
      defaultValue: 'If you\'d rather not hear from me, reply "no thanks" and I won\'t write again.',
    },
    {
      name: 'bookingUrl',
      type: 'text',
      required: true,
      defaultValue: 'https://cal.com/transformidable/meeting',
      validate: (value: unknown) => (value ? validateHttpUrl(value) : 'This field is required.'),
      admin: { description: 'KADE adds the cohort and UTM tags to it.' },
    },
  ],
}
