// Bindings this app adds on top of the ones @opennextjs/cloudflare declares.
// Keep in step with wrangler.jsonc and wrangler.jlynne.jsonc.
import type { r2Storage } from '@payloadcms/storage-r2'

type R2Bucket = Parameters<typeof r2Storage>[0]['bucket']

declare global {
  interface CloudflareEnv {
    HYPERDRIVE?: { connectionString: string }
    MEDIA_BUCKET?: R2Bucket
    // J. Lynne account only: the old jlynne.io library, read by the one-time
    // import (api/admin/import-jlynne).
    JLYNNE_D1?: { prepare(sql: string): { all(): Promise<{ results: Record<string, unknown>[] }> } }
    JLYNNE_R2?: R2Bucket
  }
}

export {}
