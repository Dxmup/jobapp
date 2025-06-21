export interface LiveInterviewConfig {
  voice: "Puck" | "Charon" | "Kore" | "Fenrir" | "Aoede" | "Leda" | "Orus" | "Zephyr"
  maxDuration: number
  timeWarningAt: number
}

export interface LiveInterviewCallbacks {
  onConnected: () => void
  onDisconnected: () => void
  onError: (error: string) => void
  onTimeWarning: (remainingMinutes: number) => void
  onTimeUp: () => void
  onInterviewComplete: () => void
  onAudioReceived: (audioData: string) => void
}

export class LiveInterviewClient {
  private jobId: string
  private resumeId?: string
  private questions: any
  private config: LiveInterviewConfig
  private callbacks: LiveInterviewCallbacks
  private isActive = false
  private startTime = 0
  private audioContext: AudioContext | null = null
  private mediaRecorder: MediaRecorder | null = null
  private currentQuestionIndex = 0
  private timeoutId: NodeJS.Timeout | null = null

  private constructor(
    jobId: string,
    resumeId: string | undefined,
    questions: any,
    config: LiveInterviewConfig,
    callbacks: LiveInterviewCallbacks,
  ) {
    this.jobId = jobId
    this.resumeId = resumeId
    this.questions = questions
    this.config = config
    this.callbacks = callbacks
  }

  static async create(
    jobId: string,
    resumeId: string | undefined,
    questions: any,
    config: LiveInterviewConfig,
    callbacks: LiveInterviewCallbacks,
  ): Promise<LiveInterviewClient> {
    const client = new LiveInterviewClient(jobId, resumeId, questions, config, callbacks)
    await client.initialize()
    return client
  }

  private async initialize(): Promise<void> {
    try {
      // Initialize audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.mediaRecorder = new MediaRecorder(stream)

      this.callbacks.onConnected()
    } catch (error: any) {
      this.callbacks.onError(`Failed to initialize: ${error.message}`)
    }
  }

  async startInterview(): Promise<void> {
    try {
      this.isActive = true
      this.startTime = Date.now()
      this.currentQuestionIndex = 0

      // Set up time warning
      setTimeout(() => {
        if (this.isActive) {
          const remainingMinutes = Math.ceil((this.config.maxDuration - this.config.timeWarningAt) / 60000)
          this.callbacks.onTimeWarning(remainingMinutes)
        }
      }, this.config.timeWarningAt)

      // Set up time limit
      this.timeoutId = setTimeout(() => {
        if (this.isActive) {
          this.callbacks.onTimeUp()
          this.endInterview()
        }
      }, this.config.maxDuration)

      // Start with first question
      await this.askNextQuestion()
    } catch (error: any) {
      this.callbacks.onError(`Failed to start interview: ${error.message}`)
    }
  }

  private async askNextQuestion(): Promise<void> {
    try {
      const allQuestions = [...this.questions.technical, ...this.questions.behavioral]

      if (this.currentQuestionIndex >= allQuestions.length) {
        this.callbacks.onInterviewComplete()
        this.endInterview()
        return
      }

      const question = allQuestions[this.currentQuestionIndex]
      console.log(`Asking question ${this.currentQuestionIndex + 1}: ${question}`)

      // Generate audio for the question using the existing API
      const response = await fetch("/api/interview/generate-real-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: question,
          voice: this.config.voice,
          tone: "professional",
        }),
      })

      const data = await response.json()

      if (data.success && data.audioData) {
        // Play the audio
        await this.playAudio(data.audioData)
        this.callbacks.onAudioReceived(data.audioData)

        // Wait for user response (simulate listening period)
        setTimeout(() => {
          this.currentQuestionIndex++
          if (this.isActive) {
            this.askNextQuestion()
          }
        }, 15000) // 15 seconds to answer
      } else {
        throw new Error(data.error || "Failed to generate audio")
      }
    } catch (error: any) {
      this.callbacks.onError(`Failed to ask question: ${error.message}`)
    }
  }

  private async playAudio(audioData: string): Promise<void> {
    try {
      // Convert base64 to blob
      const audioBuffer = Uint8Array.from(atob(audioData), (c) => c.charCodeAt(0))
      const audioBlob = new Blob([audioBuffer], { type: "audio/wav" })
      const audioUrl = URL.createObjectURL(audioBlob)

      // Create and play audio
      const audio = new Audio(audioUrl)

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          resolve()
        }

        audio.onerror = (e) => {
          URL.revokeObjectURL(audioUrl)
          reject(new Error("Audio playback failed"))
        }

        audio.play().catch(reject)
      })
    } catch (error: any) {
      throw new Error(`Failed to play audio: ${error.message}`)
    }
  }

  endInterview(): void {
    this.isActive = false

    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop()
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close()
    }

    this.callbacks.onDisconnected()
  }

  isActive(): boolean {
    return this.isActive
  }

  getInterviewDuration(): number {
    return this.isActive ? Date.now() - this.startTime : 0
  }

  getRemainingTime(): number {
    if (!this.isActive) return 0
    const elapsed = Date.now() - this.startTime
    return Math.max(0, this.config.maxDuration - elapsed)
  }
}
