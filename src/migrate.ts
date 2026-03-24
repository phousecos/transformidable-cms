import { getPayload } from 'payload'
import { sql } from 'drizzle-orm'
import config from './payload.config.ts'

const payload = await getPayload({ config })
const adapter = payload.db as any

// Push schema to create/sync all tables directly via Drizzle Kit.
// pushDevSchema() has a cache + interactive prompts that break in CI,
// so we call pushSchema() ourselves and force-apply.
// Rename old syndicateTo enum values (without .com) to new values (with .com)
// PostgreSQL cannot alter enums via pushSchema when existing rows use old values.
const enumRenames = [
  ['jerribland', 'jerribland.com'],
  ['unlimitedpowerhouse', 'unlimitedpowerhouse.com'],
  ['agentpmo', 'agentpmo.com'],
  ['prept', 'prept.com'],
  ['lumynr', 'lumynr.com'],
  ['vettersgroup', 'vettersgroup.com'],
]
const enumTypes = [
  'enum_articles_syndicate_to',
  'enum_podcast_episodes_syndicate_to',
]
for (const enumType of enumTypes) {
  for (const [oldVal, newVal] of enumRenames) {
    try {
      await adapter.drizzle.execute(
        sql.raw(`ALTER TYPE "${enumType}" RENAME VALUE '${oldVal}' TO '${newVal}'`),
      )
      console.log(`[migrate] Renamed ${enumType}: ${oldVal} → ${newVal}`)
    } catch (e: any) {
      // Ignore if the old value doesn't exist (already renamed or fresh DB)
      if (!e.message?.includes('does not exist')) throw e
    }
  }
}

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
