// @ts-nocheck
/**
 * Import a case file's coded segments from the coding sheet.
 *
 *   npm run import:coding -- --case=ucpath --file=./UCPath_Explanatory_Coding.csv
 *   npm run import:coding -- --case=ucpath --file=... --dry-run
 *
 * The coding sheet is the source of truth. Each run makes the case's findings
 * match the file: rows are matched on the `Segment` id, new ones are added,
 * changed ones updated, and stored findings whose segment is absent from the
 * file are removed. `--dry-run` reports that plan without writing.
 *
 * Only the row-level coding sheet is imported. The four-questions SUMMARY sheet
 * is deliberately NOT importable: it is exactly reproducible from these rows
 * (narrative findings only, grouped by primary domain), so storing it would
 * create a second copy of the same numbers that can drift out of step with the
 * first. The site computes it instead.
 *
 * Each question is carried twice in the sheet — as a human answer label and as
 * a codebook code. We resolve the label to a code and then check the sheet's
 * own code column agrees. A disagreement is a coding error worth failing on,
 * not something to silently pick a winner for.
 */
import { getPayload } from 'payload'
import fs from 'fs'
// Must come before payload.config, which reads process.env as it evaluates.
import '../lib/loadEnv.ts'
import config from '../payload.config.ts'
import { DOMAINS } from '../lib/governanceDomains.ts'
import { QUESTIONS, codeFromLabel, optionFor, segmentTypeFromLabel } from '../lib/governanceCodebook.ts'

// ── CSV (RFC 4180: quoted fields, embedded commas, doubled quotes) ─────────
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  const src = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n')
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++ } else quoted = false
      } else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else field += c
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''))
}

const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '')
const splitList = (s) => (s || '').split(/[;,]/).map((x) => x.trim()).filter(Boolean)

// Headers carry en-dashes, section marks and long question text, so match on a
// normalized prefix rather than the exact string.
function findColumn(headers, ...candidates) {
  for (const cand of candidates) {
    const want = norm(cand)
    const i = headers.findIndex((h) => norm(h).startsWith(want))
    if (i !== -1) return i
  }
  return -1
}

const DOMAIN_CODES = new Set(DOMAINS.map((d) => d.code))

function arg(name, fallback = null) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  if (hit) return hit.slice(name.length + 3)
  return process.argv.includes(`--${name}`) ? true : fallback
}

const caseSlug = arg('case')
const file = arg('file')
const dryRun = Boolean(arg('dry-run'))

if (!caseSlug || !file) {
  console.error('Usage: npm run import:coding -- --case=<slug> --file=<coding.csv> [--dry-run]')
  process.exit(1)
}
if (!fs.existsSync(file)) {
  console.error(`[import:coding] No such file: ${file}`)
  process.exit(1)
}

const rows = parseCsv(fs.readFileSync(file, 'utf8'))
const headers = rows[0]
const col = {
  segment: findColumn(headers, 'Segment'),
  primary: findColumn(headers, 'Primary domain'),
  secondary: findColumn(headers, 'Secondary domain'),
  type: findColumn(headers, 'Type'),
  name: findColumn(headers, 'Governance mechanism'),
  consequence: findColumn(headers, 'Consequence type'),
}
for (const q of QUESTIONS) {
  col[q.key] = findColumn(headers, q.tag === 'Overall' ? 'Overall' : q.tag)
  col[`${q.key}Code`] = findColumn(headers, `code:${q.key}`)
}

const missing = ['segment', 'primary', 'name'].filter((k) => col[k] === -1)
if (missing.length) {
  console.error(`[import:coding] Coding sheet is missing required column(s): ${missing.join(', ')}`)
  console.error(`  headers seen: ${headers.join(' | ')}`)
  process.exit(1)
}

// ── Build findings, collecting every problem before giving up ──────────────
const problems = []
const findings = []
const seen = new Set()

