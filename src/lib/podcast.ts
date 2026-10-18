// Podcast show defaults and helpers, shared by the Podcast Settings global,
// the episode collection, the podcast pages, and the RSS feed.

// Used as the global's default values, and by the feed for any setting not
// yet saved in the admin.
export const PODCAST_DEFAULTS = {
  title: 'Transformidable - The Governance Files',
  description:
    'The Transformidable podcast. Conversations on governance, leadership, and institutional transformation, examined on the record.',
  author: 'Jerri L. Bland, Ed.D.',
  ownerEmail: 'hello@transformidable.media',
  primaryCategory: 'Business|Management',
  secondaryCategory: 'Technology',
  explicit: false,
  language: 'en-us',
}

// Apple Podcasts categories this show could plausibly use, as
// "Category" or "Category|Subcategory". The feed splits on "|" to nest
// <itunes:category> tags. Full list:
// https://podcasters.apple.com/support/1691-apple-podcasts-categories
export const PODCAST_CATEGORIES = [
  'Business|Management',
  'Business|Careers',
  'Business|Entrepreneurship',
  'Business|Non-Profit',
  'Business',
  'Technology',
  'Government',
  'Education',
  'News|Business News',
  'News|Politics',
  'Society & Culture',
].map((value) => ({ label: value.replace('|', ' › '), value }))

// Apple's cover art rules.
export const COVER_ART_MIN = 1400
export const COVER_ART_MAX = 3000

// YouTube video id from any common URL form (watch, youtu.be, embed,
// shorts, live), or null.
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  const host = parsed.hostname.replace(/^(www|m)\./, '')
  let id: string | null = null
  if (host === 'youtu.be') id = parsed.pathname.slice(1)
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id =
      parsed.searchParams.get('v') ||
      parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] ||
      null
  }
  return id && /^[\w-]{11}$/.test(id) ? id : null
}

// "1:02:03", "25:00" or "90" (seconds) → seconds, or null.
export function durationSeconds(value: string | null | undefined): number | null {
  if (!value) return null
  if (!/^\d+(:\d{1,2}){0,2}$/.test(value.trim())) return null
  return value
    .trim()
    .split(':')
    .reduce((total, part) => total * 60 + Number(part), 0)
}
