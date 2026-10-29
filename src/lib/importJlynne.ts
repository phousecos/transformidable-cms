// One-time copy of the J. Lynne library (the jlynne.io instance: D1 + R2)
// into this instance. Called by api/admin/import-jlynne; see the notes there.
// The source is only read. Anything already here is skipped, not overwritten.

type Row = Record<string, any>

const all = async (db: any, sql: string): Promise<Row[]> => (await db.prepare(sql).all()).results || []

const iso = (v: unknown) => (typeof v === 'string' && v ? new Date(v).toISOString() : undefined)

// Values in the hasMany junction tables, keyed by parent id, in order.
function grouped(rows: Row[], valueKey: string) {
  const out = new Map<number, any[]>()
  for (const r of [...rows].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))) {
    if (!out.has(r.parent_id)) out.set(r.parent_id, [])
    out.get(r.parent_id)!.push(valueKey === 'number' ? Number(r[valueKey]) : r[valueKey])
  }
  return out
}

export type ImportOptions = {
  payload: any
  d1: { prepare(sql: string): { all(): Promise<{ results: Row[] }> } }
  source: { get(key: string): Promise<any> }
  target: { head(key: string): Promise<any>; put(key: string, body: any, opts?: any): Promise<any> }
  apply: boolean
  includeEditors: boolean
}

