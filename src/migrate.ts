import pg from 'pg'

// ── Phase 1: Raw PG connection to diagnose & fix enum mismatches ─────────
// When pushSchema() recreates enum types and casts TEXT columns back,
// any row with a value not in the new enum causes error 22P02 (enum_in).
// We must convert ALL enum columns to TEXT, clean stale data, then drop types.
const rawCS = process.env.POSTGRES_URL || process.env.DATABASE_URL || ''
const connectionString = rawCS.includes('sslmode=')
  ? rawCS.replace(/sslmode=[^&]*/, 'sslmode=no-verify')
  : rawCS + (rawCS.includes('?') ? '&' : '?') + 'sslmode=no-verify'
const client = new pg.Client({ connectionString })
await client.connect()

// Known value renames (old DB value → new code value)
const valueRenames: Record<string, string> = {
  'jerribland.com': 'jerribland',
  'unlimitedpowerhouse.com': 'unlimitedpowerhouse',
  'agentpmo.com': 'agentpmo',
  'prept.com': 'prept',
  'lumynr.com': 'lumynr',
  'vettersgroup.com': 'vettersgroup',
}

// All tables+columns that hold enum data, with their valid values.
// Includes main tables, junction tables (hasMany selects), and version tables.
const enumColumns: { table: string; column: string; validValues: string[] }[] = [
  // Articles
  { table: 'articles_syndicate_to', column: 'value', validValues: ['jerribland', 'unlimitedpowerhouse', 'agentpmo', 'prept', 'lumynr', 'vettersgroup'] },
  { table: 'articles', column: 'status', validValues: ['draft', 'review', 'scheduled', 'published'] },
  // Articles versions
  { table: '_articles_v_version_syndicate_to', column: 'value', validValues: ['jerribland', 'unlimitedpowerhouse', 'agentpmo', 'prept', 'lumynr', 'vettersgroup'] },
  { table: '_articles_v', column: 'version_status', validValues: ['draft', 'review', 'scheduled', 'published'] },
  // Podcast Episodes
  { table: 'podcast_episodes_syndicate_to', column: 'value', validValues: ['jerribland', 'unlimitedpowerhouse', 'agentpmo', 'prept', 'lumynr', 'vettersgroup'] },
  { table: 'podcast_episodes', column: 'status', validValues: ['draft', 'review', 'scheduled', 'published'] },
  // Podcast Episodes versions
  { table: '_podcast_episodes_v_version_syndicate_to', column: 'value', validValues: ['jerribland', 'unlimitedpowerhouse', 'agentpmo', 'prept', 'lumynr', 'vettersgroup'] },
  { table: '_podcast_episodes_v', column: 'version_status', validValues: ['draft', 'review', 'scheduled', 'published'] },
  // Newsletter Issues
  { table: 'newsletter_issues', column: 'status', validValues: ['draft', 'scheduled', 'sent'] },
  // Users
  { table: 'users', column: 'role', validValues: ['admin', 'editor', 'brandContributor', 'sponsorManager'] },
  // Authors
  { table: 'authors', column: 'type', validValues: ['staff', 'guestContributor', 'podcastGuest'] },
  { table: 'authors_social_links', column: 'platform', validValues: ['linkedin', 'twitter', 'website', 'instagram', 'other'] },
  // Sponsors
  { table: 'sponsors_ad_creative', column: 'format', validValues: ['image', 'audio', 'html'] },
  { table: 'sponsors', column: 'placement_type', validValues: ['podcastMidRoll', 'articleSidebar', 'newsletter'] },
]

