import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// Generic, identical message for every successful path. We deliberately do not
// distinguish "new subscriber", "already subscribed", or "re-subscribed", so
// an attacker cannot iterate over a list of emails to learn which ones are on
// the list (subscriber enumeration).
const SUCCESS_MESSAGE = 'Thanks — if your email is valid, you are now subscribed.'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LEN = 254 // RFC 5321
const MAX_NAME_LEN = 100

// Per-IP soft rate limiter. In serverless this only protects within a warm
// lambda — Vercel may spin up new instances that each get their own counter —
// but it's still meaningful for the bursty abuse case (a single bot hammering
// the endpoint from one IP). For stronger guarantees, swap for an external
// store (Upstash, Vercel KV) keyed by IP.
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const ipHits = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipHits.get(ip)
  if (!entry || entry.resetAt < now) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]!.trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) {
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

  const { email, name, source } = body as Record<string, unknown>

  if (
    typeof email !== 'string' ||
    email.length === 0 ||
    email.length > MAX_EMAIL_LEN ||
    !EMAIL_RE.test(email)
  ) {
    return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 })
  }

  let cleanName: string | undefined
  if (typeof name === 'string' && name.trim().length > 0) {
    if (name.length > MAX_NAME_LEN) {
      return NextResponse.json({ error: 'Name is too long.' }, { status: 400 })
    }
    // Strip ASCII control characters to keep stored names sane in admin UI
    // and CSV exports. Visible characters (incl. unicode names) pass through.
    // eslint-disable-next-line no-control-regex
    cleanName = name.trim().replace(/[\x00-\x1f\x7f]/g, '')
  }

  const ALLOWED_SOURCES = ['website', 'reading_room', 'article', 'manual'] as const
  type SourceValue = (typeof ALLOWED_SOURCES)[number]
  const cleanSource: SourceValue =
    typeof source === 'string' && (ALLOWED_SOURCES as readonly string[]).includes(source)
      ? (source as SourceValue)
      : 'website'

  const normalizedEmail = email.toLowerCase().trim()

  try {
    const payload = await getPayload({ config })

    const existing = await payload.find({
      collection: 'subscribers',
      where: { email: { equals: normalizedEmail } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      const sub = existing.docs[0] as Record<string, unknown>
      if (sub.status === 'unsubscribed') {
        await payload.update({
          collection: 'subscribers',
          id: sub.id as number,
          data: { status: 'active' },
        })
      }
      return NextResponse.json({ message: SUCCESS_MESSAGE })
    }

    await payload.create({
      collection: 'subscribers',
      data: {
        email: normalizedEmail,
        name: cleanName,
        source: cleanSource,
        status: 'active',
      },
    })

    return NextResponse.json({ message: SUCCESS_MESSAGE })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    // Race-condition fallback: if a concurrent insert won the unique
    // constraint, treat it as success — never reveal that the email exists.
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ message: SUCCESS_MESSAGE })
    }
    console.error('[subscribe] Error:', msg)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
