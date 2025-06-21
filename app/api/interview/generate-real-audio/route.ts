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

    console.log(`🎙️ Generating Live API audio for: "${text.substring(0, 100)}..."`)

    // Import the Google GenAI library dynamically
    const { GoogleGenAI, Modality } = await import("@google/genai")

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY })
    const model = "gemini-2.0-flash-live-001"
    const config = {
      responseModalities: [Modality.AUDIO],
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: voice,
        },
      },
      speechConfig: {
        languageCode: "en-US",
      },
    }

    // Create a promise to handle the Live API session
    const audioData = await new Promise<string>((resolve, reject) => {
      const responseQueue: any[] = []
      const audioChunks: string[] = []

      const session = ai.live.connect({
        model: model,
        callbacks: {
          onopen: () => {
            console.log("✅ Live API session opened")
            // Send the text to be converted to speech
            session.sendClientContent({
              turns: [
                {
                  role: "user",
                  parts: [{ text: text }],
                },
              ],
              turnComplete: true,
            })
          },
          onmessage: (message: any) => {
            console.log("📨 Received message:", message.type || "unknown")
            responseQueue.push(message)

            // Check for audio data
            if (message.data) {
              audioChunks.push(message.data)
            }

            // Check if turn is complete
            if (message.serverContent && message.serverContent.turnComplete) {
              console.log("✅ Turn complete, combining audio chunks")
              const combinedAudio = audioChunks.join("")
              session.close()
              resolve(combinedAudio)
            }
          },
          onerror: (e: any) => {
            console.error("❌ Live API error:", e.message)
            session.close()
            reject(new Error(`Live API error: ${e.message}`))
          },
          onclose: (e: any) => {
            console.log("🔚 Live API session closed:", e.reason)
            if (audioChunks.length === 0) {
              reject(new Error("No audio data received"))
            }
          },
        },
        config: config,
      })

      // Set a timeout to prevent hanging
      setTimeout(() => {
        if (audioChunks.length === 0) {
          session.close()
          reject(new Error("Timeout waiting for audio response"))
        }
      }, 30000) // 30 second timeout
    })

    console.log(`✅ Generated audio data: ${audioData.length} characters`)

    return NextResponse.json({
      success: true,
      audioData: audioData,
      voice: voice,
      tone: tone,
      model: model,
    })
  } catch (error: any) {
    console.error("❌ Error generating Live API audio:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
