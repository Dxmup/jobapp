#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Run this after deployment to verify all systems are working
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

async function checkEndpoint(path: string, description: string) {
  try {
    const response = await fetch(`${SITE_URL}${path}`)
    const status = response.status
    console.log(`✅ ${description}: ${status}`)
    return status < 400
  } catch (error) {
    console.log(`❌ ${description}: Failed - ${error.message}`)
    return false
  }
}

async function verifyDeployment() {
  console.log("🚀 Verifying JobCraft AI Deployment...\n")

  const checks = [
    ["/api/health", "Health Check"],
    ["/api/auth/check-session", "Auth System"],
    ["/api/waitlist", "Waitlist API"],
    ["/api/landing/generate-interview-questions", "AI Interview Questions"],
    ["/api/landing/optimize-resume", "AI Resume Optimization"],
    ["/api/landing/generate-cover-letter", "AI Cover Letter Generation"],
  ]

  let passed = 0
  const total = checks.length

  for (const [path, description] of checks) {
    const success = await checkEndpoint(path, description)
    if (success) passed++
  }

  console.log(`\n📊 Results: ${passed}/${total} checks passed`)

  if (passed === total) {
    console.log("🎉 All systems operational! Deployment successful.")
  } else {
    console.log("⚠️  Some systems need attention. Check the logs above.")
  }

  // Check environment variables
  console.log("\n🔧 Environment Variables Check:")
  const requiredEnvs = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "GOOGLE_AI_API_KEY",
  ]

  for (const env of requiredEnvs) {
    const exists = process.env[env] ? "✅" : "❌"
    console.log(`${exists} ${env}`)
  }
}

verifyDeployment().catch(console.error)
