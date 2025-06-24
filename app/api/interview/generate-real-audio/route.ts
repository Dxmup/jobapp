import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, voice, tone, jobContext, resumeContext } = await request.json()

    console.log("🎵 Generating real audio for interview")
    console.log(`📝 Text length: ${text?.length || 0}`)
    console.log(`🎤 Voice: ${voice}`)
    console.log(`🎭 Candidate name from resumeContext: "${resumeContext?.name || "not provided"}"`)

    if (!text) {
      return NextResponse.json({ success: false, error: "Text is required" }, { status: 400 })
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json({ success: false, error: "Google AI API key not configured" }, { status: 500 })
    }

    // Extract candidate name for use in prompts
    const candidateName = resumeContext?.name || "the candidate"
    console.log(`👤 Using candidate name in prompts: "${candidateName}"`)

    // The text already contains the full prompt from the client
    // We just need to send it to Gemini to generate the audio
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GOOGLE_AI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: text, // The prompt already includes candidate name context
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
            responseMimeType: "audio/wav",
            responseSchema: {
              type: "object",
              properties: {
                audioData: {
                  type: "string",
                  description: "Base64 encoded audio data",
                },
              },
            },
          },
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Gemini API error:", errorText)
      return NextResponse.json(
        { success: false, error: `Gemini API error: ${response.status}` },
        { status: response.status },
      )
    }

    const data = await response.json()

    if (!data.candidates?.[0]?.content?.parts?.[0]) {
      console.error("❌ Invalid Gemini response structure:", data)
      return NextResponse.json({ success: false, error: "Invalid response from Gemini API" }, { status: 500 })
    }

    // Extract audio data from response
    const audioContent = data.candidates[0].content.parts[0]
    let audioData = null

    if (audioContent.text) {
      // If we get text response, we need to convert it to audio
      // For now, return an error as we expect audio
      console.error("❌ Received text instead of audio from Gemini")
      return NextResponse.json(
        { success: false, error: "Received text instead of audio from Gemini API" },
        { status: 500 },
      )
    } else if (audioContent.inlineData) {
      audioData = audioContent.inlineData.data
    }

    if (!audioData) {
      console.error("❌ No audio data in Gemini response")
      return NextResponse.json({ success: false, error: "No audio data received from Gemini API" }, { status: 500 })
    }

    console.log(`✅ Audio generated successfully (${audioData.length} chars)`)

    return NextResponse.json({
      success: true,
      audioData: audioData,
      candidateName: candidateName, // Include for debugging
    })
  } catch (error: any) {
    console.error("❌ Error generating audio:", error)
    return NextResponse.json({ success: false, error: `Failed to generate audio: ${error.message}` }, { status: 500 })
  }
}
