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
        throw new Error("Speech synthesis not supported in this browser")
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
      console.log(
        `❓ Asking question ${this.currentQuestionIndex + 1}/${allQuestions.length}: ${question.substring(0, 100)}...`,
      )

      // Generate audio for the question
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

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("❌ Non-JSON response:", text.substring(0, 200))
        throw new Error("Server returned non-JSON response")
      }

      const data = await response.json()

      if (data.success) {
        if (data.audioData) {
          // Use provided audio data
          console.log("🔊 Playing generated audio...")
          await this.playAudio(data.audioData)
        } else {
          // Use Web Speech API as fallback
          console.log("🔊 Using Web Speech API for audio...")
          await this.speakText(data.text || question)
        }

        this.callbacks.onAudioReceived(data.audioData || "speech-synthesis")

        // Wait for user response
        setTimeout(() => {
          this.currentQuestionIndex++
          if (this.active) {
            this.askNextQuestion()
          }
        }, 20000) // 20 seconds to answer
      } else {
        throw new Error(data.error || "Failed to generate audio")
      }
    } catch (error: any) {
      console.error("❌ Failed to ask question:", error)
      this.callbacks.onError(`Failed to ask question: ${error.message}`)
    }
  }

  private async speakText(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.speechSynthesis) {
        reject(new Error("Speech synthesis not available"))
        return
      }

      // Cancel any ongoing speech
      this.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      // Configure voice settings
      const voices = this.speechSynthesis.getVoices()
      const preferredVoice =
        voices.find(
          (voice) =>
            voice.name.toLowerCase().includes("female") ||
            voice.name.toLowerCase().includes("karen") ||
            voice.name.toLowerCase().includes("samantha"),
        ) ||
        voices.find((voice) => voice.lang.startsWith("en")) ||
        voices[0]

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.rate = 0.9 // Slightly slower for clarity
      utterance.pitch = 1.0
      utterance.volume = 0.8

      utterance.onend = () => {
        console.log("✅ Speech synthesis completed")
        resolve()
      }

      utterance.onerror = (event) => {
        console.error("❌ Speech synthesis error:", event.error)
        reject(new Error(`Speech synthesis failed: ${event.error}`))
      }

      console.log(`🗣️ Speaking: "${text.substring(0, 50)}..."`)
      this.speechSynthesis.speak(utterance)
    })
  }

  private async playAudio(audioData: string): Promise<void> {
    try {
      const audioBuffer = Uint8Array.from(atob(audioData), (c) => c.charCodeAt(0))
      const audioBlob = new Blob([audioBuffer], { type: "audio/wav" })
      const audioUrl = URL.createObjectURL(audioBlob)

      const audio = new Audio(audioUrl)

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          console.log("✅ Audio playback completed")
          resolve()
        }

        audio.onerror = (e) => {
          URL.revokeObjectURL(audioUrl)
          console.error("❌ Audio playback failed:", e)
          reject(new Error("Audio playback failed"))
        }

        audio.play().catch((playError) => {
          URL.revokeObjectURL(audioUrl)
          console.error("❌ Audio play() failed:", playError)
          reject(playError)
        })
      })
    } catch (error: any) {
      console.error("❌ Failed to play audio:", error)
      throw new Error(`Failed to play audio: ${error.message}`)
    }
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
