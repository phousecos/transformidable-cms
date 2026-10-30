// Uploads the re-skinned library files to Payload as a new version of each asset.
//
//   PAYLOAD_API_KEY=... node upload.mjs <dir> [--apply] [--status in-review] [--brand]
//
// <dir> holds the re-skinned <name>.docx and <name>.pdf pairs, named like the
// files they replace. Without --apply it only prints the plan. For each asset
// whose Word original matches a pair it uploads both files as asset-files
// (<name>-v<N>.docx / .pdf), then points the asset at them and bumps version
// and versionDate. --status sets the asset status (default: leave as is).
// --brand also sets brand to Transformidable; that needs the Assets change that
// lets Transformidable items keep stored files to be deployed first.
// Slugs never change, so /advisory/tools/{slug} links keep working.

import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const dir = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--status')
const apply = args.includes('--apply')
const setBrand = args.includes('--brand')
const status = args.includes('--status') ? args[args.indexOf('--status') + 1] : null
const base = (process.env.PAYLOAD_URL || 'https://betransformidable.com').replace(/\/+$/, '')
const key = process.env.PAYLOAD_API_KEY

if (!dir || !key) {
  console.error('Usage: PAYLOAD_API_KEY=... node upload.mjs <dir> [--apply] [--status in-review] [--brand]')
  process.exit(1)
}

const auth = { Authorization: `users API-Key ${key}` }

async function api(method, url, body) {
  const res = await fetch(`${base}/api${url}`, {
    method,
    headers: body instanceof FormData ? auth : { ...auth, 'Content-Type': 'application/json' },
    body: body instanceof FormData ? body : body && JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${method} ${url}: ${res.status} ${JSON.stringify(json.errors || json)}`)
  return json
}

const MIME = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pdf: 'application/pdf',
}

async function uploadFile(file, filename, alt) {
  const form = new FormData()
  const ext = path.extname(file).slice(1)
  form.append('file', new Blob([fs.readFileSync(file)], { type: MIME[ext] }), filename)
  form.append('_payload', JSON.stringify({ alt }))
  const { doc } = await api('POST', '/asset-files', form)
  return doc.id
}

// "Board-Brief-06-Vendor-Portfolio-1.docx" (Payload's rename of a duplicate)
// and "...-v2.docx" both come from "Board-Brief-06-Vendor-Portfolio".
const stem = (filename) => filename.replace(/\.[^.]+$/, '').replace(/-(?:v)?\d+$/, '')

const { docs: assets } = await api('GET', '/assets?limit=500&depth=1&sort=title')
const today = new Date().toISOString().slice(0, 10)
let planned = 0

for (const asset of assets) {
  const source = asset.sourceFile?.filename
  if (!source) {
    console.log(`skip  ${asset.slug}: no Word original`)
    continue
  }
  const name = stem(source)
  const docx = path.join(dir, `${name}.docx`)
  const pdf = path.join(dir, `${name}.pdf`)
  if (!fs.existsSync(docx) || !fs.existsSync(pdf)) {
    console.log(`skip  ${asset.slug}: no re-skinned ${name}.docx/.pdf`)
    continue
  }
  const n = Number(/(\d+)/.exec(asset.version || '')?.[1] || 1) + 1
  const version = `v${n}`
  // The J. Lynne originals carry no version suffix; ours always do.
  if (/-v\d+\.docx$/.test(source)) {
    console.log(`skip  ${asset.slug}: already on ${source}`)
    continue
  }
  const patch = {
    version,
    versionDate: today,
    ...(status && { status }),
    ...(setBrand && { brand: 'transformidable' }),
  }
  planned++
  console.log(`${apply ? 'write' : 'plan '} ${asset.slug} (${asset.status}, ${asset.version || 'no version'}) <- ${name}-${version}.docx/.pdf ${JSON.stringify(patch)}`)
  if (!apply) continue
  const sourceFile = await uploadFile(docx, `${name}-${version}.docx`, `${asset.title} (Word)`)
  const publishedFile = await uploadFile(pdf, `${name}-${version}.pdf`, `${asset.title} (PDF)`)
  await api('PATCH', `/assets/${asset.id}`, { ...patch, sourceFile, publishedFile })
}

console.log(`\n${planned} asset(s) ${apply ? 'updated' : 'to update; run again with --apply to write'}.`)
