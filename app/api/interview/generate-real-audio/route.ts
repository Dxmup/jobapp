import { type NextRequest, NextResponse } from "next/server"
import { generateSpeechWithLiveAPI } from "@/lib/gemini-live-client"

export async function POST(request: NextRequest) {
  try {
    const { text, voice = "Kore", tone = "professional" } = await request.json()

    if (!text) {
      return NextResponse.json({ success: false, error: "Text is required" }, { status: 400 })
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json({ success: false, error: "Google AI API key not configured" }, { status: 500 })
    }

    console.log(`🎙️ Generating Live API audio for: "${text.substring(0, 100)}..."`)

    const audioData = await generateSpeechWithLiveAPI(text, process.env.GOOGLE_AI_API_KEY, voice)

    console.log(`✅ Generated audio data: ${audioData.length} characters`)

    return NextResponse.json({
      success: true,
      audioData: audioData,
      voice: voice,
      tone: tone,
      model: "gemini-2.0-flash-live-001",
    })
  } catch (error: any) {
    console.error("❌ Error generating Live API audio:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
