interface LiveAPIMessage {
  clientContent?: {
    turns: Array<{
      role: string
      parts: Array<{ text: string }>
    }>
    turnComplete: boolean
  }
  setupComplete?: boolean
}

interface AudioChunk {
  data: string
  mimeType: string
}

export class GeminiLiveWebSocket {
  private ws: WebSocket | null = null
  private apiKey: string
  private model: string
  private voice: string
  private onAudioData: (audioData: string) => void
  private onError: (error: Error) => void
  private onComplete: () => void

  constructor(
    apiKey: string,
    model = "gemini-2.0-flash-live-001",
    voice = "Kore",
    callbacks: {
      onAudioData: (audioData: string) => void
      onError: (error: Error) => void
      onComplete: () => void
    },
  ) {
    this.apiKey = apiKey
    this.model = model
    this.voice = voice
    this.onAudioData = callbacks.onAudioData
    this.onError = callbacks.onError
    this.onComplete = callbacks.onComplete
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Construct the WebSocket URL for Gemini Live API
        const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${this.apiKey}`

        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log("✅ WebSocket connected to Gemini Live API")
          this.sendSetup()
          resolve()
        }

        this.ws.onmessage = async (event) => {
          try {
            // Handle both text and binary messages
            let messageData: string

            if (event.data instanceof Blob) {
              // Convert Blob to text
              messageData = await event.data.text()
              console.log("📨 Received binary message, converted to text")
            } else if (typeof event.data === "string") {
              messageData = event.data
              console.log("📨 Received text message")
            } else {
              console.log("📨 Received unknown message type:", typeof event.data)
              return
            }

            // Try to parse as JSON
            try {
              const message = JSON.parse(messageData)
              this.handleMessage(message)
            } catch (parseError) {
              // If it's not JSON, it might be raw audio data
              console.log("📨 Received non-JSON data, treating as audio")
              if (messageData.length > 100) {
                // Assume it's base64 audio data
                this.onAudioData(messageData)
              }
            }
          } catch (error) {
            console.error("❌ Failed to process WebSocket message:", error)
          }
        }

        this.ws.onerror = (error) => {
          console.error("❌ WebSocket error:", error)
          this.onError(new Error("WebSocket connection error"))
          reject(error)
        }

        this.ws.onclose = (event) => {
          console.log("🔚 WebSocket closed:", event.code, event.reason)
          this.ws = null
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private sendSetup(): void {
    if (!this.ws) return

    const setupMessage = {
      setup: {
        model: `models/${this.model}`,
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: this.voice,
              },
            },
          },
        },
      },
    }

    console.log("📤 Sending setup message")
    this.ws.send(JSON.stringify(setupMessage))
  }

  private handleMessage(message: any): void {
    console.log("📨 Received message type:", Object.keys(message)[0])

    if (message.setupComplete) {
      console.log("✅ Setup complete")
      return
    }

    if (message.serverContent) {
      const serverContent = message.serverContent

      // Extract audio data from the response
      if (serverContent.modelTurn && serverContent.modelTurn.parts) {
        for (const part of serverContent.modelTurn.parts) {
          if (part.inlineData && part.inlineData.mimeType === "audio/pcm") {
            this.onAudioData(part.inlineData.data)
          }
        }
      }

      // Check if the turn is complete
      if (serverContent.turnComplete) {
        console.log("✅ Turn complete")
        this.onComplete()
      }
    }

    if (message.error) {
      console.error("❌ Server error:", message.error)
      this.onError(new Error(message.error.message || "Server error"))
    }
  }

  sendText(text: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected")
    }

    const message: LiveAPIMessage = {
      clientContent: {
        turns: [
          {
            role: "user",
            parts: [{ text: text }],
          },
        ],
        turnComplete: true,
      },
    }

    console.log("📤 Sending text message")
    this.ws.send(JSON.stringify(message))
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

// Utility function to generate speech using direct WebSocket connection
export async function generateSpeechWithWebSocket(text: string, apiKey: string, voice = "Kore"): Promise<string> {
  return new Promise((resolve, reject) => {
    const audioChunks: string[] = []
    const setupComplete = false

    const client = new GeminiLiveWebSocket(apiKey, "gemini-2.0-flash-live-001", voice, {
      onAudioData: (audioData: string) => {
        console.log(`📨 Received audio chunk: ${audioData.length} characters`)
        audioChunks.push(audioData)
      },
      onError: (error: Error) => {
        client.disconnect()
        reject(error)
      },
      onComplete: () => {
        const combinedAudio = audioChunks.join("")
        console.log(`✅ Audio generation complete: ${combinedAudio.length} total characters`)
        client.disconnect()
        resolve(combinedAudio)
      },
    })

    // Connect and send text
    client
      .connect()
      .then(() => {
        console.log("🔗 Connected, sending text...")
        // Wait a moment for setup to complete
        setTimeout(() => {
          client.sendText(text)
        }, 1000)
      })
      .catch(reject)

    // Timeout protection
    setTimeout(() => {
      if (audioChunks.length === 0) {
        client.disconnect()
        reject(new Error("Timeout waiting for audio response"))
      }
    }, 30000)
  })
}
