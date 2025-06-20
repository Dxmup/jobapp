// Simple in-memory rate limiting (for development)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  action: string,
  maxRequests = 10, // Increased from 3 to 10
  windowMs: number = 5 * 60 * 1000, // Reduced from 10 to 5 minutes
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
    console.log(`Rate limit exceeded for ${key}: ${entry.count}/${maxRequests}`)
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

// Add a function to clear rate limits for debugging
export function clearRateLimit(identifier: string, action: string) {
  const key = `${identifier}:${action}`
  rateLimitMap.delete(key)
  console.log(`Cleared rate limit for ${key}`)
}
