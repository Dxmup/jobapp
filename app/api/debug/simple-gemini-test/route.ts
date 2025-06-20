import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "GOOGLE_AI_API_KEY not found in environment variables",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "API key found, basic test passed",
      keyLength: apiKey.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Simple Gemini test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