try {
  // Dump all enum types and values for diagnostics
  const { rows: enumRows } = await client.query(`
    SELECT t.typname AS enum_name, e.enumlabel AS enum_value
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    ORDER BY t.typname, e.enumsortorder
  `)
  console.log('[migrate] Current DB enums:')
  for (const row of enumRows) {
    console.log(`  ${row.enum_name}: ${row.enum_value}`)
  }

  // Step 1: Convert ALL enum columns to TEXT (so DROP TYPE doesn't fail)
  // Query every column that uses a user-defined enum type
  const { rows: allEnumCols } = await client.query(`
    SELECT c.table_schema, c.table_name, c.column_name, c.udt_name
    FROM information_schema.columns c
    WHERE c.data_type = 'USER-DEFINED'
      AND c.table_schema = 'public'
      AND c.udt_name IN (SELECT typname FROM pg_type WHERE oid IN (SELECT enumtypid FROM pg_enum))
  `)
  console.log(`[migrate] Found ${allEnumCols.length} enum columns to convert to TEXT`)

  for (const col of allEnumCols) {
    try {
      await client.query(
        `ALTER TABLE "${col.table_name}" ALTER COLUMN "${col.column_name}" TYPE TEXT USING "${col.column_name}"::TEXT`
      )
      console.log(`  Converted ${col.table_name}.${col.column_name} (was ${col.udt_name}) to TEXT`)
    } catch (e: any) {
      console.log(`  Warning converting ${col.table_name}.${col.column_name}: ${e.message}`)
    }
  }

  // Step 2: Drop ALL Payload enum types
  const payloadEnumTypes = [...new Set(enumRows
    .map((r: any) => r.enum_name as string)
    .filter((n: string) => n.startsWith('enum_'))
  )]
  for (const enumName of payloadEnumTypes) {
    await client.query(`DROP TYPE IF EXISTS "${enumName}" CASCADE`)
    console.log(`  Dropped enum ${enumName}`)
  }

  // Step 3: Clean data in ALL known tables — rename stale values, null invalids
  for (const { table, column, validValues } of enumColumns) {
    // Check if table exists
    const { rows: tableExists } = await client.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
      [table]
    )
    if (!tableExists.length) {
      console.log(`  Table ${table} does not exist — skipping`)
      continue
    }

    // Check if column exists
    const { rows: colExists } = await client.query(
      `SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
      [table, column]
    )
    if (!colExists.length) {
      console.log(`  Column ${table}.${column} does not exist — skipping`)
      continue
    }

    // Apply known renames
    for (const [oldVal, newVal] of Object.entries(valueRenames)) {
      const res = await client.query(
        `UPDATE "${table}" SET "${column}" = $1 WHERE "${column}" = $2`,
        [newVal, oldVal]
      )
      if (res.rowCount && res.rowCount > 0) {
        console.log(`  Updated ${table}.${column}: '${oldVal}' → '${newVal}' (${res.rowCount} rows)`)
      }
    }

    // Null out any remaining values that aren't in the valid set
    const res = await client.query(
      `UPDATE "${table}" SET "${column}" = NULL WHERE "${column}" IS NOT NULL AND "${column}" != ALL($1)`,
      [validValues]
    )
    if (res.rowCount && res.rowCount > 0) {
      console.log(`  Nulled ${res.rowCount} invalid values in ${table}.${column}`)
    }
  }

  console.log('[migrate] Phase 1 complete — enums dropped and data cleaned.')
} catch (e: any) {
  console.error('[migrate] Phase 1 error:', e.message)
  console.error(e)
} finally {
  await client.end()
}

// ── Phase 2: Normal Payload init + schema push ───────────────────────────
const { getPayload } = await import('payload')
const { default: config } = await import('./payload.config.ts')

const payload = await getPayload({ config })
const adapter = payload.db as any

// Backfill NULL version_body in _articles_v so SET NOT NULL doesn't fail
console.log('[migrate] Backfilling NULL version_body in _articles_v...')
try {
  const emptyDoc = JSON.stringify({ root: { type: 'root', children: [], direction: null, format: '', indent: 0, version: 1 } })
  const res = await adapter.drizzle.execute({
    sql: `UPDATE "_articles_v" SET "version_body" = '${emptyDoc}'::jsonb WHERE "version_body" IS NULL`,
  })
  console.log('[migrate] Backfilled version_body NULLs')
} catch (e: any) {
  console.log('[migrate] Could not backfill version_body:', e.message)
}

console.log('[migrate] Pushing schema to database...')
const { pushSchema } = adapter.requireDrizzleKit()
const { apply, hasDataLoss, warnings, statements } = await pushSchema(
  adapter.schema,
  adapter.drizzle,
  adapter.schemaName ? [adapter.schemaName] : undefined,
  adapter.tablesFilter,
  adapter.extensions?.postgis ? ['postgis'] : undefined,
)

if (warnings.length) {
  console.log('[migrate] Push warnings:', warnings.join('\n'))
  if (hasDataLoss) {
    console.log('[migrate] DATA LOSS WARNING — proceeding anyway (CI)')
  }
}

console.log('[migrate] Statements to apply:', JSON.stringify(statements, null, 2))
await apply()
console.log('[migrate] Schema push complete.')

await payload.db.migrate()

// ── Phase 3: Sync _status with custom status field ──────────────────────
// With versions.drafts enabled, Payload auto-filters by _status. Articles
// where status='published' but _status='draft' won't appear in API results.
// Sync them so published articles are actually visible.
console.log('[migrate] Syncing _status with editorial status...')
for (const collection of ['articles', 'podcast_episodes']) {
  try {
    const res = await adapter.drizzle.execute({
      sql: `UPDATE "${collection}" SET "_status" = 'published' WHERE "status" = 'published' AND ("_status" IS NULL OR "_status" != 'published')`,
    })
    console.log(`[migrate] Synced _status for ${collection}`)
  } catch (e: any) {
    console.log(`[migrate] Could not sync ${collection}._status: ${e.message}`)
  }
}

await payload.destroy()
process.exit(0)
