export interface NativeGeminiConfig {
  apiKey: string
  voice?: string
  job: { title: string; company: string; description?: string }
  resume?: { content?: string }
  questions: { technical: string[]; behavioral: string[] }
}

export interface GeminiCallbacks {
  onConnected?: () => void
  onDisconnected?: () => void
  onError?: (error: string) => void
  onAudio?: (audioData: string) => void
  onMessage?: (message: any) => void
}

export class NativeGeminiClient {
  private config: NativeGeminiConfig
  private callbacks: GeminiCallbacks
  private isConnected = false
  private sessionId: string | null = null

  constructor(config: NativeGeminiConfig, callbacks: GeminiCallbacks = {}) {
    this.config = config
    this.callbacks = callbacks
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private buildSystemPrompt(): string {
    const { job, resume, questions } = this.config
    let prompt = `You are conducting a mock interview for the ${job.title} position at ${job.company}.`

    if (job.description) {
      prompt += `\n\nJOB DESCRIPTION:\n${job.description}`
    }

    if (resume?.content) {
      prompt += `\n\nCANDIDATE RESUME:\n${resume.content}`
    }

    prompt += "\n\nINTERVIEW QUESTIONS TO COVER:"

    questions.technical.forEach((q, i) => {
      prompt += `\n${i + 1}. [TECHNICAL] ${q}`
    })

    questions.behavioral.forEach((q, i) => {
      prompt += `\n${i + 1 + questions.technical.length}. [BEHAVIORAL] ${q}`
    })

    prompt += `\n\nConduct this interview naturally. Ask one question at a time, wait for responses, and provide follow-up questions. Keep responses conversational and professional.`

    return prompt
  }

  async startSession(): Promise<void> {
    try {
      // Simulate connection for now - in a real implementation, this would
      // establish a WebSocket or streaming connection to Google AI
      this.isConnected = true
      this.callbacks.onConnected?.()

      console.log(`🎙️ Native Gemini session started: ${this.sessionId}`)
      console.log(`🎯 Voice: ${this.config.voice || "Default"}`)
      console.log(`📝 System prompt: ${this.buildSystemPrompt().substring(0, 100)}...`)
    } catch (error: any) {
      this.callbacks.onError?.(error.message || "Failed to start session")
      throw error
    }
  }

  async sendText(text: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error("Session not connected")
    }

    try {
      // For now, simulate sending text and receiving a response
      console.log(`📤 Sending text: ${text}`)

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Simulate receiving a response
      const mockResponse = {
        type: "text_response",
        content: `Thank you for that response. Let me ask you another question about your experience.`,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
      }

      this.callbacks.onMessage?.(mockResponse)

      // Simulate audio data (base64 encoded mock audio)
      const mockAudioData =
        "UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT"

      this.callbacks.onAudio?.(mockAudioData)
    } catch (error: any) {
      this.callbacks.onError?.(error.message || "Failed to send text")
      throw error
    }
  }

  async sendAudio(audioData: ArrayBuffer): Promise<void> {
    if (!this.isConnected) {
      throw new Error("Session not connected")
    }

    try {
      const base64Audio = Buffer.from(audioData).toString("base64")
      console.log(`🎤 Sending audio data: ${base64Audio.length} characters`)

      // Simulate processing audio
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate response to audio
      const mockResponse = {
        type: "audio_response",
        content: "I heard your response. That's interesting. Can you elaborate on that?",
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
      }

      this.callbacks.onMessage?.(mockResponse)
    } catch (error: any) {
      this.callbacks.onError?.(error.message || "Failed to send audio")
      throw error
    }
  }

  close(): void {
    if (this.isConnected) {
      this.isConnected = false
      this.callbacks.onDisconnected?.()
      console.log(`🔌 Session closed: ${this.sessionId}`)
    }
  }

  isActive(): boolean {
    return this.isConnected
  }
}
