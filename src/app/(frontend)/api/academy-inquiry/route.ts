import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { EMAIL_RE, MAX_EMAIL_LEN, createRateLimiter, getClientIp } from '../../../../lib/apiRequestGuards.ts'
import {
  ACADEMY_DELIVERY,
  ACADEMY_PARTICIPANTS,
  ACADEMY_PROGRAMS,
  ACADEMY_PROGRAM_CHOICES,
  ACADEMY_SECTORS,
  ACADEMY_TIMEFRAMES,
  optionValues,
} from '../../../../lib/academyOptions.ts'

const MAX_SHORT_LEN = 150
const MAX_PHONE_LEN = 40
const MAX_MESSAGE_LEN = 5000

const rateLimiter = createRateLimiter(5, 60 * 1000)

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_RE = /[\x00-\x1f\x7f]/g
// Same as above but keeps newlines and tabs, for the free-text message.
// eslint-disable-next-line no-control-regex
const MESSAGE_CONTROL_CHARS_RE = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g

type Fields = Record<string, unknown>

// A trimmed, single-line string within `max`, or undefined when absent.
// Returns false when present but invalid.
function shortText(value: unknown, max: number): string | undefined | false {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string' || value.length > max) return false
  const clean = value.trim().replace(CONTROL_CHARS_RE, '')
  return clean.length ? clean : undefined
}

// One of `allowed`, or undefined when absent. False when present but unknown.
function option(value: unknown, allowed: string[]): string | undefined | false {
  if (value === undefined || value === null || value === '') return undefined
  return typeof value === 'string' && allowed.includes(value) ? value : false
}

const labelFor = (options: { label: string; value: string }[], value?: string) =>
  options.find((o) => o.value === value)?.label

export async function POST(req: NextRequest) {
  if (!rateLimiter.check(getClientIp(req))) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a minute.' }, { status: 429 })
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
  const f = body as Fields

  // Honeypot: a field hidden from people. Bots that fill it get a normal
  // success response so they have no signal to adapt to, and nothing is saved.
  if (typeof f.company_website === 'string' && f.company_website.trim()) {
    return NextResponse.json({ message: 'Thank you. We will be in touch.' })
  }

  const type = f.type === 'organization' || f.type === 'individual' ? f.type : null
  if (!type) return NextResponse.json({ error: 'Choose organization or individual.' }, { status: 400 })

  const name = shortText(f.name, 100)
  if (!name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 })

  if (typeof f.email !== 'string' || f.email.length > MAX_EMAIL_LEN || !EMAIL_RE.test(f.email.trim())) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
  }
  const email = f.email.toLowerCase().trim()

  const organization = shortText(f.organization, MAX_SHORT_LEN)
  const jobTitle = shortText(f.jobTitle, MAX_SHORT_LEN)
  const phone = shortText(f.phone, MAX_PHONE_LEN)
  const source = shortText(f.source, MAX_SHORT_LEN)
  if (organization === false || jobTitle === false || phone === false || source === false) {
    return NextResponse.json({ error: 'One of the fields is too long.' }, { status: 400 })
  }
  if (type === 'organization' && !organization) {
    return NextResponse.json({ error: 'Organization name is required.' }, { status: 400 })
  }

  const sector = option(f.sector, optionValues(ACADEMY_SECTORS))
  const program = option(f.program, optionValues(ACADEMY_PROGRAM_CHOICES))
  const delivery = option(f.delivery, optionValues(ACADEMY_DELIVERY))
  // Cohort sizing and timing only apply to organizations.
  const participants = type === 'organization' ? option(f.participants, optionValues(ACADEMY_PARTICIPANTS)) : undefined
  const timeframe = type === 'organization' ? option(f.timeframe, optionValues(ACADEMY_TIMEFRAMES)) : undefined
  if (sector === false || program === false || delivery === false || participants === false || timeframe === false) {
    return NextResponse.json({ error: 'Please choose from the listed options.' }, { status: 400 })
  }

  let message: string | undefined
  if (typeof f.message === 'string' && f.message.trim()) {
    if (f.message.length > MAX_MESSAGE_LEN) {
      return NextResponse.json({ error: 'Message is too long.' }, { status: 400 })
    }
    message = f.message.trim().replace(MESSAGE_CONTROL_CHARS_RE, '')
  }

  try {
    const payload = await getPayload({ config })

    await payload.create({
      collection: 'academy-inquiries',
      data: {
        type,
        name,
        email,
        jobTitle,
        organization,
        phone,
        sector,
        program,
        participants,
        delivery,
        timeframe,
        message,
        source,
        status: 'new',
      },
    })

    // Best-effort notification — the inquiry is already saved in the admin
    // regardless of whether this succeeds.
    try {
      const lines = [
        type === 'organization' ? 'Private cohort inquiry' : 'Interest list registration',
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        jobTitle && `Title: ${jobTitle}`,
        organization && `Organization: ${organization}`,
        phone && `Phone: ${phone}`,
        sector && `Sector: ${labelFor(ACADEMY_SECTORS, sector)}`,
        program && `Program: ${labelFor(ACADEMY_PROGRAMS, program)}`,
        participants && `Expected participants: ${labelFor(ACADEMY_PARTICIPANTS, participants)}`,
        delivery && `Delivery: ${labelFor(ACADEMY_DELIVERY, delivery)}`,
        timeframe && `Timeframe: ${labelFor(ACADEMY_TIMEFRAMES, timeframe)}`,
        source && `Submitted from: ${source}`,
        message && `\n${message}`,
      ].filter(Boolean)
      await payload.sendEmail({
        to:
          process.env.ACADEMY_NOTIFY_EMAIL ||
          process.env.CONTACT_NOTIFY_EMAIL ||
          process.env.EMAIL_FROM ||
          'hello@betransformidable.com',
        replyTo: email,
        subject:
          type === 'organization'
            ? `Academy cohort inquiry: ${organization}`
            : `Academy interest list: ${name}`,
        text: lines.join('\n'),
      })
    } catch (emailError: unknown) {
      const msg = emailError instanceof Error ? emailError.message : 'Unknown error'
      console.error('[academy-inquiry] Notification email failed:', msg)
    }

    return NextResponse.json({
      message:
        type === 'organization'
          ? 'Thank you. We have your inquiry and will be in touch to arrange a conversation.'
          : 'Thank you. You are on the interest list and will hear from us when dates are announced.',
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[academy-inquiry] Error:', msg)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
