import pg from 'pg'

// ── Phase 1: Raw PG connection to diagnose & fix enum mismatches ─────────
// Payload validates enums on init, so we must fix them before importing config.
// pg's Object.assign overwrites the ssl option with sslmode from the connection
// string, so we must rewrite the URL directly (same approach as payload.config).
const rawCS = process.env.POSTGRES_URL || process.env.DATABASE_URL || ''
const connectionString = rawCS.includes('sslmode=')
  ? rawCS.replace(/sslmode=[^&]*/, 'sslmode=no-verify')
  : rawCS + (rawCS.includes('?') ? '&' : '?') + 'sslmode=no-verify'
const client = new pg.Client({ connectionString })
await client.connect()

try {
  // Dump all enum types and values for diagnostics
  const { rows } = await client.query(`
    SELECT t.typname AS enum_name, e.enumlabel AS enum_value
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    ORDER BY t.typname, e.enumsortorder
  `)
  console.log('[migrate] Current DB enums:')
  for (const row of rows) {
    console.log(`  ${row.enum_name}: ${row.enum_value}`)
  }

  // If the DB has .com values but our code expects non-.com values, rename them
  const syndicateEnumTypes = [
    'enum_articles_syndicate_to',
    'enum_podcast_episodes_syndicate_to',
  ]
  const renames = [
    ['jerribland.com', 'jerribland'],
    ['unlimitedpowerhouse.com', 'unlimitedpowerhouse'],
    ['agentpmo.com', 'agentpmo'],
    ['prept.com', 'prept'],
    ['lumynr.com', 'lumynr'],
    ['vettersgroup.com', 'vettersgroup'],
  ]
  for (const enumType of syndicateEnumTypes) {
    for (const [oldVal, newVal] of renames) {
      try {
        await client.query(`ALTER TYPE "${enumType}" RENAME VALUE '${oldVal}' TO '${newVal}'`)
        console.log(`[migrate] Renamed ${enumType}: ${oldVal} → ${newVal}`)
      } catch (e: any) {
        // Ignore if the value doesn't exist or is already correct
        if (e.code !== '42704' && !e.message?.includes('does not exist')) {
          console.log(`[migrate] Rename warning for ${enumType} ${oldVal}: ${e.message}`)
        }
      }
    }
  }
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
const { apply, hasDataLoss, warnings } = await pushSchema(
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

await apply()
console.log('[migrate] Schema push complete.')

// Run any pending migration files
await payload.db.migrate()

await payload.destroy()
process.exit(0)
