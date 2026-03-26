import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    description: 'Publication-wide settings. Renders on the /about or /start-here page.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'publicationName',
      type: 'text',
      required: true,
    },
    {
      name: 'tagline',
      type: 'text',
    },
    {
      name: 'founderLetter',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'e.g. "From the Desk of Jerri Bland"',
          },
        },
        {
          name: 'body',
          type: 'richText',
        },
        {
          name: 'signoff',
          type: 'text',
          admin: {
            description: 'e.g. "Jerri Bland, Ed.D. Founder & CEO..."',
          },
        },
        {
          name: 'isVisible',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Toggle the founder letter on/off without deleting it',
          },
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'group',
      fields: [
        {
          name: 'linkedin',
          type: 'text',
        },
        {
          name: 'website',
          type: 'text',
        },
      ],
    },
  ],
}
