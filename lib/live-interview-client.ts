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
  private speechSynthesis: SpeechSynthesis | null = null

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
    this.speechSynthesis = window.speechSynthesis
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
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.mediaRecorder = new MediaRecorder(this.stream)

      // Test speech synthesis availability
      if (!this.speechSynthesis) {
        console.warn("⚠️ Speech synthesis not supported, will show text only")
      } else {
        // Load voices
        if (this.speechSynthesis.getVoices().length === 0) {
          await new Promise((resolve) => {
            this.speechSynthesis!.onvoiceschanged = resolve
            setTimeout(resolve, 1000) // Fallback timeout
          })
        }
      }

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
        // Try to get audio from API
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

          if (data.success) {
            console.log("🔊 Using Web Speech API for question audio...")
            await this.speakText(data.text || question)
            this.callbacks.onAudioReceived("speech-synthesis")
          } else {
            throw new Error(data.error || "API returned unsuccessful response")
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      } catch (apiError: any) {
        console.warn("⚠️ API call failed, speaking question directly:", apiError.message)
        // Fallback: speak the question directly
        await this.speakText(question)
        this.callbacks.onAudioReceived("speech-synthesis-fallback")
      }

      // Wait for user response
      setTimeout(() => {
        this.currentQuestionIndex++
        if (this.active) {
          this.askNextQuestion()
        }
      }, 25000) // 25 seconds to answer
    } catch (error: any) {
      console.error("❌ Failed to ask question:", error)

      // Try to continue with next question instead of failing completely
      if (
        this.active &&
        this.currentQuestionIndex < [...this.questions.technical, ...this.questions.behavioral].length - 1
      ) {
        console.log("🔄 Attempting to continue with next question...")
        this.currentQuestionIndex++
        setTimeout(() => {
          if (this.active) {
            this.askNextQuestion()
          }
        }, 2000)
      } else {
        this.callbacks.onError(`Interview error: ${error.message}`)
      }
    }
  }

  private async speakText(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.speechSynthesis) {
        console.log("📝 Speech synthesis not available, showing text only")
        resolve()
        return
      }

      // Cancel any ongoing speech
      this.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      // Configure voice settings
      const voices = this.speechSynthesis.getVoices()
      const preferredVoice =
        voices.find((voice) => voice.name.toLowerCase().includes("karen")) ||
        voices.find((voice) => voice.name.toLowerCase().includes("samantha")) ||
        voices.find((voice) => voice.name.toLowerCase().includes("female")) ||
        voices.find((voice) => voice.lang.startsWith("en-US")) ||
        voices.find((voice) => voice.lang.startsWith("en")) ||
        voices[0]

      if (preferredVoice) {
        utterance.voice = preferredVoice
        console.log(`🗣️ Using voice: ${preferredVoice.name} (${preferredVoice.lang})`)
      }

      utterance.rate = 0.85 // Slightly slower for clarity
      utterance.pitch = 1.0
      utterance.volume = 0.9

      utterance.onend = () => {
        console.log("✅ Speech completed")
        resolve()
      }

      utterance.onerror = (event) => {
        console.error("❌ Speech error:", event.error)
        // Don't reject, just resolve to continue the interview
        resolve()
      }

      console.log(`🗣️ Speaking: "${text.substring(0, 50)}..."`)
      this.speechSynthesis.speak(utterance)

      // Fallback timeout in case speech doesn't trigger events
      setTimeout(
        () => {
          if (utterance.pending || this.speechSynthesis?.speaking) {
            console.log("⏰ Speech timeout, continuing...")
            this.speechSynthesis?.cancel()
            resolve()
          }
        },
        Math.max(5000, text.length * 100),
      ) // Minimum 5 seconds, or 100ms per character
    })
  }

  endInterview(): void {
    console.log("🔚 Ending interview...")
    this.active = false

    // Stop any ongoing speech
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel()
    }

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
