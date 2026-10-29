import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { EMAIL_RE, MAX_EMAIL_LEN, createRateLimiter, getClientIp } from '../../../../lib/apiRequestGuards.ts'
import { TOOLS_PATH, downloadToken, findTool } from '../../../../lib/advisoryTools.ts'
import { joinList } from '../../../../lib/subscribers.ts'

// The download form on /advisory/tools/{slug}: records who asked, optionally
// adds them to the Brief, and answers with a signed, expiring download link.

const MAX_SHORT_LEN = 150
const TAG_KEYS = ['cohort', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const
const TAG_FIELDS: Record<(typeof TAG_KEYS)[number], string> = {
  cohort: 'cohort',
  utm_source: 'utmSource',
  utm_medium: 'utmMedium',
  utm_campaign: 'utmCampaign',
  utm_term: 'utmTerm',
  utm_content: 'utmContent',
}

const rateLimiter = createRateLimiter(10, 60 * 1000)

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_RE = /[\x00-\x1f\x7f]/g

const short = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const clean = value.trim().replace(CONTROL_CHARS_RE, '')
  return clean ? clean.slice(0, MAX_SHORT_LEN) : undefined
}

export async function POST(req: NextRequest) {
  if (!rateLimiter.check(getClientIp(req))) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a minute.' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    const parsed = await req.json()
    if (typeof parsed !== 'object' || parsed === null) throw new Error()
    body = parsed as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const slug = short(body.slug)
  const name = short(body.name)
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!slug) return NextResponse.json({ error: 'Unknown tool.' }, { status: 400 })
  if (!name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  if (!email || email.length > MAX_EMAIL_LEN || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
  }

  // Honeypot: real people never see this field. Answer as if it worked.
  if (body.company_website) return NextResponse.json({ downloadUrl: `${TOOLS_PATH}/${slug}` })

  try {
    const payload = await getPayload({ config })
    const tool = await findTool(payload, slug)
    if (!tool || tool.status !== 'final' || !tool.publishedFile) {
      return NextResponse.json({ error: 'This tool is not available.' }, { status: 404 })
    }

    const joinedBrief = body.joinBrief === true
    const tags: Record<string, string> = {}
    const inbound = typeof body.inbound === 'object' && body.inbound ? (body.inbound as Record<string, unknown>) : {}
    for (const key of TAG_KEYS) {
      const value = short(inbound[key])
      if (value) tags[TAG_FIELDS[key]] = value
    }

    await payload.create({
      collection: 'tool-requests',
      data: { name, email, organization: short(body.organization), asset: tool.id, joinedBrief, ...tags },
      overrideAccess: true,
    })
    if (joinedBrief) await joinList(payload, { email, name, source: 'website', list: 'brief' })

    const token = await downloadToken(payload.secret, slug)
    return NextResponse.json({ downloadUrl: `${TOOLS_PATH}/${slug}/download?t=${encodeURIComponent(token)}` })
  } catch (err) {
    console.error('[advisory-tools] Could not record request', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
