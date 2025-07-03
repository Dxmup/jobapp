/**
 * Deployment Verification Script
 * Run this after deployment to verify all systems are working
 */

interface VerificationResult {
  service: string
  status: "success" | "error" | "warning"
  message: string
}

async function verifyDeployment(baseUrl: string): Promise<VerificationResult[]> {
  const results: VerificationResult[] = []

  // Test basic connectivity
  try {
    const response = await fetch(`${baseUrl}/api/debug/session`)
    results.push({
      service: "API Connectivity",
      status: response.ok ? "success" : "error",
      message: response.ok ? "API is responding" : `HTTP ${response.status}`,
    })
  } catch (error) {
    results.push({
      service: "API Connectivity",
      status: "error",
      message: "Failed to connect to API",
    })
  }

  // Test database connection
  try {
    const response = await fetch(`${baseUrl}/api/debug/direct-query`)
    const data = await response.json()
    results.push({
      service: "Database",
      status: data.success ? "success" : "error",
      message: data.success ? "Database connected" : data.error,
    })
  } catch (error) {
    results.push({
      service: "Database",
      status: "error",
      message: "Database connection failed",
    })
  }

  // Test Stripe configuration
  try {
    const response = await fetch(`${baseUrl}/api/stripe/subscription`)
    results.push({
      service: "Stripe",
      status: response.status === 401 ? "success" : "warning",
      message: response.status === 401 ? "Stripe configured (auth required)" : "Check Stripe configuration",
    })
  } catch (error) {
    results.push({
      service: "Stripe",
      status: "warning",
      message: "Stripe configuration needs verification",
    })
  }

  return results
}

// Usage example:
// verifyDeployment('https://your-app.vercel.app').then(console.log);

export { verifyDeployment }
