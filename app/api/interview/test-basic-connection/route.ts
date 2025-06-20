import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testMessage = "Hello from basic test" } = body

    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "API key not configured",
          details: "GOOGLE_AI_API_KEY environment variable is missing",
        },
        { status: 500 },
      )
    }

    // Test basic functionality without external packages
    return NextResponse.json({
      success: true,
      message: "Basic connection test successful",
      testMessage,
      hasApiKey: true,
      keyLength: apiKey.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Basic connection test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unknown error",
        stack: error?.stack,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
