import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

function htmlPage(title: string, body: string): NextResponse {
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>` +
      `<meta name="viewport" content="width=device-width, initial-scale=1">` +
      `<style>body{font-family:Georgia,serif;max-width:32rem;margin:4rem auto;padding:0 1.5rem;color:#1a1210;line-height:1.6}</style>` +
      `</head><body><h1>${title}</h1><p>${body}</p></body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )
}

// One-click unsubscribe link, delivered in digest emails. Deliberately a GET
// so it works as a plain link with no JS required, matching common email
// unsubscribe conventions.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return htmlPage('Link not found', 'This unsubscribe link is missing its token.')
  }

  try {
    const payload = await getPayload({ config })
    const existing = await payload.find({
      collection: 'case-follows',
      where: { unsubscribeToken: { equals: token } },
      limit: 1,
      depth: 0,
    })
    const follow = existing.docs[0]
    if (!follow) {
      return htmlPage('Link expired', 'This unsubscribe link is no longer valid — you may already be unsubscribed.')
    }

    if (follow.status !== 'unsubscribed') {
      await payload.update({
        collection: 'case-follows',
        id: follow.id,
        data: { status: 'unsubscribed' },
      })
    }

    return htmlPage('Unsubscribed', "You won't receive further updates for this case.")
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[case-follow/unsubscribe] Error:', msg)
    return htmlPage('Something went wrong', 'Please try again in a moment.')
  }
}
