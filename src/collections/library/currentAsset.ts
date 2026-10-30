import type { Endpoint, Where } from 'payload'

import {
  ASSET_TYPE_OPTIONS,
  SECTOR_EDITION_OPTIONS,
  TRACK_OPTIONS,
} from './assetOptions.ts'

const codes = (options: { value: string }[]) => options.map((o) => o.value)

// Prospects get the public Advisory tools page for an asset, never the API.
const downloadBase = () =>
  (process.env.PUBLIC_DOWNLOAD_BASE_URL || 'https://betransformidable.com/advisory/tools').replace(/\/+$/, '')

/**
 * GET /api/assets/current?track=T1&sectorEdition=credit-union&assetType=governance-brief
 *
 * The current Final asset for a track, sector edition and asset type, for connected
 * systems such as KADE. Falls back to the "All" edition when there is no edition for
 * the sector. "Current" is the latest versionDate, then the most recently updated.
 * Answers 404 when nothing is Final.
 */
export const currentAsset: Endpoint = {
  path: '/current',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const track = req.searchParams.get('track') ?? ''
    const sectorEdition = req.searchParams.get('sectorEdition') ?? ''
    const assetType = req.searchParams.get('assetType') ?? ''
    const invalid = [
      !codes(TRACK_OPTIONS).includes(track) &&
        `track must be one of ${codes(TRACK_OPTIONS).join(', ')}`,
      !codes(SECTOR_EDITION_OPTIONS).includes(sectorEdition) &&
        `sectorEdition must be one of ${codes(SECTOR_EDITION_OPTIONS).join(', ')}`,
      !codes(ASSET_TYPE_OPTIONS).includes(assetType) &&
        `assetType must be one of ${codes(ASSET_TYPE_OPTIONS).join(', ')}`,
    ].filter(Boolean)
    if (invalid.length) return Response.json({ error: invalid.join('; ') }, { status: 400 })

    const find = async (edition: string) => {
      const where: Where = {
        and: [
          { status: { equals: 'final' } },
          { track: { contains: track } },
          { assetType: { equals: assetType } },
          { sectorEdition: { equals: edition } },
        ],
      }
      const { docs } = await req.payload.find({
        collection: 'assets',
        where,
        sort: ['-versionDate', '-updatedAt'],
        limit: 1,
        depth: 0,
        overrideAccess: false,
        user: req.user,
        req,
      })
      return docs[0]
    }

    let asset = await find(sectorEdition)
    const fallback = !asset && sectorEdition !== 'all'
    if (fallback) asset = await find('all')
    if (!asset) {
      return Response.json(
        {
          error: `No Final ${assetType} for ${track} in the ${sectorEdition === 'all' ? 'all' : `${sectorEdition} or all`} edition`,
        },
        { status: 404 },
      )
    }

    return Response.json({
      asset: {
        id: asset.id,
        slug: asset.slug,
        title: asset.title,
        version: asset.version ?? null,
        versionDate: asset.versionDate ?? null,
        track: asset.track ?? [],
        assetType: asset.assetType,
        sectorEdition: asset.sectorEdition,
        brand: asset.brand,
        updatedAt: asset.updatedAt,
      },
      // Items with a stored file go through their Advisory tools page; the rest live at their own URL.
      url:
        !asset.publishedFile && asset.externalUrl ? asset.externalUrl : `${downloadBase()}/${asset.slug}`,
      fallback,
    })
  },
}
