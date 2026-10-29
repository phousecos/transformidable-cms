import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// Cal.com webhook for the advisory conversation event. Set it up in Cal.com
// (Settings → Developer → Webhooks) with this URL, the BOOKING_CREATED,
// BOOKING_RESCHEDULED and BOOKING_CANCELLED triggers, and a secret; put the
// same secret in CAL_WEBHOOK_SECRET. Cal.com signs the raw body with it
// (HMAC-SHA256, hex, in X-Cal-Signature-256), and unsigned or mis-signed
// requests are refused.

const MAX_BODY = 64 * 1024
const MAX_TEXT = 2000
const MAX_SHORT = 150

type Json = Record<string, any>

async function signatureMatches(secret: string, body: string, signature: string): Promise<boolean> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body)))
  const expected = Array.from(mac, (b) => b.toString(16).padStart(2, '0')).join('')
  const given = signature.trim().toLowerCase()
  if (given.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i)
  return diff === 0
}

const text = (value: unknown, max = MAX_SHORT): string | undefined => {
  if (typeof value !== 'string') return undefined
  const clean = value.trim()
  return clean ? clean.slice(0, max) : undefined
}

const date = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
}

// The booking page (components/advisory/ConversationBooking.tsx) writes the
// intake into the notes as "What's the governance problem?\n<answer>", a blank
// line, then "Label: value" lines. Read it back into fields.
function parseNotes(notes: string | undefined) {
  const out: Record<string, string> = {}
  if (!notes) return out
  const [first, ...rest] = notes.split(/\n\s*\n/)
  const problem = first.replace(/^What's the governance problem\?\s*\n?/i, '').trim()
  if (problem) out.problem = problem.slice(0, MAX_TEXT)
  for (const line of rest.join('\n').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_ ]+):\s*(.+)$/)
    if (m) out[m[1].trim().toLowerCase()] = m[2].trim().slice(0, MAX_SHORT)
  }
  return out
}

function bookingFields(b: Json) {
  const attendee: Json = Array.isArray(b.attendees) ? b.attendees[0] || {} : {}
  const responses: Json = b.responses && typeof b.responses === 'object' ? b.responses : {}
  const answer = (key: string) => {
    const r = responses[key]
    return r && typeof r === 'object' ? r.value : r
  }
  const notes = text(answer('notes') ?? b.additionalNotes ?? b.description, MAX_TEXT * 2)
  const parsed = parseNotes(notes)
  const meta: Json = b.metadata && typeof b.metadata === 'object' ? b.metadata : {}
  const tag = (key: string) => text(meta[key]) ?? parsed[key]
  return {
    startTime: date(b.startTime),
    endTime: date(b.endTime),
    name: text(attendee.name ?? answer('name')),
    email: text(attendee.email ?? answer('email')),
    timeZone: text(attendee.timeZone),
    organization: parsed.organization,
    role: parsed.role,
    area: parsed.area,
    problem: parsed.problem,
    cohort: tag('cohort'),
    utmSource: tag('utm_source'),
    utmMedium: tag('utm_medium'),
    utmCampaign: tag('utm_campaign'),
    utmTerm: tag('utm_term'),
    utmContent: tag('utm_content'),
    notes,
  }
}

async function upsert(payload: any, calUid: string, data: Json, { create = true } = {}) {
  const existing = await payload.find({
    collection: 'advisory-bookings',
    where: { calUid: { equals: calUid } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const doc = existing.docs?.[0]
  // Fields Cal.com didn't send keep what is already stored.
  const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined))
  if (doc) {
    await payload.update({ collection: 'advisory-bookings', id: doc.id, data: clean, overrideAccess: true })
  } else if (create) {
    await payload.create({ collection: 'advisory-bookings', data: { calUid, ...clean }, overrideAccess: true })
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.CAL_WEBHOOK_SECRET
  if (!secret) {
    console.error('[advisory-booking] CAL_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Not configured.' }, { status: 503 })
  }

  const body = await req.text()
  if (body.length > MAX_BODY) return NextResponse.json({ error: 'Too large.' }, { status: 413 })
  const signature = req.headers.get('x-cal-signature-256') || ''
  if (!signature || !(await signatureMatches(secret, body, signature))) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 })
  }

  let event: Json
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid body.' }, { status: 400 })
  }

  const trigger = String(event.triggerEvent || '')
  const booking: Json = event.payload && typeof event.payload === 'object' ? event.payload : {}
  const calUid = text(booking.uid, 200)

  // Cal.com's "Ping test" and any trigger we don't track: acknowledge only.
  const status = { BOOKING_CREATED: 'booked', BOOKING_RESCHEDULED: 'booked', BOOKING_CANCELLED: 'cancelled' }[trigger]
  if (!status || !calUid) return NextResponse.json({ ok: true, ignored: trigger || 'unknown' })

  try {
    const payload = await getPayload({ config })
    if (trigger === 'BOOKING_CANCELLED') {
      await upsert(payload, calUid, { status, ...bookingFields(booking) })
    } else {
      // A reschedule arrives as a new booking that names the one it replaces.
      const from = text(booking.rescheduleUid ?? booking.fromReschedule, 200)
      await upsert(payload, calUid, { status, rescheduledFrom: from, ...bookingFields(booking) })
      if (from && from !== calUid) await upsert(payload, from, { status: 'rescheduled' }, { create: false })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[advisory-booking] Could not save booking', err)
    // 500 lets Cal.com retry.
    return NextResponse.json({ error: 'Could not save.' }, { status: 500 })
  }
}
