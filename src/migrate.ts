import { getPayload } from 'payload'
import config from './payload.config.ts'

const payload = await getPayload({ config })
const adapter = payload.db as any

// Push schema to create/sync all tables directly via Drizzle Kit.
// pushDevSchema() has a cache + interactive prompts that break in CI,
// so we call pushSchema() ourselves and force-apply.
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
