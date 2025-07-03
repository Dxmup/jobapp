// Enhanced rate limiting with persistence and cleanup
interface RateLimitEntry {
  count: number
  resetTime: number
  firstRequest: number
}

class RateLimitManager {
  private rateLimitMap = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup()
      },
      5 * 60 * 1000,
    )
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.rateLimitMap.entries()) {
      if (now > entry.resetTime) {
        this.rateLimitMap.delete(key)
      }
    }
  }

  checkRateLimit(
    identifier: string,
    action: string,
    maxRequests = 3,
    windowMs: number = 10 * 60 * 1000,
  ): { success: boolean; remaining: number; resetTime: number } {
    const key = `${identifier}:${action}`
    const now = Date.now()

    let entry = this.rateLimitMap.get(key)

    // Reset if window has expired
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
        firstRequest: now,
      }
    }

    // Check if limit exceeded
    if (entry.count >= maxRequests) {
      this.rateLimitMap.set(key, entry)
      return {
        success: false,
        remaining: 0,
        resetTime: entry.resetTime,
      }
    }

    // Increment count
    entry.count++
    this.rateLimitMap.set(key, entry)

    return {
      success: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime,
    }
  }

  // Get current usage for monitoring
  getCurrentUsage(identifier: string, action: string): { count: number; resetTime: number } | null {
    const key = `${identifier}:${action}`
    const entry = this.rateLimitMap.get(key)

    if (!entry || Date.now() > entry.resetTime) {
      return null
    }

    return {
      count: entry.count,
      resetTime: entry.resetTime,
    }
  }
}

export const rateLimit = new RateLimitManager()

export function checkRateLimit(
  identifier: string,
  action: string,
  maxRequests = 3,
  windowMs: number = 10 * 60 * 1000,
): { success: boolean; remaining: number; resetTime: number } {
  return rateLimit.checkRateLimit(identifier, action, maxRequests, windowMs)
}
