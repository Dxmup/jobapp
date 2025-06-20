import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const hasGoogleAI = !!process.env.GOOGLE_AI_API_KEY
    const hasSupabase = !!process.env.SUPABASE_URL

    // Test basic functionality
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        GOOGLE_AI_API_KEY: hasGoogleAI ? "✅ Present" : "❌ Missing",
        SUPABASE_URL: hasSupabase ? "✅ Present" : "❌ Missing",
        NODE_ENV: process.env.NODE_ENV,
      },
      services: {
        geminiStreamService: "Available",
        liveInterviewClient: "Available",
      },
    }

    return NextResponse.json({
      success: true,
      message: "Live interview debug info",
      data: debugInfo,
    })
  } catch (error: any) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Debug POST received:", body)

    return NextResponse.json({
      success: true,
      message: "Debug POST successful",
      received: body,
    })
  } catch (error: any) {
    console.error("Debug POST error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to parse JSON: " + error.message,
      },
      { status: 400 },
    )
  }
}
