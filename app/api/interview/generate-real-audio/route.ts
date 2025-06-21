import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, voice = "Kore", tone = "professional" } = await request.json()

    if (!text) {
      return NextResponse.json({ success: false, error: "Text is required" }, { status: 400 })
    }

    console.log(`🎙️ Generating speech for: "${text.substring(0, 100)}..."`)

    // Use Gemini Live API for speech generation
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1alpha/models/gemini-2.0-flash-exp:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GOOGLE_AI_API_KEY}`,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Please convert this text to speech with a ${tone} tone: "${text}"`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          systemInstruction: {
            parts: [
              {
                text: `You are a professional interviewer with a ${tone} tone. Speak clearly and at a moderate pace suitable for an interview setting.`,
              },
            ],
          },
        }),
      },
    )

    if (!response.ok) {
      console.error("❌ Gemini API error:", response.status, response.statusText)
      // Fallback to Web Speech API
      return NextResponse.json({
        success: true,
        audioData: null, // Signal to use client-side TTS
        text: text,
        voice,
        tone,
        fallback: true,
      })
    }

    const data = await response.json()

    // For now, return the text for client-side TTS since Gemini doesn't directly return audio
    // In a real implementation, you'd need to use a TTS service that returns audio
    return NextResponse.json({
      success: true,
      audioData: null, // Signal to use client-side TTS
      text: text,
      voice,
      tone,
      fallback: true,
    })
  } catch (error: any) {
    console.error("❌ Error generating audio:", error)

    // Return fallback response
    return NextResponse.json({
      success: true,
      audioData: null,
      text: await request
        .json()
        .then((body) => body.text)
        .catch(() => "Interview question"),
      voice: "Kore",
      tone: "professional",
      fallback: true,
    })
  }
}
