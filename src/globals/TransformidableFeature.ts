import type { GlobalConfig } from 'payload'

export const TransformidableFeature: GlobalConfig = {
  slug: 'transformidable-feature',
  admin: {
    description:
      'Manages the persistent Transformidable strip on The Reading Room page.',
  },
  access: {
    read: () => true,
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
}
