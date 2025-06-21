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

    // Log the full message structure for debugging
    console.log("📨 Full message:", JSON.stringify(message, null, 2))

    if (message.setupComplete) {
      console.log("✅ Setup complete")
      return
    }

    if (message.serverContent) {
      const serverContent = message.serverContent
      let foundAudio = false

      // Check for audio in different possible locations
      if (serverContent.modelTurn && serverContent.modelTurn.parts) {
        for (const part of serverContent.modelTurn.parts) {
          // Check for inline audio data
          if (part.inlineData) {
            if (part.inlineData.mimeType === "audio/pcm" || part.inlineData.mimeType?.includes("audio")) {
              console.log("🔊 Found audio data in inlineData")
              this.onAudioData(part.inlineData.data)
              foundAudio = true
            }
          }

          // Check for direct audio data
          if (part.audio || part.audioData) {
            console.log("🔊 Found audio data in audio field")
            this.onAudioData(part.audio || part.audioData)
            foundAudio = true
          }
        }
      }

      // Check for audio at the serverContent level
      if (serverContent.audio || serverContent.audioData) {
        console.log("🔊 Found audio data at serverContent level")
        this.onAudioData(serverContent.audio || serverContent.audioData)
        foundAudio = true
      }

      // Check for audio in any parts array at serverContent level
      if (serverContent.parts) {
        for (const part of serverContent.parts) {
          if (
            part.inlineData &&
            (part.inlineData.mimeType === "audio/pcm" || part.inlineData.mimeType?.includes("audio"))
          ) {
            console.log("🔊 Found audio data in serverContent.parts")
            this.onAudioData(part.inlineData.data)
            foundAudio = true
          }
        }
      }

      if (!foundAudio) {
        console.log("⚠️ No audio data found in serverContent message")
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
    let turnComplete = false

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
        turnComplete = true
        const combinedAudio = audioChunks.join("")
        console.log(`✅ Audio generation complete: ${combinedAudio.length} total characters`)
        client.disconnect()

        if (combinedAudio.length > 0) {
          resolve(combinedAudio)
        } else {
          reject(new Error("No audio data received"))
        }
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

    // Timeout protection - but also resolve if we have audio data
    setTimeout(() => {
      if (!turnComplete) {
        if (audioChunks.length > 0) {
          console.log("⏰ Timeout reached but we have audio data, resolving...")
          const combinedAudio = audioChunks.join("")
          client.disconnect()
          resolve(combinedAudio)
        } else {
          client.disconnect()
          reject(new Error("Timeout waiting for audio response"))
        }
      }
    }, 25000) // Reduced timeout to 25 seconds
  })
}
