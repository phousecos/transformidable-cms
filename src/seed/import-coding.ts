// @ts-nocheck
/**
 * Import a case file's coded segments from the coding sheet, from the CLI.
 *
 *   npm run import:coding -- --case=ucpath --file=./coding.csv
 *   npm run import:coding -- --case=ucpath --file=./coding.csv --dry-run
 *
 * The parsing and the reconciliation both live in src/lib/importCoding.ts, so
 * this and the deploy step in migrate.ts cannot drift apart. This file is the
 * command-line skin: arguments, output, and exit codes.
 *
 * Sheets committed under src/seed/coding are loaded automatically on every
 * deploy, so this is for one-off runs against a database you can reach, or for
 * checking a sheet with --dry-run before committing it.
 */
import fs from 'fs'
// Must come before payload.config, which reads process.env as it evaluates.
import '../lib/loadEnv.ts'
import { getPayload } from 'payload'
import config from '../payload.config.ts'
import { parseCodingSheet, applyCoding } from '../lib/importCoding.ts'

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

const parsed = parseCodingSheet(fs.readFileSync(file, 'utf8'))
if (parsed.problems.length) {
  console.error(`[import:coding] ${parsed.problems.length} problem(s) in ${file} — nothing was written:`)
  for (const p of parsed.problems) console.error(`  • ${p}`)
  process.exit(1)
}

if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
  console.error('[import:coding] No POSTGRES_URL (or DATABASE_URL) set.')
  console.error('  Put it in a .env file in the project root, or pass it inline:')
  console.error("  POSTGRES_URL='postgres://…' npm run import:coding -- --case=… --file=…")
  process.exit(1)
}

const payload = await getPayload({ config })
const result = await applyCoding(payload, caseSlug, parsed, { dryRun })
if (result.error) {
  console.error(`[import:coding] ${result.error}`)
  process.exit(1)
}

console.log(
  `[import:coding] ${caseSlug}: ${result.total} segments in sheet ` +
    `(${result.counted} narrative findings, the ones the tables tally)`,
)
console.log(`  + ${result.added.length} added   ~ ${result.changed.length} changed   - ${result.removed.length} removed`)
for (const f of result.added) console.log(`    + ${f.segment} ${f.name}`)
for (const f of result.changed) console.log(`    ~ ${f.segment} ${f.name}`)
for (const m of result.removed) console.log(`    - ${m.segment || '(no segment id)'} ${m.name || ''}`)
console.log(result.wrote ? '[import:coding] Written.' : '[import:coding] --dry-run: nothing written.')
process.exit(0)
