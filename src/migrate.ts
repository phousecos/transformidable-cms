import { getPayload } from 'payload'
import config from './payload.config.ts'

const payload = await getPayload({ config })
const adapter = payload.db as any

// Push schema to create/sync all tables directly via Drizzle Kit.
// pushDevSchema() has a cache + interactive prompts that break in CI,
// so we call pushSchema() ourselves and force-apply.
// Log existing enum types and their values for debugging
try {
  const { sql } = await import('drizzle-orm')
  const enumInfo = await adapter.drizzle.execute(sql.raw(`
    SELECT t.typname AS enum_name, e.enumlabel AS enum_value
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    ORDER BY t.typname, e.enumsortorder
  `))
  console.log('[migrate] Current DB enums:', JSON.stringify(enumInfo.rows ?? enumInfo, null, 2))
} catch (e: any) {
  console.log('[migrate] Could not read enums:', e.message)
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

// Log the SQL statements drizzle-kit will execute
console.log('[migrate] Statements to apply:', JSON.stringify(statements, null, 2))

await apply()
console.log('[migrate] Schema push complete.')

// Run any pending migration files
await payload.db.migrate()

await payload.destroy()
process.exit(0)
