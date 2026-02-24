/**
 * This file is a placeholder for auto-generated Payload types.
 * Run `pnpm generate:types` after starting the dev server to regenerate.
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
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Media {
  id: string
  alt?: string
  url?: string
  filename?: string
  mimeType?: string
  filesize?: number
  width?: number
  height?: number
  createdAt: string
  updatedAt: string
}
