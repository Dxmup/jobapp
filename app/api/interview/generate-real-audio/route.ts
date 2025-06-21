import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, voice = "Kore", tone = "professional" } = await request.json()

    if (!text) {
      return NextResponse.json({ success: false, error: "Text is required" }, { status: 400 })
    }

    console.log(`🎙️ Processing speech request for: "${text.substring(0, 100)}..."`)

    // For now, we'll use client-side Web Speech API since it's more reliable
    // In the future, you can integrate with Gemini Live API or other TTS services

    // Check if we have a valid API key
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.log("⚠️ No Google AI API key found, using Web Speech API fallback")
      return NextResponse.json({
        success: true,
        audioData: null, // Signal to use client-side TTS
        text: text,
        voice,
        tone,
        fallback: true,
        reason: "No API key configured",
      })
    }

    // Try Gemini API with correct authentication
    try {
      const geminiResponse = await fetch(
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
                    text: `You are a professional interviewer. Please acknowledge that you will ask this interview question with a ${tone} tone: "${text}"`,
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

      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json()
        console.log("✅ Gemini API response received")

        // Even with Gemini response, we'll use Web Speech API for actual audio
        return NextResponse.json({
          success: true,
          audioData: null, // Use client-side TTS
          text: text,
          voice,
          tone,
          fallback: true,
          geminiResponse: geminiData.candidates?.[0]?.content?.parts?.[0]?.text,
        })
      } else {
        console.log(`⚠️ Gemini API returned ${geminiResponse.status}, using fallback`)
      }
    } catch (geminiError: any) {
      console.log("⚠️ Gemini API error, using Web Speech API fallback:", geminiError.message)
    }

    // Always return success with Web Speech API fallback
    return NextResponse.json({
      success: true,
      audioData: null, // Signal to use client-side TTS
      text: text,
      voice,
      tone,
      fallback: true,
      reason: "Using Web Speech API for reliable audio generation",
    })
  } catch (error: any) {
    console.error("❌ Error in generate-real-audio:", error)

    // Even on error, return a fallback response
    return NextResponse.json({
      success: true,
      audioData: null,
      text: "I'm ready to begin the interview. Let's start with your first question.",
      voice: "Kore",
      tone: "professional",
      fallback: true,
      error: error.message,
    })
  }
}
