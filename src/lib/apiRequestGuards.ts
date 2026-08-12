import type { NextRequest } from 'next/server'

// Shared helpers for public-facing API routes (case-follow, case-submit).
// Mirrors the pattern established in api/subscribe/route.ts.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const MAX_EMAIL_LEN = 254 // RFC 5321

export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]!.trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

// Per-IP soft rate limiter. In serverless this only protects within a warm
// lambda instance — see api/subscribe/route.ts for the same caveat. Each
// caller gets its own independent counter map.
export function createRateLimiter(max: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>()
  return {
    check(ip: string): boolean {
      const now = Date.now()
      const entry = hits.get(ip)
      if (!entry || entry.resetAt < now) {
        hits.set(ip, { count: 1, resetAt: now + windowMs })
        return true
      }
      if (entry.count >= max) return false
      entry.count++
      return true
    },
  }
}
