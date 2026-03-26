import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name, source } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Check if already subscribed
    const existing = await payload.find({
      collection: 'subscribers',
      where: { email: { equals: email.toLowerCase().trim() } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      const sub = existing.docs[0] as Record<string, unknown>
      if (sub.status === 'unsubscribed') {
        // Re-subscribe
        await payload.update({
          collection: 'subscribers',
          id: sub.id as number,
          data: { status: 'active' },
        })
        return NextResponse.json({ message: 'Welcome back! You have been re-subscribed.' })
      }
      return NextResponse.json({ message: 'You are already subscribed.' })
    }

    // Create new subscriber
    await payload.create({
      collection: 'subscribers',
      data: {
        email: email.toLowerCase().trim(),
        name: name || undefined,
        source: source || 'website',
        status: 'active',
      },
    })

    // TODO: Send welcome email via Resend
    // import { Resend } from 'resend'
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'Transformidable <hello@transformidable.media>',
    //   to: email,
    //   subject: 'Welcome to Transformidable',
    //   html: '<p>Thank you for subscribing...</p>',
    // })

    return NextResponse.json({ message: 'Thank you for subscribing!' })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    // Handle unique constraint (duplicate email)
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ message: 'You are already subscribed.' })
    }
    console.error('[subscribe] Error:', msg)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
