import { NextResponse } from "next/server"

export async function POST() {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "GOOGLE_AI_API_KEY not found in environment variables",
        },
        { status: 500 },
      )
    }

    // Simple test without the full GeminiStreamService
    return NextResponse.json({
      success: true,
      message: "API key found, basic test passed",
      keyLength: apiKey.length,
    })
  } catch (error: any) {
    console.error("Simple Gemini test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
