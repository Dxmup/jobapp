import { type NextRequest, NextResponse } from "next/server"
import { GeminiStreamService } from "@/lib/native-gemini-stream-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, voice = "Kore" } = body

    if (!text) {
      return NextResponse.json({ success: false, error: "Text is required" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "API key not configured" }, { status: 500 })
    }

    const audioChunks: string[] = []
    const service = new GeminiStreamService(
      apiKey,
      {
        job: { title: "Test", company: "Test" },
        questions: { technical: [], behavioral: [] },
        voice,
      },
      {
        onAudio: (data) => audioChunks.push(data),
      },
    )

    await service.startSession()
    service.sendText(text)

    // Wait briefly to allow audio to stream
    await new Promise((r) => setTimeout(r, 2000))

    service.close()

    return NextResponse.json({
      success: true,
      message: "Audio generated via Gemini Live API",
      audioData: audioChunks.join(""),
      details: { chunksReceived: audioChunks.length },
    })
  } catch (error: any) {
    console.error("generate-real-audio error:", error)
    return NextResponse.json({ success: false, error: error.message || "Unknown error" }, { status: 500 })
  }
}
