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
  onQuestionDisplayed?: (question: string, index: number, total: number) => void
}

export class LiveInterviewClient {
  private jobId: string
  private resumeId?: string
  private questions: any
  private config: LiveInterviewConfig
  private callbacks: LiveInterviewCallbacks
  private active = false
  private startTime = 0
  private audioContext: AudioContext | null = null
  private mediaRecorder: MediaRecorder | null = null
  private currentQuestionIndex = 0
  private timeoutId: NodeJS.Timeout | null = null
  private stream: MediaStream | null = null

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
      // Initialize audio context for playback
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Request microphone access for recording user responses
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.mediaRecorder = new MediaRecorder(this.stream)

      console.log("✅ LiveInterviewClient initialized successfully")
      this.callbacks.onConnected()
    } catch (error: any) {
      console.error("❌ Failed to initialize LiveInterviewClient:", error)
      this.callbacks.onError(`Failed to initialize: ${error.message}`)
    }
  }

  async startInterview(): Promise<void> {
    try {
      this.active = true
      this.startTime = Date.now()
      this.currentQuestionIndex = 0

      console.log("🎙️ Starting live interview...")

      // Set up time warning
      setTimeout(() => {
        if (this.active) {
          const remainingMinutes = Math.ceil((this.config.maxDuration - this.config.timeWarningAt) / 60000)
          this.callbacks.onTimeWarning(remainingMinutes)
        }
      }, this.config.timeWarningAt)

      // Set up time limit
      this.timeoutId = setTimeout(() => {
        if (this.active) {
          this.callbacks.onTimeUp()
          this.endInterview()
        }
      }, this.config.maxDuration)

      // Start with first question
      await this.askNextQuestion()
    } catch (error: any) {
      console.error("❌ Failed to start interview:", error)
      this.callbacks.onError(`Failed to start interview: ${error.message}`)
    }
  }

  private async askNextQuestion(): Promise<void> {
    try {
      const allQuestions = [...this.questions.technical, ...this.questions.behavioral]

      if (this.currentQuestionIndex >= allQuestions.length) {
        console.log("🎉 All questions completed")
        this.callbacks.onInterviewComplete()
        this.endInterview()
        return
      }

      const question = allQuestions[this.currentQuestionIndex]
      const questionNumber = this.currentQuestionIndex + 1
      const totalQuestions = allQuestions.length

      console.log(`❓ Question ${questionNumber}/${totalQuestions}: ${question.substring(0, 100)}...`)

      // Notify UI about the current question
      if (this.callbacks.onQuestionDisplayed) {
        this.callbacks.onQuestionDisplayed(question, questionNumber, totalQuestions)
      }

      try {
        // Try Live API first
        const response = await fetch("/api/interview/generate-real-audio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            text: question,
            voice: this.config.voice,
            tone: "professional",
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.audioData) {
            console.log("🔊 Playing Live API generated audio...")
            await this.playLiveAPIAudio(data.audioData)
            this.callbacks.onAudioReceived(data.audioData)
          } else {
            throw new Error(data.error || "No audio data received from Live API")
          }
        } else {
          throw new Error(`Live API failed: ${response.status}`)
        }
      } catch (liveApiError: any) {
        console.warn("⚠️ Live API failed, trying fallback:", liveApiError.message)

        // Try fallback API
        try {
          const fallbackResponse = await fetch("/api/interview/generate-audio-fallback", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              text: question,
              voice: this.config.voice,
              tone: "professional",
            }),
          })

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            if (fallbackData.success) {
              console.log("📝 Using text-only fallback - question will be displayed")
              this.callbacks.onAudioReceived("text-fallback")
            } else {
              throw new Error(fallbackData.error || "Fallback API failed")
            }
          } else {
            throw new Error(`Fallback API failed: ${fallbackResponse.status}`)
          }
        } catch (fallbackError: any) {
          console.error("❌ Both Live API and fallback failed:", fallbackError.message)
          // Continue with next question instead of failing completely
          console.log("📝 Continuing with text-only display")
          this.callbacks.onAudioReceived("error-fallback")
        }
      }

      // Wait for user response
      setTimeout(() => {
        this.currentQuestionIndex++
        if (this.active) {
          this.askNextQuestion()
        }
      }, 30000) // 30 seconds to answer
    } catch (error: any) {
      console.error("❌ Failed to ask question:", error)
      this.callbacks.onError(`Failed to ask question: ${error.message}`)
    }
  }

  private async playLiveAPIAudio(audioData: string): Promise<void> {
    try {
      if (!this.audioContext) {
        throw new Error("Audio context not initialized")
      }

      // Decode base64 audio data
      const audioBuffer = Uint8Array.from(atob(audioData), (c) => c.charCodeAt(0))

      // Convert PCM data to AudioBuffer
      // Live API returns 16-bit PCM at 24kHz
      const sampleRate = 24000
      const numSamples = audioBuffer.length / 2 // 16-bit = 2 bytes per sample

      const audioContextBuffer = this.audioContext.createBuffer(1, numSamples, sampleRate)
      const channelData = audioContextBuffer.getChannelData(0)

      // Convert 16-bit PCM to float32
      for (let i = 0; i < numSamples; i++) {
        const byte1 = audioBuffer[i * 2]
        const byte2 = audioBuffer[i * 2 + 1]
        const sample = ((byte2 << 8) | byte1) / 32768.0 // Convert to signed 16-bit then normalize
        channelData[i] = sample
      }

      // Play the audio
      const source = this.audioContext.createBufferSource()
      source.buffer = audioContextBuffer
      source.connect(this.audioContext.destination)

      return new Promise((resolve, reject) => {
        source.onended = () => {
          console.log("✅ Live API audio playback completed")
          resolve()
        }

        source.onerror = (e) => {
          console.error("❌ Live API audio playback failed:", e)
          reject(new Error("Audio playback failed"))
        }

        source.start()
      })
    } catch (error: any) {
      console.error("❌ Failed to play Live API audio:", error)
      throw new Error(`Failed to play Live API audio: ${error.message}`)
    }
  }

  endInterview(): void {
    console.log("🔚 Ending interview...")
    this.active = false

    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop()
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close()
    }

    this.callbacks.onDisconnected()
  }

  isActive(): boolean {
    return this.active
  }

  getInterviewDuration(): number {
    return this.active ? Date.now() - this.startTime : 0
  }

  getRemainingTime(): number {
    if (!this.active) return 0
    const elapsed = Date.now() - this.startTime
    return Math.max(0, this.config.maxDuration - elapsed)
  }
}
