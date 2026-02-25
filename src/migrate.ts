import { getPayload } from 'payload'
import { pushDevSchema } from '@payloadcms/drizzle'
import config from './payload.config.ts'

const payload = await getPayload({ config })

// Push schema to create/sync all tables (works in production unlike push config flag).
// This is safe for a fresh project; once the schema stabilises, replace with proper migrations.
await pushDevSchema(payload.db)

await payload.db.migrate()
await payload.destroy()
process.exit(0)
