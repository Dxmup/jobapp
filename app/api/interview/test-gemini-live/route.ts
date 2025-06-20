import { NextRequest, NextResponse } from "next/server"
import { GeminiStreamService } from "@/lib/gemini-stream-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testType = "basic", voice = "Kore" } = body

    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "API key not configured" }, { status: 500 })
    }

    const service = new GeminiStreamService(
      apiKey,
      {
        job: { title: "Test", company: "Test" },
        questions: { technical: [], behavioral: [] },
        voice,
      },
    )

    await service.startSession()
    service.sendText(`This is a ${testType} test of the Gemini Live API.`)
    await new Promise((r) => setTimeout(r, 1000))
    service.close()

    return NextResponse.json({ success: true, message: "Gemini Live API test completed" })
  } catch (error: any) {
    console.error("test-gemini-live error:", error)
    return NextResponse.json({ success: false, error: error.message || "Unknown error" }, { status: 500 })
  }
}
