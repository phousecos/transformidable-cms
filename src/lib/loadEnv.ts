// Load .env into process.env for scripts run outside Next.
//
// Next reads .env itself, so `next dev` and `next build` see it — but `npm run`
// does not, and neither does tsx. A seed or import script started with
// `npm run` therefore sees none of it, and Payload fails with "cannot connect
// to Postgres: no PostgreSQL user name specified in startup packet", which
// names neither .env nor the missing variable. Loading it here makes these
// scripts behave the way the presence of the file implies.
//
// Import this for its side effect, BEFORE importing payload.config:
//
//   import '../lib/loadEnv.ts'
//   import config from '../payload.config.ts'
//
// The order matters. payload.config reads process.env while it is being
// evaluated, and ES module imports run in source order, so a later import
// would already have missed its chance.
import fs from 'fs'
import path from 'path'

export function loadEnv(file = path.resolve(process.cwd(), '.env')): void {
  if (!fs.existsSync(file)) return
  for (const rawLine of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    // Split on the FIRST '=' only: a Postgres URL carries its own
    // (?sslmode=require), and splitting on all of them truncates the value.
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).replace(/^export\s+/, '').trim()
    if (!key) continue
    // A real environment variable wins, so `POSTGRES_URL=... npm run …` still
    // overrides the file rather than being silently replaced by it.
    if (process.env[key] !== undefined) continue
    let value = line.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

loadEnv()
