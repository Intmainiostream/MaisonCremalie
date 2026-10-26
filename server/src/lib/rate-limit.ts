// In-memory attempt counters. They reset on restart, which is fine for a single server process.
type Entry = { count: number; resetAt: number }

export type RateLimiter = {
  /** Seconds until the key may try again, or 0 if it isn't locked out. */
  retryAfter: (key: string) => number
  /** Counts one attempt for the key. */
  record: (key: string) => void
  clear: (key: string) => void
}

/** Allows `max` recorded attempts per key within `windowMs`, then locks the key until the window ends. */
export function createRateLimiter({ windowMs, max }: { windowMs: number; max: number }): RateLimiter {
  const entries = new Map<string, Entry>()

  function activeEntry(key: string, now: number): Entry | undefined {
    const entry = entries.get(key)
    if (entry && entry.resetAt <= now) {
      entries.delete(key)
      return undefined
    }
    return entry
  }

  // Drop expired entries now and then so the map can't grow forever.
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of entries) if (entry.resetAt <= now) entries.delete(key)
  }, windowMs).unref()

  return {
    retryAfter(key) {
      const now = Date.now()
      const entry = activeEntry(key, now)
      if (!entry || entry.count < max) return 0
      return Math.ceil((entry.resetAt - now) / 1000)
    },
    record(key) {
      const now = Date.now()
      const entry = activeEntry(key, now)
      if (entry) entry.count += 1
      else entries.set(key, { count: 1, resetAt: now + windowMs })
    },
    clear(key) {
      entries.delete(key)
    },
  }
}

const FIFTEEN_MINUTES = 15 * 60 * 1000

/** Failed logins per IP + email. */
export const loginLimiter = createRateLimiter({ windowMs: FIFTEEN_MINUTES, max: 10 })

export function attemptKey(ip: string | undefined, email: string): string {
  return `${ip ?? 'unknown'}|${email}`
}
