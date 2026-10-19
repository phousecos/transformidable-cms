// Bindings this app adds on top of the ones @opennextjs/cloudflare declares.
// Keep in step with wrangler.jsonc.
import type { r2Storage } from '@payloadcms/storage-r2'

type R2Bucket = Parameters<typeof r2Storage>[0]['bucket']

declare global {
  interface CloudflareEnv {
    HYPERDRIVE?: { connectionString: string }
    MEDIA_BUCKET?: R2Bucket
  }
}

export {}
