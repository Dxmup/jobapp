import { promptManager } from "@/lib/prompt-manager"

interface InterviewConfig {
  jobTitle: string
  companyName: string
  interviewerName: string
  userFirstName: string
  phoneScreenerInstructions?: string
}

interface ConversationState {
  phase: "introduction" | "questions" | "closing"
  currentQuestionIndex: number
  questions: string[]
  responses: string[]
}

export class ConversationalInterviewClient {
  private config: InterviewConfig
  private state: ConversationState
  private websocket: WebSocket | null = null
  private isConnected = false

  constructor(config: InterviewConfig) {
    this.config = config
    this.state = {
      phase: "introduction",
      currentQuestionIndex: 0,
      questions: [],
      responses: [],
    }
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Use the Gemini Live API WebSocket endpoint
        const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY}`

        this.websocket = new WebSocket(wsUrl)

        this.websocket.onopen = () => {
          console.log("Connected to Gemini Live API")
          this.isConnected = true
          resolve()
        }

        this.websocket.onmessage = (event) => {
          this.handleMessage(event.data)
        }

        this.websocket.onerror = (error) => {
          console.error("WebSocket error:", error)
          reject(error)
        }

        this.websocket.onclose = () => {
          console.log("WebSocket connection closed")
          this.isConnected = false
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  async startInterview(questions: string[]): Promise<void> {
    this.state.questions = questions
    await this.sendIntroduction()
  }

  private async sendIntroduction(): Promise<void> {
    try {
      const introText = `Hello ${this.config.userFirstName}, thank you for taking the time to speak with me today. I'm ${this.config.interviewerName} from ${this.config.companyName}. I'm excited to learn more about your background and discuss the ${this.config.jobTitle} position with you. This will be a conversational interview where I'll ask you some questions about your experience and qualifications. Are you ready to begin?`

      const processedPrompt = await promptManager.processPrompt("interview-introduction", {
        interviewerName: this.config.interviewerName,
        companyName: this.config.companyName,
        userFirstName: this.config.userFirstName,
        introText,
        phoneScreenerInstructions: this.config.phoneScreenerInstructions || "",
      })

      if (processedPrompt) {
        await this.sendToGemini(processedPrompt)
      } else {
        // Fallback if prompt not found
        await this.sendToGemini(introText)
      }
    } catch (error) {
      console.error("Error sending introduction:", error)
    }
  }

  async askNextQuestion(): Promise<void> {
    if (this.state.currentQuestionIndex >= this.state.questions.length) {
      await this.sendClosing()
      return
    }

    try {
      const currentQuestion = this.state.questions[this.state.currentQuestionIndex]

      const processedPrompt = await promptManager.processPrompt("interview-question", {
        interviewerName: this.config.interviewerName,
        interviewType: "phone screening",
        jobTitle: this.config.jobTitle,
        companyName: this.config.companyName,
        userFirstName: this.config.userFirstName,
        questionText: currentQuestion,
        phoneScreenerInstructions: this.config.phoneScreenerInstructions || "",
      })

      if (processedPrompt) {
        await this.sendToGemini(processedPrompt)
      } else {
        // Fallback if prompt not found
        await this.sendToGemini(currentQuestion)
      }

      this.state.currentQuestionIndex++
    } catch (error) {
      console.error("Error asking question:", error)
    }
  }

  private async sendClosing(): Promise<void> {
    try {
      const closingText = `Thank you so much for your time today, ${this.config.userFirstName}. I really enjoyed our conversation and learning more about your background and experience. We'll be in touch soon regarding next steps in the process. Have a great rest of your day!`

      const processedPrompt = await promptManager.processPrompt("interview-closing", {
        interviewerName: this.config.interviewerName,
        userFirstName: this.config.userFirstName,
        closingText,
        phoneScreenerInstructions: this.config.phoneScreenerInstructions || "",
      })

      if (processedPrompt) {
        await this.sendToGemini(processedPrompt)
      } else {
        // Fallback if prompt not found
        await this.sendToGemini(closingText)
      }

      this.state.phase = "closing"
    } catch (error) {
      console.error("Error sending closing:", error)
    }
  }

  private async sendToGemini(message: string): Promise<void> {
    if (!this.websocket || !this.isConnected) {
      throw new Error("WebSocket not connected")
    }

    const request = {
      generateContentRequest: {
        model: "models/gemini-2.0-flash-exp",
        contents: [
          {
            parts: [
              {
                text: message,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Aoede",
              },
            },
          },
        },
      },
    }

    this.websocket.send(JSON.stringify(request))
  }

  private handleMessage(data: string): void {
    try {
      const response = JSON.parse(data)

      if (response.serverContent?.modelTurn?.parts) {
        for (const part of response.serverContent.modelTurn.parts) {
          if (part.inlineData?.mimeType === "audio/pcm") {
            // Handle audio response
            this.playAudioResponse(part.inlineData.data)
          }
        }
      }
    } catch (error) {
      console.error("Error handling message:", error)
    }
  }

  private playAudioResponse(audioData: string): void {
    try {
      // Convert base64 audio data to playable format
      const binaryData = atob(audioData)
      const arrayBuffer = new ArrayBuffer(binaryData.length)
      const uint8Array = new Uint8Array(arrayBuffer)

      for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i)
      }

      // Create audio context and play the audio
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      audioContext
        .decodeAudioData(arrayBuffer)
        .then((audioBuffer) => {
          const source = audioContext.createBufferSource()
          source.buffer = audioBuffer
          source.connect(audioContext.destination)
          source.start()
        })
        .catch((error) => {
          console.error("Error playing audio:", error)
        })
    } catch (error) {
      console.error("Error processing audio data:", error)
    }
  }

  sendUserResponse(audioData: ArrayBuffer): void {
    if (!this.websocket || !this.isConnected) {
      console.error("WebSocket not connected")
      return
    }

    // Convert audio data to base64
    const uint8Array = new Uint8Array(audioData)
    const binaryString = Array.from(uint8Array, (byte) => String.fromCharCode(byte)).join("")
    const base64Audio = btoa(binaryString)

    const request = {
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: "audio/pcm",
            data: base64Audio,
          },
        ],
      },
    }

    this.websocket.send(JSON.stringify(request))
  }

  disconnect(): void {
    if (this.websocket) {
      this.websocket.close()
      this.websocket = null
      this.isConnected = false
    }
  }

  getState(): ConversationState {
    return { ...this.state }
  }

  isInterviewComplete(): boolean {
    return this.state.phase === "closing"
  }
}
