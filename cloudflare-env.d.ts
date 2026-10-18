// Bindings this app adds on top of the ones @opennextjs/cloudflare declares.
// Keep in step with wrangler.jsonc.
declare global {
  interface CloudflareEnv {
    HYPERDRIVE?: { connectionString: string }
  }
}

export {}
