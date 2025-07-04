// Simple in-memory rate limiting for demo purposes
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  key: string,
  identifier: string,
  maxRequests: number,
  windowMs: number,
): { success: boolean; resetTime?: number } {
  const now = Date.now()
  const rateLimitKey = `${identifier}_${key}`

  const record = rateLimitStore.get(rateLimitKey)

  if (!record || now > record.resetTime) {
    // Create new record or reset expired one
    rateLimitStore.set(rateLimitKey, {
      count: 1,
      resetTime: now + windowMs,
    })
    return { success: true }
  }

  if (record.count >= maxRequests) {
    return { success: false, resetTime: record.resetTime }
  }

  record.count++
  return { success: true }
}
