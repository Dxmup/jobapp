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
      const audioChunks: string[] = []
      let session: any = null

      try {
        session = ai.live.connect({
          model: model,
          callbacks: {
            onopen: () => {
              console.log("✅ Live API session opened")
              try {
                // Send the text to be converted to speech using the correct method
                session.send({
                  clientContent: {
                    turns: [
                      {
                        role: "user",
                        parts: [{ text: text }],
                      },
                    ],
                    turnComplete: true,
                  },
                })
              } catch (sendError: any) {
                console.error("❌ Error sending content:", sendError)
                reject(new Error(`Failed to send content: ${sendError.message}`))
              }
            },
            onmessage: (message: any) => {
              console.log("📨 Received message type:", message.type || "unknown")

              // Handle different message types
              if (message.type === "serverContent") {
                if (message.serverContent?.modelTurn?.parts) {
                  for (const part of message.serverContent.modelTurn.parts) {
                    if (part.inlineData && part.inlineData.mimeType === "audio/pcm") {
                      console.log("🔊 Received audio chunk")
                      audioChunks.push(part.inlineData.data)
                    }
                  }
                }

                // Check if turn is complete
                if (message.serverContent?.turnComplete) {
                  console.log("✅ Turn complete, combining audio chunks")
                  const combinedAudio = audioChunks.join("")
                  if (session && typeof session.disconnect === "function") {
                    session.disconnect()
                  }
                  resolve(combinedAudio)
                }
              }
            },
            onerror: (e: any) => {
              console.error("❌ Live API error:", e.message)
              if (session && typeof session.disconnect === "function") {
                session.disconnect()
              }
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
      } catch (connectionError: any) {
        console.error("❌ Failed to connect to Live API:", connectionError)
        reject(new Error(`Connection failed: ${connectionError.message}`))
      }

      // Set a timeout to prevent hanging
      setTimeout(() => {
        if (audioChunks.length === 0) {
          if (session && typeof session.disconnect === "function") {
            session.disconnect()
          }
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
