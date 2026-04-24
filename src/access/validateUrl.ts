// Reject URLs that aren't http(s). This is a defense-in-depth measure: a
// hostile or compromised admin could otherwise plant `javascript:`,
// `data:`, or `vbscript:` URLs in editor fields like `bookshop_url` or
// `cta_url`, which then get rendered into <a href> on the public site and
// execute on click as stored XSS.
export const validateHttpUrl = (value: unknown): true | string => {
  if (value === null || value === undefined || value === '') return true
  if (typeof value !== 'string') return 'URL must be a string'
  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    return 'Must be an absolute URL (e.g. https://example.com/path)'
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return 'URL must use http:// or https://'
  }
  return true
}
