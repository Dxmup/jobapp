interface LiveAPIConfig {
  model: string
  apiKey: string
  voice?: string
  responseModalities?: string[]
}

interface LiveAPICallbacks {
  onOpen?: () => void
  onMessage?: (message: any) => void
  onError?: (error: any) => void
  onClose?: (event: any) => void
}

export class GeminiLiveClient {
  private config: LiveAPIConfig
  private callbacks: LiveAPICallbacks
  private session: any = null

  constructor(config: LiveAPIConfig, callbacks: LiveAPICallbacks = {}) {
    this.config = config
    this.callbacks = callbacks
  }

  async connect(): Promise<void> {
    try {
      const { GoogleGenAI } = await import("@google/genai")
      const ai = new GoogleGenAI({ apiKey: this.config.apiKey })

      this.session = await ai.live.connect({
        model: this.config.model,
        config: {
          responseModalities: this.config.responseModalities || ["AUDIO"],
          voiceConfig: this.config.voice
            ? {
                prebuiltVoiceConfig: {
                  voiceName: this.config.voice,
                },
              }
            : undefined,
          speechConfig: {
            languageCode: "en-US",
          },
        },
      })

      // Set up event handlers
      this.session.on("open", () => {
        console.log("✅ Gemini Live API connected")
        this.callbacks.onOpen?.()
      })

      this.session.on("message", (message: any) => {
        this.callbacks.onMessage?.(message)
      })

      this.session.on("error", (error: any) => {
        console.error("❌ Gemini Live API error:", error)
        this.callbacks.onError?.(error)
      })

      this.session.on("close", (event: any) => {
        console.log("🔚 Gemini Live API disconnected")
        this.callbacks.onClose?.(event)
      })
    } catch (error: any) {
      console.error("❌ Failed to connect to Gemini Live API:", error)
      throw error
    }
  }

  sendText(text: string): void {
    if (!this.session) {
      throw new Error("Session not connected")
    }

    try {
      this.session.send({
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
    } catch (error: any) {
      console.error("❌ Failed to send text:", error)
      throw error
    }
  }

  disconnect(): void {
    if (this.session) {
      this.session.disconnect()
      this.session = null
    }
  }

  isConnected(): boolean {
    return this.session !== null
  }
}

// Utility function to generate speech using Live API
export async function generateSpeechWithLiveAPI(text: string, apiKey: string, voice = "Kore"): Promise<string> {
  return new Promise((resolve, reject) => {
    const audioChunks: string[] = []

    const client = new GeminiLiveClient(
      {
        model: "gemini-2.0-flash-live-001",
        apiKey: apiKey,
        voice: voice,
        responseModalities: ["AUDIO"],
      },
      {
        onOpen: () => {
          try {
            client.sendText(text)
          } catch (error) {
            reject(error)
          }
        },
        onMessage: (message: any) => {
          if (message.serverContent) {
            const serverContent = message.serverContent

            // Extract audio data
            if (serverContent.modelTurn && serverContent.modelTurn.parts) {
              for (const part of serverContent.modelTurn.parts) {
                if (part.inlineData && part.inlineData.mimeType === "audio/pcm") {
                  audioChunks.push(part.inlineData.data)
                }
              }
            }

            // Check if turn is complete
            if (serverContent.turnComplete) {
              const combinedAudio = audioChunks.join("")
              client.disconnect()
              resolve(combinedAudio)
            }
          }
        },
        onError: (error: any) => {
          client.disconnect()
          reject(error)
        },
        onClose: () => {
          if (audioChunks.length === 0) {
            reject(new Error("No audio data received"))
          }
        },
      },
    )

    // Connect and start the process
    client.connect().catch(reject)

    // Timeout protection
    setTimeout(() => {
      if (audioChunks.length === 0) {
        client.disconnect()
        reject(new Error("Timeout waiting for audio response"))
      }
    }, 30000)
  })
}
