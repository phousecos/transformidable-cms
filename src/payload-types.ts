/**
 * This file is a placeholder for auto-generated Payload types.
 * Run `npm run generate:types` after starting the dev server to regenerate.
 */

export interface User {
  id: string
  email: string
  role: 'admin' | 'editor' | 'brandContributor' | 'sponsorManager'
  firstName?: string
  lastName?: string
  assignedBrandPillar?: string | BrandPillar
  createdAt: string
  updatedAt: string
}

export interface BrandPillar {
  id: string
  name: string
  slug: string
  mappedDomain: string
  contentFocus?: string
  createdAt: string
  updatedAt: string
}

export interface Media {
  id: string
  alt: string
  caption?: string
  url?: string
  filename?: string
  mimeType?: string
  filesize?: number
  width?: number
  height?: number
  sizes?: {
    thumbnail?: { url?: string; width?: number; height?: number }
    card?: { url?: string; width?: number; height?: number }
    hero?: { url?: string; width?: number; height?: number }
  }
  createdAt: string
  updatedAt: string
}

export interface Author {
  id: string
  name: string
  bio?: string
  headshot?: string | Media
  role?: string
  associatedBrand?: string | BrandPillar
  type: 'staff' | 'guestContributor' | 'podcastGuest'
  socialLinks?: Array<{
    platform: 'linkedin' | 'twitter' | 'website' | 'instagram' | 'other'
    url: string
    id?: string
  }>
  isActive?: boolean
  createdAt: string
  updatedAt: string
}

export interface Article {
  id: string
  title: string
  slug: string
  body: Record<string, unknown>
  excerpt?: string
  author: string | Author
  publishDate?: string
  featuredImage?: string | Media
  brandPillars?: (string | BrandPillar)[]
  syndicateTo?: ('jerribland' | 'unlimitedpowerhouse' | 'agentpmo' | 'prept' | 'lumynr')[]
  status: 'draft' | 'review' | 'scheduled' | 'published'
  seoTitle?: string
  seoDescription?: string
  isMemberOnly?: boolean
  createdAt: string
  updatedAt: string
}

export interface PodcastEpisode {
  id: string
  title: string
  slug: string
  episodeNumber: number
  season: number
  description?: string
  audioUrl?: string
  transcript?: Record<string, unknown>
  showNotes?: Record<string, unknown>
  guest?: string | Author
  publishDate?: string
  featuredImage?: string | Media
  brandPillars?: (string | BrandPillar)[]
  syndicateTo?: ('jerribland' | 'unlimitedpowerhouse' | 'agentpmo' | 'prept' | 'lumynr')[]
  status: 'draft' | 'review' | 'scheduled' | 'published'
  createdAt: string
  updatedAt: string
}

export interface Sponsor {
  id: string
  brandName: string
  logo?: string | Media
  adCreative?: Array<{
    label: string
    asset: string | Media
    format?: 'image' | 'audio' | 'html'
    id?: string
  }>
  placementType: ('podcastMidRoll' | 'articleSidebar' | 'newsletter')[]
  campaignStartDate: string
  campaignEndDate: string
  linkUrl: string
  isActive?: boolean
  createdAt: string
  updatedAt: string
}

export interface NewsletterIssue {
  id: string
  issueNumber: number
  issueLabel?: string
  issueDate: string
  editorsNote?: Record<string, unknown>
  featuredArticles?: (string | Article)[]
  featuredEpisode?: string | PodcastEpisode
  status: 'draft' | 'scheduled' | 'sent'
  createdAt: string
  updatedAt: string
}
