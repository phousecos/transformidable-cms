/**
 * Copy every media file from Vercel Blob to Cloudflare R2, for the move off
 * Vercel.
 *
 *   npm run media:copy-to-r2 -- --dry-run
 *   npm run media:copy-to-r2
 *   npm run media:copy-to-r2 -- --bucket=other-bucket
 *
 * Needs BLOB_READ_WRITE_TOKEN (from .env or the shell) and wrangler logged in
 * to the Cloudflare account (`npx wrangler login`, or CLOUDFLARE_API_TOKEN).
 *
 * Objects keep their exact key. Both storage plugins key files by filename and
 * Payload serves them at /api/media/file/<filename>, so nothing in the database
 * changes. Re-running is safe: each object is overwritten with the same bytes.
 * Pass --local to write to wrangler's local R2 instead, for testing against
 * `npm run preview:cf`.
 */
import { execFileSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { list } from '@vercel/blob'
import '../lib/loadEnv.ts'

function arg(name: string): string | boolean | null {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  if (hit) return hit.slice(name.length + 3)
  return process.argv.includes(`--${name}`) ? true : null
}

const bucket = (arg('bucket') as string) || 'transformidable-media'
const dryRun = Boolean(arg('dry-run'))
const target = arg('local') ? '--local' : '--remote'
const token = process.env.BLOB_READ_WRITE_TOKEN

if (!token) {
  console.error('[media:copy-to-r2] BLOB_READ_WRITE_TOKEN is not set (shell or .env).')
  process.exit(1)
}

const wrangler = path.resolve('node_modules/.bin/wrangler')
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blob-to-r2-'))

let copied = 0
let bytes = 0
const failed: string[] = []
let cursor: string | undefined

try {
  do {
    const page = await list({ cursor, limit: 1000, token })
    for (const blob of page.blobs) {
      const key = blob.pathname.replace(/^\/+/, '')
      if (dryRun) {
        console.log(`  would copy ${key} (${blob.size} bytes)`)
        copied++
        bytes += blob.size
        continue
      }
      try {
        const res = await fetch(blob.url)
        if (!res.ok) throw new Error(`download failed: HTTP ${res.status}`)
        const file = path.join(tmpDir, 'object')
        fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()))
        const contentType = res.headers.get('content-type') || 'application/octet-stream'
        execFileSync(
          wrangler,
          ['r2', 'object', 'put', `${bucket}/${key}`, '--file', file, '--content-type', contentType, target],
          { stdio: 'pipe' },
        )
        console.log(`  copied ${key}`)
        copied++
        bytes += blob.size
      } catch (e: any) {
        const detail = e.stderr?.toString().trim() || e.message
        console.error(`  FAILED ${key}: ${detail}`)
        failed.push(key)
      }
    }
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true })
}

const mb = (bytes / 1024 / 1024).toFixed(1)
console.log(
  `[media:copy-to-r2] ${dryRun ? 'Would copy' : 'Copied'} ${copied} object(s), ${mb} MB, to ${bucket}` +
    (dryRun ? '' : ` (${target.slice(2)})`) +
    (failed.length ? `; ${failed.length} failed` : '') +
    '.',
)
if (failed.length) {
  console.error('Re-run to retry; objects that already copied are simply overwritten.')
  process.exit(1)
}