export async function importJlynne({ payload, d1, source, target, apply, includeEditors }: ImportOptions) {
  const report: Record<string, any> = { mode: apply ? 'apply' : 'dry-run', files: [], assets: [], people: [], errors: [] }

  // ── Files ───────────────────────────────────────────────────────────────
  const media = await all(d1, 'SELECT * FROM media ORDER BY id')
  const fileId = new Map<number, number | string>() // old media id → asset-files id
  for (const m of media) {
    const existing = await payload.find({ collection: 'asset-files', where: { filename: { equals: m.filename } }, limit: 1, depth: 0, overrideAccess: true })
    if (existing.docs[0]) {
      fileId.set(m.id, existing.docs[0].id)
      report.files.push({ filename: m.filename, result: 'already here' })
      continue
    }
    if (!apply) {
      report.files.push({ filename: m.filename, bytes: m.filesize, result: 'would copy' })
      continue
    }
    try {
      const key = `asset-files/${m.filename}`
      if (!(await target.head(key))) {
        const object = await source.get(m._objectkey || m.filename)
        if (!object) throw new Error('file missing from the jlynne-cms bucket')
        await target.put(key, object.body, { httpMetadata: object.httpMetadata })
      }
      // Straight to the database: the file is already in place, so the upload
      // pipeline (which expects a file in the request) is skipped.
      const doc = await payload.db.create({
        collection: 'asset-files',
        data: {
          filename: m.filename,
          mimeType: m.mime_type,
          filesize: m.filesize == null ? undefined : Number(m.filesize),
          width: m.width == null ? undefined : Number(m.width),
          height: m.height == null ? undefined : Number(m.height),
          alt: m.alt || undefined,
          prefix: 'asset-files',
          createdAt: iso(m.created_at),
          updatedAt: iso(m.updated_at),
        },
      })
      fileId.set(m.id, doc.id)
      report.files.push({ filename: m.filename, result: 'copied' })
    } catch (e: any) {
      report.errors.push({ file: m.filename, error: e.message })
    }
  }

  // ── Assets ──────────────────────────────────────────────────────────────
  const assets = await all(d1, 'SELECT * FROM assets ORDER BY id')
  const tracks = grouped(await all(d1, 'SELECT * FROM assets_track'), 'value')
  const uses = grouped(await all(d1, 'SELECT * FROM assets_use'), 'value')
  const weeks = grouped(await all(d1, "SELECT * FROM assets_numbers WHERE path = 'playbookWeeks'"), 'number')
  const assetId = new Map<number, number | string>() // old asset id → new id
  for (const a of assets) {
    const existing = await payload.find({ collection: 'assets', where: { slug: { equals: a.slug } }, limit: 1, depth: 0, overrideAccess: true })
    if (existing.docs[0]) {
      assetId.set(a.id, existing.docs[0].id)
      report.assets.push({ slug: a.slug, result: 'already here' })
      continue
    }
    if (!apply) {
      report.assets.push({ slug: a.slug, title: a.title, status: a.status, result: 'would copy' })
      continue
    }
    try {
      const doc = await payload.db.create({
        collection: 'assets',
        data: {
          title: a.title,
          summary: a.summary || undefined,
          slug: a.slug,
          status: a.status,
          version: a.version || undefined,
          versionDate: iso(a.version_date),
          track: tracks.get(a.id) || [],
          assetType: a.asset_type || undefined,
          sectorEdition: a.sector_edition || undefined,
          playbookWeeks: weeks.get(a.id) || [],
          brand: a.brand,
          use: uses.get(a.id) || [],
          sourceFile: a.source_file_id ? fileId.get(a.source_file_id) : undefined,
          publishedFile: a.published_file_id ? fileId.get(a.published_file_id) : undefined,
          externalUrl: a.external_url || undefined,
          notes: a.notes || undefined,
          createdAt: iso(a.created_at),
          updatedAt: iso(a.updated_at),
        },
      })
      assetId.set(a.id, doc.id)
      report.assets.push({ slug: a.slug, result: 'copied' })
    } catch (e: any) {
      report.errors.push({ asset: a.slug, error: e.message })
    }
  }
  // Links between assets, once every asset has its new id.
  if (apply) {
    for (const a of assets) {
      const id = assetId.get(a.id)
      const derivedFrom = a.derived_from_id ? assetId.get(a.derived_from_id) : undefined
      const replacedBy = a.replaced_by_id ? assetId.get(a.replaced_by_id) : undefined
      if (!id || (!derivedFrom && !replacedBy)) continue
      try {
        await payload.db.updateOne({ collection: 'assets', id, data: { ...(derivedFrom && { derivedFrom }), ...(replacedBy && { replacedBy }) } })
      } catch (e: any) {
        report.errors.push({ asset: a.slug, link: true, error: e.message })
      }
    }
  }

  // ── People ──────────────────────────────────────────────────────────────
  const people = await all(d1, 'SELECT id, email, name, role, hash, salt, created_at FROM users ORDER BY id')
  for (const p of people) {
    const email = String(p.email || '').toLowerCase()
    if (p.role === 'reader') {
      report.people.push({ email, result: 'not copied: connected system, issue a key under API Clients' })
      continue
    }
    if (p.role !== 'admin' && !includeEditors) {
      report.people.push({ email, role: p.role, result: 'not copied: would get full access (add ?includeEditors=1)' })
      continue
    }
    const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, depth: 0, overrideAccess: true })
    if (existing.docs[0]) {
      report.people.push({ email, result: 'already here (password unchanged)' })
      continue
    }
    if (!apply) {
      report.people.push({ email, role: p.role, result: 'would copy, with the same password' })
      continue
    }
    try {
      const [firstName, ...rest] = String(p.name || '').trim().split(/\s+/)
      await payload.db.create({
        collection: 'users',
        data: {
          email,
          firstName: firstName || undefined,
          lastName: rest.join(' ') || undefined,
          role: p.role === 'admin' ? 'admin' : 'editor',
          hash: p.hash,
          salt: p.salt,
          createdAt: iso(p.created_at),
        },
      })
      report.people.push({ email, result: 'copied' })
    } catch (e: any) {
      report.errors.push({ person: email, error: e.message })
    }
  }

  // For review: the older J. Lynne items held in Documents. Listed, not changed.
  const docs = await payload.find({ collection: 'documents', where: { brand: { in: ['jlynne'] } }, limit: 500, depth: 0, overrideAccess: true })
  report.jlynneDocuments = docs.docs.map((d: any) => ({ id: d.id, title: d.title, status: d.status, updatedAt: d.updatedAt }))

  report.summary = {
    files: media.length,
    assets: assets.length,
    people: people.length,
    errors: report.errors.length,
  }
  return report
}
