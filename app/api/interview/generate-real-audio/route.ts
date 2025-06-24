import { NextResponse } from "next/server"
import { generateSpeechWithWebSocket } from "@/lib/gemini-live-websocket"

export async function POST(request: Request) {
  try {
    const { text, voice = "Kore", tone = "professional" } = await request.json()

    // Create abort controller for this request
    const controller = new AbortController()

    // Handle client disconnect/abort
    request.signal?.addEventListener("abort", () => {
      console.log("🚫 Client aborted audio generation request")
      controller.abort()
    })

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json({ success: false, error: "Google AI API key not configured" }, { status: 500 })
    }

    console.log(`🎵 Generating audio with voice: ${voice}`)

    const audioData = await generateSpeechWithWebSocket(text, process.env.GOOGLE_AI_API_KEY, voice)

    // Check if request was aborted during generation
    if (controller.signal.aborted) {
      console.log("🚫 Audio generation was aborted")
      return NextResponse.json({ success: false, error: "Request aborted" }, { status: 499 })
    }

    if (!audioData || audioData.length === 0) {
      throw new Error("No audio data received from Gemini Live API")
    }

    console.log(`✅ Audio generated successfully: ${audioData.length} characters`)

    return NextResponse.json({
      success: true,
      audioData: audioData,
      voice: voice,
      format: "base64-encoded PCM audio",
    })
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("🚫 Audio generation request was aborted")
      return NextResponse.json({ success: false, error: "Request aborted" }, { status: 499 })
    }

    console.error("❌ Audio generation failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate audio",
      },
      { status: 500 },
    )
  }
}
