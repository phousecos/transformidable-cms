import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TOO_FAST_MESSAGE, checkSpam, getClientIp } from '../../../../lib/apiRequestGuards.ts'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LEN = 254 // RFC 5321
const MAX_NAME_LEN = 100
const MAX_SUBJECT_LEN = 150
const MAX_MESSAGE_LEN = 5000
const SUCCESS_MESSAGE = "Thanks for reaching out — we'll be in touch soon."

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

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_RE = /[\x00-\x1f\x7f]/g

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

  const fields = body as Record<string, unknown>
  const spam = checkSpam((key) => fields[key])
  if (spam === 'bot') return NextResponse.json({ message: SUCCESS_MESSAGE })
  if (spam === 'too-fast') return NextResponse.json({ error: TOO_FAST_MESSAGE }, { status: 400 })

  const { name, email, subject, message } = fields

  if (typeof name !== 'string' || name.trim().length === 0 || name.length > MAX_NAME_LEN) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  }

  if (
    typeof email !== 'string' ||
    email.length === 0 ||
    email.length > MAX_EMAIL_LEN ||
    !EMAIL_RE.test(email)
  ) {
    return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 })
  }

  if (typeof message !== 'string' || message.trim().length === 0 || message.length > MAX_MESSAGE_LEN) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
  }

  let cleanSubject: string | undefined
  if (typeof subject === 'string' && subject.trim().length > 0) {
    if (subject.length > MAX_SUBJECT_LEN) {
      return NextResponse.json({ error: 'Subject is too long.' }, { status: 400 })
    }
    cleanSubject = subject.trim().replace(CONTROL_CHARS_RE, '')
  }

  const cleanName = name.trim().replace(CONTROL_CHARS_RE, '')
  const cleanMessage = message.trim().replace(CONTROL_CHARS_RE, '')
  const normalizedEmail = email.toLowerCase().trim()

  try {
    const payload = await getPayload({ config })

    await payload.create({
      collection: 'contact-messages',
      data: {
        name: cleanName,
        email: normalizedEmail,
        subject: cleanSubject,
        message: cleanMessage,
        status: 'new',
      },
    })

    // Best-effort notification — the message is already saved in the admin
    // inbox regardless of whether this succeeds. Skips silently when no
    // email adapter is configured (e.g. local dev without SMTP env vars).
    try {
      await payload.sendEmail({
        to: process.env.CONTACT_NOTIFY_EMAIL || process.env.EMAIL_FROM || 'hello@betransformidable.com',
        replyTo: normalizedEmail,
        subject: `New contact form message${cleanSubject ? `: ${cleanSubject}` : ''}`,
        text: `From: ${cleanName} <${normalizedEmail}>\n\n${cleanMessage}`,
      })
    } catch (emailError: unknown) {
      const msg = emailError instanceof Error ? emailError.message : 'Unknown error'
      console.error('[contact] Notification email failed:', msg)
    }

    return NextResponse.json({ message: SUCCESS_MESSAGE })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[contact] Error:', msg)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
