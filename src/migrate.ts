import pg from 'pg'

// ── Phase 1: Raw PG connection to diagnose & fix enum mismatches ─────────
// Payload validates enum types on init (even with push:false), so we must
// ensure DB enums match the code BEFORE Payload boots.
const rawCS = process.env.POSTGRES_URL || process.env.DATABASE_URL || ''
const connectionString = rawCS.includes('sslmode=')
  ? rawCS.replace(/sslmode=[^&]*/, 'sslmode=no-verify')
  : rawCS + (rawCS.includes('?') ? '&' : '?') + 'sslmode=no-verify'
const client = new pg.Client({ connectionString })
await client.connect()

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

  // Convert all enum columns to TEXT, drop the enum types, then recreate
  // them with the correct values. This is the nuclear option but avoids
  // any mismatch between DB state and code definitions.
  const { rows: enumCols } = await client.query(`
    SELECT c.table_name, c.column_name, t.typname AS enum_name
    FROM information_schema.columns c
    JOIN pg_type t ON t.typname = c.udt_name
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE c.table_schema = 'public'
    GROUP BY c.table_name, c.column_name, t.typname
  `)

  // Group columns by enum type
  const enumUsages = new Map<string, { table: string; column: string }[]>()
  for (const col of enumCols) {
    const usages = enumUsages.get(col.enum_name) || []
    usages.push({ table: col.table_name, column: col.column_name })
    enumUsages.set(col.enum_name, usages)
  }

  // Get unique enum type names from the DB
  const enumTypes = [...new Set(enumRows.map((r: any) => r.enum_name))]

  for (const enumName of enumTypes) {
    console.log(`[migrate] Resetting enum type: ${enumName}`)
    const usages = enumUsages.get(enumName) || []

    // Step 1: Convert columns using this enum to TEXT
    for (const { table, column } of usages) {
      await client.query(
        `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE TEXT USING "${column}"::TEXT`
      )
      console.log(`  Converted ${table}.${column} to TEXT`)
    }

    // Step 2: Drop the enum type
    await client.query(`DROP TYPE IF EXISTS "${enumName}"`)
    console.log(`  Dropped enum ${enumName}`)
  }

  // The enum types will be recreated by Payload's schema push (Phase 2)
  // and the TEXT columns will be cast back to the new enum types.
  console.log('[migrate] All enum types dropped. Payload will recreate them.')
} catch (e: any) {
  console.error('[migrate] Phase 1 error:', e.message)
  // Don't throw — let Payload try to init anyway
} finally {
  await client.end()
}

// ── Phase 2: Normal Payload init + schema push ───────────────────────────
const { getPayload } = await import('payload')
const { default: config } = await import('./payload.config.ts')

const payload = await getPayload({ config })
const adapter = payload.db as any

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

// Run any pending migration files
await payload.db.migrate()

await payload.destroy()
process.exit(0)