for (let i = 1; i < rows.length; i++) {
  const r = rows[i]
  const at = `row ${i + 1}`
  const cell = (idx) => (idx === -1 ? '' : (r[idx] || '').trim())
  const segment = cell(col.segment)
  if (!segment) { problems.push(`${at}: no Segment id`); continue }
  if (seen.has(segment)) { problems.push(`${at}: duplicate Segment id "${segment}"`); continue }
  seen.add(segment)

  const primaryDomain = cell(col.primary)
  if (primaryDomain && !DOMAIN_CODES.has(primaryDomain)) {
    problems.push(`${at} (${segment}): unknown primary domain "${primaryDomain}"`)
  }
  const secondaryDomains = splitList(cell(col.secondary)).filter((d) => {
    if (!DOMAIN_CODES.has(d)) { problems.push(`${at} (${segment}): unknown secondary domain "${d}"`); return false }
    return true
  })

  const typeLabel = cell(col.type)
  const segmentType = typeLabel ? segmentTypeFromLabel(typeLabel) : 'narrative-finding'
  if (typeLabel && !segmentType) problems.push(`${at} (${segment}): unknown segment type "${typeLabel}"`)

  const finding = {
    segment,
    segmentType: segmentType || 'narrative-finding',
    primaryDomain: primaryDomain || undefined,
    secondaryDomains,
    name: cell(col.name) || segment,
    consequenceTypes: splitList(cell(col.consequence)),
  }

  for (const q of QUESTIONS) {
    const label = cell(col[q.key])
    const sheetCode = cell(col[`${q.key}Code`])
    if (!label && !sheetCode) continue

    const fromLabel = label ? codeFromLabel(q.key, label) : undefined
    if (label && !fromLabel) {
      problems.push(`${at} (${segment}) ${q.tag}: answer "${label}" is not in the ${q.section} scale`)
      continue
    }
    if (sheetCode && !optionFor(q.key, sheetCode)) {
      problems.push(`${at} (${segment}) ${q.tag}: code "${sheetCode}" is not in the ${q.section} scale`)
      continue
    }
    // The sheet states each answer twice. If the two disagree, one of them is
    // wrong and we cannot tell which — that is a coding error, so stop.
    if (fromLabel && sheetCode && fromLabel !== sheetCode) {
      problems.push(
        `${at} (${segment}) ${q.tag}: answer "${label}" means ${fromLabel}, but the sheet codes it ${sheetCode}`,
      )
      continue
    }
    finding[q.key] = fromLabel || sheetCode
  }

  findings.push(finding)
}

if (problems.length) {
  console.error(`[import:coding] ${problems.length} problem(s) in ${file} — nothing was written:`)
  for (const p of problems) console.error(`  • ${p}`)
  process.exit(1)
}

if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
  console.error('[import:coding] No POSTGRES_URL (or DATABASE_URL) set.')
  console.error('  Put it in a .env file in the project root, or pass it inline:')
  console.error("  POSTGRES_URL='postgres://…' npm run import:coding -- --case=… --file=…")
  process.exit(1)
}

const payload = await getPayload({ config })
const found = await payload.find({ collection: 'case-files', where: { slug: { equals: caseSlug } }, limit: 1, depth: 0 })
if (!found.totalDocs) {
  console.error(`[import:coding] No case file with slug "${caseSlug}".`)
  process.exit(1)
}
const doc = found.docs[0]
const stored = Array.isArray(doc.governanceMechanisms) ? doc.governanceMechanisms : []
const storedBySegment = new Map(stored.filter((m) => m?.segment).map((m) => [m.segment, m]))

// The sheet has no column for the prose description or the legacy assessment,
// so carry those across from the stored row rather than blanking work done in
// the admin. Everything the sheet does define, the sheet wins.
const merged = findings.map((f) => {
  const prev = storedBySegment.get(f.segment)
  return prev ? { ...f, description: prev.description ?? undefined, assessment: prev.assessment ?? undefined } : f
})

const added = merged.filter((f) => !storedBySegment.has(f.segment))
const removed = stored.filter((m) => !m?.segment || !seen.has(m.segment))
const changed = merged.filter((f) => {
  const prev = storedBySegment.get(f.segment)
  if (!prev) return false
  return QUESTIONS.some((q) => (prev[q.key] || undefined) !== (f[q.key] || undefined)) ||
    prev.primaryDomain !== f.primaryDomain || prev.name !== f.name || prev.segmentType !== f.segmentType
})

const counted = merged.filter((f) => f.segmentType === 'narrative-finding').length
console.log(`[import:coding] ${caseSlug}: ${merged.length} segments in sheet (${counted} narrative findings, the ones the tables tally)`)
console.log(`  + ${added.length} added   ~ ${changed.length} changed   - ${removed.length} removed`)
for (const f of added) console.log(`    + ${f.segment} ${f.name}`)
for (const f of changed) console.log(`    ~ ${f.segment} ${f.name}`)
for (const m of removed) console.log(`    - ${m.segment || '(no segment id)'} ${m.name || ''}`)

if (dryRun) {
  console.log('[import:coding] --dry-run: nothing written.')
  process.exit(0)
}

await payload.update({ collection: 'case-files', id: doc.id, data: { governanceMechanisms: merged } })
console.log('[import:coding] Written.')
process.exit(0)
