import { defineCloudflareConfig } from '@opennextjs/cloudflare'

// No incremental cache: every content page is rendered on demand
// (force-dynamic), and the few static pages ship as build output.
export default defineCloudflareConfig({})
