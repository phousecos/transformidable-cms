import pg from 'pg'

// ── Phase 1: Raw PG connection to diagnose & fix enum mismatches ─────────
// When pushSchema() recreates enum types and casts TEXT columns back,
// any row with a value not in the new enum causes error 22P02 (enum_in).
// We must convert columns to TEXT, clean up stale values, then drop the types.
const rawCS = process.env.POSTGRES_URL || process.env.DATABASE_URL || ''
const connectionString = rawCS.includes('sslmode=')
  ? rawCS.replace(/sslmode=[^&]*/, 'sslmode=no-verify')
  : rawCS + (rawCS.includes('?') ? '&' : '?') + 'sslmode=no-verify'
const client = new pg.Client({ connectionString })
await client.connect()

// Map of enum type name → valid values (must match the code in src/collections/)
const expectedEnumValues: Record<string, string[]> = {
  enum_articles_syndicate_to: ['jerribland', 'unlimitedpowerhouse', 'agentpmo', 'prept', 'lumynr', 'vettersgroup'],
  enum_podcast_episodes_syndicate_to: ['jerribland', 'unlimitedpowerhouse', 'agentpmo', 'prept', 'lumynr', 'vettersgroup'],
  enum_articles_status: ['draft', 'review', 'scheduled', 'published'],
  enum_podcast_episodes_status: ['draft', 'review', 'scheduled', 'published'],
  enum_newsletter_issues_status: ['draft', 'scheduled', 'sent'],
  enum_users_role: ['admin', 'editor', 'brandContributor', 'sponsorManager'],
  enum_authors_type: ['staff', 'guestContributor', 'podcastGuest'],
  enum_authors_social_links_platform: ['linkedin', 'twitter', 'website', 'instagram', 'other'],
  enum_sponsors_ad_creative_format: ['image', 'audio', 'html'],
  enum_sponsors_placement_type: ['podcastMidRoll', 'articleSidebar', 'newsletter'],
}

// Known value renames (old DB value → new code value)
const valueRenames: Record<string, string> = {
  'jerribland.com': 'jerribland',
  'unlimitedpowerhouse.com': 'unlimitedpowerhouse',
  'agentpmo.com': 'agentpmo',
  'prept.com': 'prept',
  'lumynr.com': 'lumynr',
  'vettersgroup.com': 'vettersgroup',
}

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

  // Find all columns that use enum types
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

  const enumTypes = [...new Set(enumRows.map((r: any) => r.enum_name))]

  for (const enumName of enumTypes) {
    console.log(`[migrate] Resetting enum type: ${enumName}`)
    const usages = enumUsages.get(enumName) || []

    // Step 1: Convert columns to TEXT
    for (const { table, column } of usages) {
      await client.query(
        `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE TEXT USING "${column}"::TEXT`
      )
      console.log(`  Converted ${table}.${column} to TEXT`)
    }

    // Step 2: Drop the enum type
    await client.query(`DROP TYPE IF EXISTS "${enumName}" CASCADE`)
    console.log(`  Dropped enum ${enumName}`)

    // Step 3: Fix data — rename old values and null out anything invalid
    const validValues = expectedEnumValues[enumName]
    if (validValues) {
      for (const { table, column } of usages) {
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
    } else {
      // For version tables or other enums we don't have a map for,
      // find the base enum name and use those values
      console.log(`  No expected values mapped for ${enumName} — skipping data cleanup`)
    }
  }

  console.log('[migrate] Phase 1 complete — all enums dropped and data cleaned.')
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
await payload.destroy()
process.exit(0)
