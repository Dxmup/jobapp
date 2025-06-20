import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("Starting basic test...")

    const apiKey = process.env.GOOGLE_AI_API_KEY
    console.log("API key found:", !!apiKey)

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "No API key found",
      })
    }

    // Just return success without trying to use @google/genai
    return NextResponse.json({
      success: true,
      message: "Basic test passed - API key is accessible",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Basic test error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    })
  }
}
