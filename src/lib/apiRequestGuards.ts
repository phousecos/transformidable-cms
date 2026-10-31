import type { NextRequest } from 'next/server'
import { isWorkers } from './runtime.ts'

// Shared helpers for public-facing API routes (case-follow, case-submit,
// contact, subscribe).

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const MAX_EMAIL_LEN = 254 // RFC 5321

// The visitor's IP, from whichever header the host sets and a client can't
// forge. On Cloudflare that is cf-connecting-ip. It is only trusted there:
// anywhere else a client could send it themselves to dodge the rate limits.
// Without a match every visitor would be 'unknown' and share one limit.
export function getClientIp(req: NextRequest): string {
  if (isWorkers) {
    const cfIp = req.headers.get('cf-connecting-ip')
    if (cfIp) return cfIp
  }
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

// Spam checks shared by every public form. Each form carries two extra
// fields, added by the useSpamTrap hook on the client:
//   company_website  a field hidden from people; bots tend to fill it.
//   form_elapsed_ms  how long the form was open before it was sent.
// 'bot' means drop it silently: answer as if it worked, save and send
// nothing, so the sender has no signal to adapt to. That covers a filled
// trap and a missing timer, which means the post didn't come from our page.
// 'too-fast' is a timer under the minimum. That could be a person with
// autofill, so they get an error asking them to try again, not a fake success.
export const SPAM_TRAP_FIELD = 'company_website'
export const SPAM_TIMER_FIELD = 'form_elapsed_ms'
export const MIN_FORM_FILL_MS = 3000
export const TOO_FAST_MESSAGE = 'That was quick. Please wait a moment and try again.'

export type SpamVerdict = 'ok' | 'bot' | 'too-fast'

export function checkSpam(get: (key: string) => unknown): SpamVerdict {
  const trap = get(SPAM_TRAP_FIELD)
  if (typeof trap === 'string' && trap.trim()) return 'bot'
  const raw = get(SPAM_TIMER_FIELD)
  const elapsed = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN
  if (!Number.isFinite(elapsed) || elapsed <= 0) return 'bot'
  if (elapsed < MIN_FORM_FILL_MS) return 'too-fast'
  return 'ok'
}
