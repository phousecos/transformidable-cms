import { getPayload } from 'payload'
import config from './payload.config.ts'

const payload = await getPayload({ config })
await payload.db.migrate()
await payload.destroy()
process.exit(0)
