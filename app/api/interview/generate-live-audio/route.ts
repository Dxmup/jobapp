import { type NextRequest, NextResponse } from "next/server"
import { generateSpeechWithWebSocket } from "@/lib/gemini-live-websocket"

export async function POST(request: NextRequest) {
  try {
    const { text, voice = "Kore" } = await request.json()

    if (!text) {
      return NextResponse.json({ success: false, error: "Text is required" }, { status: 400 })
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error("❌ GOOGLE_AI_API_KEY not found in environment variables")
      return NextResponse.json({ success: false, error: "API key not configured" }, { status: 500 })
    }

    console.log(`🎵 Generating audio using Gemini Live API (${voice} voice)...`)
    console.log(`📝 Text length: ${text.length} characters`)

    const audioData = await generateSpeechWithWebSocket(text, process.env.GOOGLE_AI_API_KEY, voice)

    console.log(`✅ Audio generated successfully: ${audioData.length} characters`)

    return NextResponse.json({
      success: true,
      audioData: audioData,
      voice: voice,
      textLength: text.length,
      audioLength: audioData.length,
    })
  } catch (error: any) {
    console.error("❌ Live API audio generation failed:", error)

    // Check for specific error types
    if (error.message.includes("API key not valid")) {
      return NextResponse.json(
        { success: false, error: "Invalid API key. Please check your Google AI API key configuration." },
        { status: 401 },
      )
    }

    if (error.message.includes("WebSocket")) {
      return NextResponse.json(
        { success: false, error: "WebSocket connection failed. Please try again." },
        { status: 503 },
      )
    }

    if (error.message.includes("aborted")) {
      return NextResponse.json({ success: false, error: "Request was cancelled" }, { status: 499 })
    }

    return NextResponse.json({ success: false, error: `Audio generation failed: ${error.message}` }, { status: 500 })
  }
}
