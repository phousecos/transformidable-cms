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

// Case file sections an episode chapter can point at, by their anchor id on
// the case file page. A chapter tied to a section shows a "Discussed in the
// episode at …" link there.
export const CASE_SECTIONS = [
  { label: 'Overview', value: 'overview' },
  { label: 'Timeline', value: 'timeline' },
  { label: 'Organizations', value: 'organizations' },
  { label: 'Governance Outcomes', value: 'governance-outcomes' },
  { label: 'Documents', value: 'documents' },
  { label: 'Audit Reports', value: 'audit-reports' },
  { label: 'News Coverage', value: 'news-coverage' },
  { label: 'Research Notes', value: 'research-notes' },
  { label: 'Governance Mechanisms', value: 'governance-mechanisms' },
  { label: 'AI Summary', value: 'ai-summary' },
  { label: 'Lessons Learned', value: 'lessons-learned' },
]

const STREAM_HOST = /^customer-[a-z0-9]+\.cloudflarestream\.com$/

export function isStreamHost(value: string | null | undefined): boolean {
  return !!value && STREAM_HOST.test(value.trim())
}

// A Cloudflare Stream video from what an editor pastes: the 32-character
// video ID, or any Stream link containing it. A link on the account's own
// customer-….cloudflarestream.com host also supplies the host; otherwise the
// one saved in Podcast Settings is used.
export function streamVideo(
  value: string | null | undefined,
  defaultHost?: string | null,
): { hls: string; poster: string } | null {
  const uid = value?.match(/\b([a-f0-9]{32})\b/)?.[1]
  if (!uid) return null
  let host = isStreamHost(defaultHost) ? defaultHost!.trim() : null
  try {
    const linked = new URL(value!.trim()).hostname
    if (STREAM_HOST.test(linked)) host = linked
  } catch {
    // Not a link, just the ID.
  }
  if (!host) return null
  return {
    hls: `https://${host}/${uid}/manifest/video.m3u8`,
    poster: `https://${host}/${uid}/thumbnails/thumbnail.jpg?height=720`,
  }
}

export type Chapter = { title: string; start: number; section: string | null }

// An episode's chapters with start times in seconds, in playing order.
export function chapterList(chapters: unknown): Chapter[] {
  if (!Array.isArray(chapters)) return []
  return chapters
    .map((c) => ({
      title: String(c?.title ?? '').trim(),
      start: durationSeconds(c?.start) as number,
      section: c?.caseSection || null,
    }))
    .filter((c) => c.title && c.start !== null)
    .sort((a, b) => a.start - b.start)
}

// Seconds → "6:05" or "1:02:03".
export function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}
