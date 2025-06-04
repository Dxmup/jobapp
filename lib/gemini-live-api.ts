import { GoogleGenAI, Modality } from "@google/genai"

export class GeminiLiveClient {
  private apiKey: string
  private session: any = null
  private isConnected = false
  private callbacks: {
    onMessage?: (message: any) => void
    onError?: (error: any) => void
    onOpen?: () => void
    onClose?: () => void
  } = {}
  private lastAudioSentTime = 0
  private audioEndTimeoutId: NodeJS.Timeout | null = null

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  setCallbacks(callbacks: {
    onMessage?: (message: any) => void
    onError?: (error: any) => void
    onOpen?: () => void
    onClose?: () => void
  }) {
    this.callbacks = callbacks
  }

  async connect(config: {
    jobTitle: string
    company: string
    jobDescription: string
    resume?: string
    questions: { technical: string[]; behavioral: string[] }
  }): Promise<void> {
    try {
      console.log("Creating GenAI client")
      const ai = new GoogleGenAI({ apiKey: this.apiKey })

      console.log("Creating system instruction")
      const systemInstruction = this.createSystemInstruction(config)

      console.log("Creating minimal session config")
      // Create the absolute minimal configuration
      const sessionConfig = {
        responseModalities: [Modality.AUDIO],
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        // Only include the essential voice config
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Aoede",
            },
          },
        },
      }

      console.log("Connecting to Live API with minimal config")
      this.session = await ai.live.connect({
        model: "gemini-2.0-flash-live-001",
        callbacks: {
          onopen: () => {
            console.log("Live API session opened")
            this.isConnected = true

            if (this.callbacks.onOpen) {
              this.callbacks.onOpen()
            }

            // Wait 3 seconds before sending the initial message
            setTimeout(() => {
              console.log("Sending initial greeting after delay")
              if (this.isConnected && this.session) {
                this.sendText("Please start the interview with a professional greeting.")
                  .then(() => console.log("Initial greeting sent successfully"))
                  .catch((err) => console.error("Failed to send initial greeting:", err))
              } else {
                console.error("Cannot send initial greeting - session disconnected")
              }
            }, 3000)
          },
          onmessage: (message: any) => {
            console.log("Live API message received:", message)
            if (this.callbacks.onMessage) {
              this.callbacks.onMessage(message)
            }
          },
          onerror: (error: any) => {
            console.error("Live API error:", error)
            if (this.callbacks.onError) {
              this.callbacks.onError(error)
            }
          },
          onclose: (event: any) => {
            console.log("Live API session closed:", event)
            this.isConnected = false
            if (this.callbacks.onClose) {
              this.callbacks.onClose()
            }
          },
        },
        config: sessionConfig,
      })

      console.log("Live API connection established")
    } catch (error) {
      console.error("Failed to connect to Live API:", error)
      throw error
    }
  }

  private createSystemInstruction(config: {
    jobTitle: string
    company: string
    jobDescription: string
    resume?: string
    questions: { technical: string[]; behavioral: string[] }
  }) {
    const { jobTitle, company, jobDescription, resume, questions } = config

    // Format questions as a structured JSON-like format
    const technicalQuestionsFormatted = questions.technical
      .map((q, i) => `T${i + 1}: "${q.replace(/"/g, '\\"')}"`)
      .join("\n")

    const behavioralQuestionsFormatted = questions.behavioral
      .map((q, i) => `B${i + 1}: "${q.replace(/"/g, '\\"')}"`)
      .join("\n")

    return `You are a professional interviewer conducting a mock interview for a ${jobTitle} position at ${company}.

INTERVIEW CONTEXT:
- Job Title: ${jobTitle}
- Company: ${company}
- Job Description: ${jobDescription}
${resume ? `- Candidate's Resume: ${resume}` : ""}

AVAILABLE QUESTIONS:
Technical Questions:
${technicalQuestionsFormatted}

Behavioral Questions:
${behavioralQuestionsFormatted}

INTERVIEW GUIDELINES:
1. Start with a warm greeting and brief introduction about the role
2. Ask ONE question at a time - never ask multiple questions in the same response
3. Complete each question fully before moving to the next one
4. Use the provided questions as a base, but feel free to ask natural follow-up questions
5. Be encouraging but professional
6. Provide brief, constructive feedback after each answer
7. Keep responses concise and conversational (30-60 seconds each)
8. End with asking if the candidate has any questions about the role
9. IMPORTANT: Always respond to the candidate's answers with feedback and a follow-up question

CONVERSATION STYLE:
- Speak naturally as if this is a real phone interview
- Be friendly but professional
- Ask one question at a time - NEVER combine multiple questions
- Wait for the candidate's response before moving to the next question
- Provide brief acknowledgment of their answers
- IMPORTANT: Always continue the conversation after the candidate speaks
- IMPORTANT: Finish your sentences and questions completely

QUESTION STRUCTURE:
- Ask each question in full, complete sentences
- Do not cut off questions mid-sentence
- Ensure each question has a clear beginning and end
- Pause briefly between sentences for natural speech rhythm

Begin the interview now with a professional greeting.`
  }

  async sendAudio(audioData: ArrayBuffer) {
    if (!this.session || !this.isConnected) {
      console.error("Session not connected")
      return
    }

    try {
      const base64Audio = this.arrayBufferToBase64(audioData)

      // Record the time we sent audio
      this.lastAudioSentTime = Date.now()

      // Clear any existing timeout
      if (this.audioEndTimeoutId) {
        clearTimeout(this.audioEndTimeoutId)
        this.audioEndTimeoutId = null
      }

      // Set a new timeout to send audioStreamEnd after 1 second of silence
      this.audioEndTimeoutId = setTimeout(() => {
        console.log("Detected end of speech (1s silence) - sending audioStreamEnd")
        this.sendAudioStreamEnd()
          .then(() => console.log("audioStreamEnd sent successfully"))
          .catch((err) => console.error("Error sending audioStreamEnd:", err))
        this.audioEndTimeoutId = null
      }, 1000)

      console.log("Sending audio chunk to Live API")
      await this.session.sendRealtimeInput({
        audio: {
          data: base64Audio,
          mimeType: "audio/pcm;rate=16000", // ✅ This matches LiveAPI.md specification
        },
      })
    } catch (error) {
      console.error("Error sending audio:", error)
    }
  }

  // Helper method to convert ArrayBuffer to base64
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ""
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  async sendAudioStreamEnd() {
    if (!this.session || !this.isConnected) {
      console.error("Session not connected")
      return
    }

    try {
      console.log("Sending audioStreamEnd signal")
      await this.session.sendRealtimeInput({
        audioStreamEnd: true,
      })
    } catch (error) {
      console.error("Error sending audioStreamEnd:", error)
    }
  }

  async sendText(text: string) {
    if (!this.session || !this.isConnected) {
      console.error("Session not connected")
      return
    }

    try {
      console.log("Sending text to Live API:", text)
      await this.session.sendClientContent({
        turns: [
          {
            parts: [{ text }],
            role: "user",
          },
        ],
        turnComplete: true,
      })
    } catch (error) {
      console.error("Error sending text:", error)
    }
  }

  disconnect() {
    if (this.audioEndTimeoutId) {
      clearTimeout(this.audioEndTimeoutId)
      this.audioEndTimeoutId = null
    }

    if (this.session) {
      try {
        this.session.close()
      } catch (e) {
        console.error("Error closing session:", e)
      }
      this.session = null
      this.isConnected = false
    }
  }

  getSession() {
    return this.session
  }

  isSessionConnected() {
    return this.isConnected && this.session !== null
  }

  // Method to manually trigger the next response
  async triggerNextResponse() {
    if (!this.session || !this.isConnected) {
      console.error("Session not connected")
      return
    }

    try {
      console.log("Manually triggering next response")
      await this.sendText("I have finished speaking. Please continue with your feedback and next question.")
    } catch (error) {
      console.error("Error triggering next response:", error)
    }
  }
}
