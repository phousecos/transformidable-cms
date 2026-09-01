// @ts-nocheck
/**
 * Parse and apply a governance coding sheet.
 *
 * Shared by two callers so they can never drift: the `import:coding` CLI, and
 * the deploy step in migrate.ts that loads every sheet in src/seed/coding.
 *
 * The coding sheet is the source of truth. Applying one makes a case's findings
 * match it: rows are matched on the `Segment` id, new ones added, changed ones
 * updated, and stored findings whose segment is absent from the sheet removed.
 *
 * Only the row-level coding sheet is handled here. The four-questions SUMMARY
 * sheet is deliberately not importable: it is exactly reproducible from these
 * rows (narrative findings only, grouped by primary domain), so storing it
 * would be a second copy of the same numbers, free to drift from the first.
 * The site computes it instead.
 */
import { DOMAINS } from './governanceDomains.ts'
import { QUESTIONS, codeFromLabel, optionFor, segmentTypeFromLabel } from './governanceCodebook.ts'

// ── CSV (RFC 4180: quoted fields, embedded commas, doubled quotes) ─────────
export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  const src = text.replace(/^\ufeff/, '').replace(/\r\n?/g, '\n')
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

/**
 * Turn sheet text into findings, collecting every problem rather than stopping
 * at the first, so one run tells the coder everything that needs fixing.
 *
 * Returns { findings, problems }. A non-empty `problems` means nothing should
 * be written: each question is stated twice in the sheet, as an answer label
 * and as a code, and when the two disagree there is no way to tell which is
 * right, so that is an error rather than a value to guess at.
 */
export function parseCodingSheet(text) {
  const rows = parseCsv(text)
  const problems = []
  const findings = []
  if (!rows.length) return { findings, problems: ['sheet is empty'], seen: new Set() }

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

  const missingCols = ['segment', 'primary', 'name'].filter((k) => col[k] === -1)
  if (missingCols.length) {
    return {
      findings,
      seen: new Set(),
      problems: [
        `missing required column(s): ${missingCols.join(', ')}`,
        `headers seen: ${headers.join(' | ')}`,
      ],
    }
  }

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

  return { findings, problems, seen }
}

/**
 * Make a case's stored findings match a parsed sheet.
 *
 * The sheet has no column for the prose description or the legacy assessment,
 * so those are carried across from the stored row rather than blanking work
 * done in the admin. Everything the sheet does define, the sheet wins.
 */
export async function applyCoding(payload, caseSlug, parsed, { dryRun = false } = {}) {
  const found = await payload.find({
    collection: 'case-files',
    where: { slug: { equals: caseSlug } },
    limit: 1,
    depth: 0,
  })
  if (!found.totalDocs) return { error: `no case file with slug "${caseSlug}"` }

  const doc = found.docs[0]
  const stored = Array.isArray(doc.governanceMechanisms) ? doc.governanceMechanisms : []
  const storedBySegment = new Map(stored.filter((m) => m?.segment).map((m) => [m.segment, m]))

  const merged = parsed.findings.map((f) => {
    const prev = storedBySegment.get(f.segment)
    return prev
      ? { ...f, description: prev.description ?? undefined, assessment: prev.assessment ?? undefined }
      : f
  })

  const added = merged.filter((f) => !storedBySegment.has(f.segment))
  const removed = stored.filter((m) => !m?.segment || !parsed.seen.has(m.segment))
  const changed = merged.filter((f) => {
    const prev = storedBySegment.get(f.segment)
    if (!prev) return false
    return (
      QUESTIONS.some((q) => (prev[q.key] || undefined) !== (f[q.key] || undefined)) ||
      prev.primaryDomain !== f.primaryDomain ||
      prev.name !== f.name ||
      prev.segmentType !== f.segmentType
    )
  })
  const counted = merged.filter((f) => f.segmentType === 'narrative-finding').length

  if (!dryRun) {
    await payload.update({ collection: 'case-files', id: doc.id, data: { governanceMechanisms: merged } })
  }
  return { total: merged.length, counted, added, changed, removed, wrote: !dryRun }
}
