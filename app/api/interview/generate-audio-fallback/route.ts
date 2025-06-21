import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, voice = "Kore", tone = "professional" } = await request.json()

    if (!text) {
      return NextResponse.json({ success: false, error: "Text is required" }, { status: 400 })
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json({ success: false, error: "Google AI API key not configured" }, { status: 500 })
    }

    console.log(`🎙️ Generating fallback audio for: "${text.substring(0, 100)}..."`)

    // Use standard Gemini API to generate a response, then convert to audio client-side
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `As a professional interviewer, please acknowledge this question and indicate you're ready to hear the candidate's response: "${text}"`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 1,
            topP: 1,
            maxOutputTokens: 100,
          },
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || text

    // For now, return the text with instructions to use client-side audio generation
    // This is a temporary fallback until Live API is properly configured
    return NextResponse.json({
      success: true,
      audioData: null, // No audio data, will use client-side generation
      text: generatedText,
      originalText: text,
      voice: voice,
      tone: tone,
      fallback: true,
    })
  } catch (error: any) {
    console.error("❌ Error generating fallback audio:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
