// Shared formatting helpers for the research frontend. No React — safe to
// import from server components and route handlers alike.

export const TYPE_LABELS: Record<string, string> = {
  "governance-file": "Governance File",
  "transformidable-brief": "The Transformidable Brief",
  "article": "Article",
  "white-paper": "White Paper",
  "annual-report": "Annual Report",
}

// The plural section labels the Publications sub-nav and index filter by.
export const TYPE_PLURALS: Record<string, string> = {
  "governance-file": "The Governance Files",
  "transformidable-brief": "The Transformidable Brief",
  "article": "Articles",
  "white-paper": "White Papers",
  "annual-report": "Annual Reports",
}

// Turn a YouTube/Vimeo watch link into an embeddable URL. Returns null if the
// URL isn't a recognized video host.
export function videoEmbedUrl(url: unknown): string | null {
  if (typeof url !== "string" || !url) return null
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, "")
    if (host === "youtu.be") {
      const id = u.pathname.slice(1)
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v")
        return id ? `https://www.youtube.com/embed/${id}` : null
      }
      if (u.pathname.startsWith("/embed/")) return url
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0]
      return /^\d+$/.test(id || "") ? `https://player.vimeo.com/video/${id}` : null
    }
    if (host === "player.vimeo.com") return url
  } catch {
    return null
  }
  return null
}

export function monthYear(d: unknown): string {
  if (!d) return ""
  const date = new Date(d as string)
  if (isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

export function fullDate(d: unknown): string {
  if (!d) return ""
  const date = new Date(d as string)
  if (isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

export function caseNo(n: unknown): string {
  if (n == null) return ""
  return `No. ${String(n).padStart(3, "0")}`
}

// The meta line under a publication in listings. `withDate` forces the date
// in even when other markers exist (used on detail pages).
export function pubMeta(p: any, withDate = false): string[] {
  const meta: string[] = []
  if (p?.type === "governance-file") meta.push("The Governance Files")
  if (p?.type === "transformidable-brief") meta.push("The Transformidable Brief")
  if (videoEmbedUrl(p?.videoUrl)) meta.push("Video")
  if (p?.seriesLabel) meta.push(p.seriesLabel)
  if (p?.peerReviewed) meta.push("Peer-reviewed")
  if (p?.pageCount) meta.push(`${p.pageCount} pp`)
  if (p?.readTime) meta.push(`${p.readTime} min`)
  const d = monthYear(p?.publishedAt)
  if (d && (withDate || p?.type === "annual-report" || meta.length === 0)) meta.push(d)
  return meta
}
