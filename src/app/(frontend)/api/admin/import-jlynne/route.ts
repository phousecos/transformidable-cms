import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isStaffUser } from '../../../../../access/checkRole.ts'
import { importJlynne } from '../../../../../lib/importJlynne.ts'

// One-time copy of the J. Lynne library (jlynne.io: D1 + R2) into this
// instance. Runs only on the J. Lynne account deployment, which binds the old
// database and bucket read-side as JLYNNE_D1 and JLYNNE_R2.
//
//   GET  → dry run: what would be copied, and what already is.
//   POST → copy. Safe to repeat: anything already here (asset by slug, file by
//          filename, person by email) is skipped, never overwritten.
//
// The source is only read. Nothing is deleted or changed on jlynne.io.
//
// Admins only. People: J. Lynne admins are copied by default (same email and
// password). Editors would get full access to all Transformidable content,
// since every person here has full access, so they are copied only with
// ?includeEditors=1. Readers (KADE) are not copied: issue KADE a key under
// API Clients instead.

async function sourceBindings() {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    const { env } = (await getCloudflareContext({ async: true })) as { env: Record<string, any> }
    if (env.JLYNNE_D1 && env.JLYNNE_R2 && env.MEDIA_BUCKET) return env
  } catch {}
  return null
}

async function run(req: NextRequest, apply: boolean) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  if (!isStaffUser(user) || (user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Admins only.' }, { status: 403 })
  }
  const env = await sourceBindings()
  if (!env) {
    return NextResponse.json({ error: 'JLYNNE_D1, JLYNNE_R2 and MEDIA_BUCKET must be bound (J. Lynne account deployment only).' }, { status: 501 })
  }
  const report = await importJlynne({
    payload,
    d1: env.JLYNNE_D1,
    source: env.JLYNNE_R2,
    target: env.MEDIA_BUCKET,
    apply,
    includeEditors: req.nextUrl.searchParams.get('includeEditors') === '1',
  })
  return NextResponse.json(report, { status: report.errors.length ? 207 : 200 })
}

export const GET = (req: NextRequest) => run(req, false)
export const POST = (req: NextRequest) => run(req, true)
