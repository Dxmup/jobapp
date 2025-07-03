import type { NextRequest } from "next/server"
import { rateLimit } from "./rate-limit"

// Input validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export function sanitizeInput(input: string, maxLength = 1000): string {
  if (typeof input !== "string") return ""
  return input.trim().slice(0, maxLength)
}

export function validateJobDescription(description: string): { valid: boolean; error?: string } {
  if (!description || typeof description !== "string") {
    return { valid: false, error: "Job description is required" }
  }

  const trimmed = description.trim()
  if (trimmed.length < 20) {
    return { valid: false, error: "Job description must be at least 20 characters" }
  }

  if (trimmed.length > 10000) {
    return { valid: false, error: "Job description must be less than 10,000 characters" }
  }

  return { valid: true }
}

export function validateResumeContent(content: string): { valid: boolean; error?: string } {
  if (!content || typeof content !== "string") {
    return { valid: false, error: "Resume content is required" }
  }

  const trimmed = content.trim()
  if (trimmed.length < 50) {
    return { valid: false, error: "Resume content must be at least 50 characters" }
  }

  if (trimmed.length > 15000) {
    return { valid: false, error: "Resume content must be less than 15,000 characters" }
  }

  return { valid: true }
}

// Get client IP for rate limiting
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const ip = forwarded ? forwarded.split(",")[0] : realIP || "127.0.0.1"
  return ip.trim()
}

// Enhanced rate limiting with different tiers
export function checkEnhancedRateLimit(
  identifier: string,
  action: string,
  tier: "strict" | "moderate" | "lenient" = "moderate",
): { success: boolean; remaining: number; resetTime: number } {
  const limits = {
    strict: { requests: 2, window: 15 * 60 * 1000 }, // 2 requests per 15 minutes
    moderate: { requests: 3, window: 10 * 60 * 1000 }, // 3 requests per 10 minutes
    lenient: { requests: 5, window: 5 * 60 * 1000 }, // 5 requests per 5 minutes
  }

  const { requests, window } = limits[tier]
  return rateLimit.checkRateLimit(identifier, action, requests, window)
}

// Detect potential abuse patterns
export function detectAbusePatterns(content: string): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = []

  // Check for repeated characters (potential spam)
  if (/(.)\1{10,}/.test(content)) {
    reasons.push("Repeated characters detected")
  }

  // Check for excessive special characters
  const specialCharCount = (content.match(/[^a-zA-Z0-9\s]/g) || []).length
  if (specialCharCount > content.length * 0.3) {
    reasons.push("Excessive special characters")
  }

  // Check for potential injection attempts
  const suspiciousPatterns = [
    /script\s*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<\s*iframe/i,
    /union\s+select/i,
    /drop\s+table/i,
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      reasons.push("Suspicious code patterns detected")
      break
    }
  }

  return {
    suspicious: reasons.length > 0,
    reasons,
  }
}
