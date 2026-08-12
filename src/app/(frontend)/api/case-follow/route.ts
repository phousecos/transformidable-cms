import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { EMAIL_RE, MAX_EMAIL_LEN, createRateLimiter, getClientIp } from '../../../../lib/apiRequestGuards.ts'

// Same anti-enumeration approach as api/subscribe/route.ts: one generic
// message regardless of whether this is a new follow, a re-activation, or
// already-following, so the response never reveals who's following what.
const SUCCESS_MESSAGE = 'Thanks — if that email and case are valid, you are now following this case.'

const rateLimiter = createRateLimiter(5, 60 * 1000)

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!rateLimiter.check(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { email, caseSlug } = body as Record<string, unknown>

  if (
    typeof email !== 'string' ||
    email.length === 0 ||
    email.length > MAX_EMAIL_LEN ||
    !EMAIL_RE.test(email)
  ) {
    return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 })
  }

  if (typeof caseSlug !== 'string' || caseSlug.length === 0 || caseSlug.length > 200) {
    return NextResponse.json({ error: 'A case is required.' }, { status: 400 })
  }

  const normalizedEmail = email.toLowerCase().trim()

  try {
    const payload = await getPayload({ config })

    const cases = await payload.find({
      collection: 'case-files',
      where: { slug: { equals: caseSlug }, status: { equals: 'published' } },
      limit: 1,
      depth: 0,
    })
    const caseFile = cases.docs[0]
    if (!caseFile) {
      return NextResponse.json({ error: 'Case not found.' }, { status: 404 })
    }

    const existing = await payload.find({
      collection: 'case-follows',
      where: { email: { equals: normalizedEmail }, caseFile: { equals: caseFile.id } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      const follow = existing.docs[0] as Record<string, unknown>
      if (follow.status === 'unsubscribed') {
        await payload.update({
          collection: 'case-follows',
          id: follow.id as number,
          data: { status: 'active' },
        })
      }
      return NextResponse.json({ message: SUCCESS_MESSAGE })
    }

    await payload.create({
      collection: 'case-follows',
      data: {
        email: normalizedEmail,
        caseFile: caseFile.id,
        status: 'active',
      },
    })

    return NextResponse.json({ message: SUCCESS_MESSAGE })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ message: SUCCESS_MESSAGE })
    }
    console.error('[case-follow] Error:', msg)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
