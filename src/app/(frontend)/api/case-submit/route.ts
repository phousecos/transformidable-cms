import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { EMAIL_RE, MAX_EMAIL_LEN, createRateLimiter, getClientIp } from '../../../../lib/apiRequestGuards.ts'

const MAX_NAME_LEN = 100
const MAX_MESSAGE_LEN = 5000
const MAX_URL_LEN = 2000
const MAX_FILE_BYTES = 15 * 1024 * 1024 // 15MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/']

// Submissions can carry a file upload, which is heavier than a form post —
// a tighter window than the follow/subscribe endpoints.
const rateLimiter = createRateLimiter(5, 5 * 60 * 1000)

function isAllowedFileType(mimetype: string): boolean {
  return ALLOWED_FILE_TYPES.some((prefix) =>
    prefix.endsWith('/') ? mimetype.startsWith(prefix) : mimetype === prefix,
  )
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!rateLimiter.check(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a few minutes.' },
      { status: 429 },
    )
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const type = form.get('type')
  const caseSlug = form.get('caseSlug')
  const submitterName = form.get('submitterName')
  const submitterEmail = form.get('submitterEmail')
  const message = form.get('message')
  const sourceUrl = form.get('sourceUrl')
  const file = form.get('file')

  if (type !== 'document' && type !== 'feedback') {
    return NextResponse.json({ error: 'Invalid submission type.' }, { status: 400 })
  }

  if (typeof caseSlug !== 'string' || caseSlug.length === 0 || caseSlug.length > 200) {
    return NextResponse.json({ error: 'A case is required.' }, { status: 400 })
  }

  if (typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({ error: 'Please add a message.' }, { status: 400 })
  }
  if (message.length > MAX_MESSAGE_LEN) {
    return NextResponse.json({ error: 'Message is too long.' }, { status: 400 })
  }

  let cleanName: string | undefined
  if (typeof submitterName === 'string' && submitterName.trim().length > 0) {
    if (submitterName.length > MAX_NAME_LEN) {
      return NextResponse.json({ error: 'Name is too long.' }, { status: 400 })
    }
    // eslint-disable-next-line no-control-regex
    cleanName = submitterName.trim().replace(/[\x00-\x1f\x7f]/g, '')
  }

  let cleanEmail: string | undefined
  if (typeof submitterEmail === 'string' && submitterEmail.trim().length > 0) {
    if (submitterEmail.length > MAX_EMAIL_LEN || !EMAIL_RE.test(submitterEmail)) {
      return NextResponse.json({ error: 'Email looks invalid.' }, { status: 400 })
    }
    cleanEmail = submitterEmail.toLowerCase().trim()
  }

  let cleanUrl: string | undefined
  if (typeof sourceUrl === 'string' && sourceUrl.trim().length > 0) {
    if (sourceUrl.length > MAX_URL_LEN || !/^https?:\/\//i.test(sourceUrl.trim())) {
      return NextResponse.json({ error: 'Document link must be a valid URL.' }, { status: 400 })
    }
    cleanUrl = sourceUrl.trim()
  }

  const hasFile = file instanceof File && file.size > 0
  if (type === 'document' && !cleanUrl && !hasFile) {
    return NextResponse.json(
      { error: 'Add a link to the document, or attach a file.' },
      { status: 400 },
    )
  }

  if (hasFile) {
    const uploadedFile = file as File
    if (uploadedFile.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'File is too large (15MB max).' }, { status: 400 })
    }
    if (!isAllowedFileType(uploadedFile.type)) {
      return NextResponse.json({ error: 'File must be a PDF or an image.' }, { status: 400 })
    }
  }

  const cleanMessage = message.trim()

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

    let mediaId: string | number | undefined
    if (hasFile) {
      const uploadedFile = file as File
      const buffer = Buffer.from(await uploadedFile.arrayBuffer())
      const mediaDoc = await payload.create({
        collection: 'media',
        data: { alt: `Reader-submitted document for "${caseFile.title}"` },
        file: {
          data: buffer,
          mimetype: uploadedFile.type,
          name: uploadedFile.name,
          size: buffer.length,
        },
      })
      mediaId = mediaDoc.id
    }

    await payload.create({
      collection: 'case-submissions',
      data: {
        type,
        caseFile: caseFile.id,
        submitterName: cleanName,
        submitterEmail: cleanEmail,
        message: cleanMessage,
        sourceUrl: cleanUrl,
        file: mediaId,
        status: 'pending',
      },
    })

    return NextResponse.json({
      message: 'Thanks — this has been sent to our research team for review.',
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[case-submit] Error:', msg)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
