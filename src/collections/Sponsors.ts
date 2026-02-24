import type { CollectionConfig } from 'payload'
import { isAdmin, isSponsorManagerOrAdmin } from '../access/checkRole'

export const Sponsors: CollectionConfig = {
  slug: 'sponsors',
  admin: {
    useAsTitle: 'brandName',
    defaultColumns: ['brandName', 'isActive', 'campaignStartDate', 'campaignEndDate'],
  },
  access: {
    create: isSponsorManagerOrAdmin,
    read: isSponsorManagerOrAdmin,
    update: isSponsorManagerOrAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'brandName',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g., Vetters Group',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'adCreative',
      type: 'array',
      admin: {
        description: 'Multiple assets per placement type',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            description: 'Descriptive label for this creative asset',
          },
        },
        {
          name: 'asset',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'format',
          type: 'select',
          options: [
            { label: 'Image', value: 'image' },
            { label: 'Audio', value: 'audio' },
            { label: 'HTML', value: 'html' },
          ],
        },
      ],
    },
    {
      name: 'placementType',
      type: 'select',
      hasMany: true,
      required: true,
      options: [
        { label: 'Podcast Mid-Roll', value: 'podcastMidRoll' },
        { label: 'Article Sidebar', value: 'articleSidebar' },
        { label: 'Newsletter', value: 'newsletter' },
      ],
    },
    {
      name: 'campaignStartDate',
      type: 'date',
      required: true,
    },
    {
      name: 'campaignEndDate',
      type: 'date',
      required: true,
    },
    {
      name: 'linkUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'Click destination URL',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
