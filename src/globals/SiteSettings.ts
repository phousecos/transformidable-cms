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
    {
      name: 'transformidableFeature',
      type: 'group',
      admin: {
        description:
          'Manages the persistent Transformidable strip on The Reading Room page.',
      },
      fields: [
        {
          name: 'mode',
          type: 'select',
          required: true,
          defaultValue: 'pre_order',
          options: [
            { label: 'Pre-order', value: 'pre_order' },
            { label: 'Available now', value: 'available_now' },
          ],
          admin: {
            description: 'Controls CTA label and link behavior',
          },
        },
        {
          name: 'tagline',
          type: 'text',
          admin: {
            description:
              'Short subtitle line (e.g., "A new framework for leading change that sticks")',
          },
        },
        {
          name: 'cta_label',
          type: 'text',
          admin: {
            description: 'Button text. Default: "Pre-Order →" or "Buy Now →"',
          },
        },
        {
          name: 'cta_url',
          type: 'text',
          admin: {
            description: 'Payhip pre-order or purchase URL',
          },
        },
        {
          name: 'cover_image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Transformidable cover image',
          },
        },
        {
          name: 'launch_label',
          type: 'text',
          admin: {
            description: 'e.g., "Coming June 2026" or blank once published',
          },
        },
      ],
    },
  ],
}
