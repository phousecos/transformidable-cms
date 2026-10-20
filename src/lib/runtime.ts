// True inside the Cloudflare Workers runtime (production on Cloudflare, and
// `wrangler dev`), false under Node: `next dev`, builds, and tsx scripts.
export const isWorkers =
  typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers'
