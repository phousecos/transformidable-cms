// Advisory tools: J. Lynne library assets offered as downloads on /advisory.
// An asset is offered once it is Final and tagged "Website download". Each
// has a page at /advisory/tools/{slug} (the address /api/assets/current hands
// out), where a visitor leaves a name and email and gets a signed, expiring
// download link. Track and service-line codes are never shown publicly.

import type { Where } from 'payload'
import { ASSET_TYPE_OPTIONS } from '../collections/library/assetOptions.ts'

export const TOOLS_PATH = '/advisory/tools'

// Download links stay valid this long after the form is sent.
const LINK_TTL_SECONDS = 7 * 24 * 60 * 60

const offered: Where = { use: { in: ['website-download'] } }

// Tools listed on /advisory.
export const listedToolsWhere: Where = { and: [{ status: { equals: 'final' } }, offered] }

export const assetTypeLabel = (value?: string | null) =>
  ASSET_TYPE_OPTIONS.find((o) => o.value === value)?.label

// The tool at a slug, if it is (or was) offered: Final, or Retired so its page
// can point to what replaced it. Anything else is not public.
export async function findTool(payload: any, slug: string) {
  const res = await payload.find({
    collection: 'assets',
    where: { and: [{ slug: { equals: slug } }, { status: { in: ['final', 'retired'] } }, offered] },
    depth: 1,
    limit: 1,
    overrideAccess: true,
  })
  return res.docs?.[0] || null
}

// Whether a replacement asset is itself offered, so a retired tool can send
// people on to it.
export const isOffered = (asset: any) =>
  asset && typeof asset === 'object' && asset.status === 'final' && Array.isArray(asset.use) && asset.use.includes('website-download')

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

async function sign(secret: string, message: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))))
}

// "<expiry>.<signature>", tied to one slug.
export async function downloadToken(secret: string, slug: string, now = Date.now()) {
  const exp = Math.floor(now / 1000) + LINK_TTL_SECONDS
  return `${exp}.${await sign(secret, `${slug}.${exp}`)}`
}

export async function tokenIsValid(secret: string, slug: string, token: string, now = Date.now()) {
  const [expRaw, sig] = token.split('.')
  const exp = Number(expRaw)
  if (!sig || !Number.isFinite(exp) || exp * 1000 < now) return false
  const expected = await sign(secret, `${slug}.${exp}`)
  if (expected.length !== sig.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
  return diff === 0
}
