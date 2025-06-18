// Simple in-memory rate limiting (for development)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  action: string,
  maxRequests = 3,
  windowMs: number = 10 * 60 * 1000, // 10 minutes
): { success: boolean; remaining: number; resetTime: number } {
  const key = `${identifier}:${action}`
  const now = Date.now()

  // Get or create rate limit entry
  let entry = rateLimitMap.get(key)

  // Reset if window has expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + windowMs,
    }
  }

  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    rateLimitMap.set(key, entry)
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  // Increment count
  entry.count++
  rateLimitMap.set(key, entry)

  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}
