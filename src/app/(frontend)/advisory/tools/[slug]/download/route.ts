import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TOOLS_PATH, findTool, tokenIsValid } from '../../../../../../lib/advisoryTools.ts'

// Serves an Advisory tool's published file to someone holding a link from
// the download form. Asset files are otherwise private, so the file is read
// from R2 directly. Without a valid link, send them back to the tool page.
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const back = NextResponse.redirect(new URL(`${TOOLS_PATH}/${slug}`, req.url))

  const payload = await getPayload({ config })
  const token = req.nextUrl.searchParams.get('t') || ''
  if (!(await tokenIsValid(payload.secret, slug, token))) return back

  const tool = await findTool(payload, slug)
  const file = tool?.status === 'final' ? tool.publishedFile : null
  if (!file || typeof file !== 'object' || !file.filename) return back

  let bucket: any
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    bucket = ((await getCloudflareContext({ async: true })) as { env: Record<string, any> }).env.MEDIA_BUCKET
  } catch {}
  if (!bucket) return NextResponse.json({ error: 'File storage is not available here.' }, { status: 501 })

  const object = await bucket.get(file.prefix ? `${file.prefix}/${file.filename}` : file.filename)
  if (!object) return NextResponse.json({ error: 'File not found.' }, { status: 404 })

  const safeName = String(file.filename).replace(/["\\\r\n]/g, '')
  return new NextResponse(object.body, {
    headers: {
      'Content-Type': file.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${safeName}"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    },
  })
}
