import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET() {
  const checks: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    env: {
      POSTGRES_URL: !!process.env.POSTGRES_URL,
      DATABASE_URL: !!process.env.DATABASE_URL,
      PAYLOAD_SECRET: !!process.env.PAYLOAD_SECRET,
      BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
      VERCEL: !!process.env.VERCEL,
      NODE_ENV: process.env.NODE_ENV,
    },
  }

  // Test sharp import
  try {
    const sharp = (await import('sharp')).default
    checks.sharp = { ok: true, version: sharp.versions?.vips ?? 'unknown' }
  } catch (e: any) {
    checks.sharp = { ok: false, error: e.message }
  }

  // Test Payload initialization
  try {
    const { getPayload } = await import('payload')
    const config = (await import('@payload-config')).default
    const payload = await getPayload({ config })
    const usersCount = await payload.count({ collection: 'users' })
    checks.payload = { ok: true, usersCount: usersCount.totalDocs }
  } catch (e: any) {
    checks.payload = { ok: false, error: e.message, stack: e.stack?.split('\n').slice(0, 5) }
  }

  const allOk = (checks.sharp as any)?.ok && (checks.payload as any)?.ok
  return NextResponse.json(checks, { status: allOk ? 200 : 500 })
}
