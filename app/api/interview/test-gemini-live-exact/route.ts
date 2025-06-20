import { NextRequest, NextResponse } from "next/server"
import { GeminiStreamService } from "@/lib/gemini-stream-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { voice = "Kore" } = body

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
      { onAudio: (d) => audioChunks.push(d) },
    )

    await service.startSession()
    service.sendText("Exact format check")
    await new Promise((r) => setTimeout(r, 1500))
    service.close()

    return NextResponse.json({
      success: true,
      message: "Exact format data retrieved",
      audioSize: audioChunks.reduce((a, c) => a + c.length, 0),
    })
  } catch (error: any) {
    console.error("test-gemini-live-exact error:", error)
    return NextResponse.json({ success: false, error: error.message || "Unknown error" }, { status: 500 })
  }
}
