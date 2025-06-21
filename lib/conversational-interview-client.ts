export interface ConversationalInterviewConfig {
  voice: "Puck" | "Charon" | "Kore" | "Fenrir" | "Aoede" | "Leda" | "Orus" | "Zephyr"
  maxDuration: number
  timeWarningAt: number
  silenceThreshold: number // Audio level threshold for silence detection
  silenceDuration: number // Duration of silence before considering user finished (ms)
}

export interface ConversationalInterviewCallbacks {
  onConnected: () => void
  onDisconnected: () => void
  onError: (error: string) => void
  onTimeWarning: (remainingMinutes: number) => void
  onTimeUp: () => void
  onInterviewComplete: () => void
  onQuestionStarted: (question: string, index: number, total: number) => void
  onQuestionAudioPlaying: () => void
  onQuestionAudioComplete: () => void
  onUserSpeaking: () => void
  onUserSilence: () => void
  onUserResponseComplete: (duration: number) => void
}

interface PreGeneratedQuestion {
  text: string
  audioData: string
  index: number
}

export class ConversationalInterviewClient {
  private jobId: string
  private resumeId?: string
  private questions: any
  private config: ConversationalInterviewConfig
  private callbacks: ConversationalInterviewCallbacks
  private active = false
  private startTime = 0
  private audioContext: AudioContext | null = null
  private mediaRecorder: MediaRecorder | null = null
  private currentQuestionIndex = 0
  private timeoutId: NodeJS.Timeout | null = null
  private stream: MediaStream | null = null
  private preGeneratedQuestions: PreGeneratedQuestion[] = []
  private isGeneratingAudio = false
  private isPlayingQuestion = false
  private isListeningForResponse = false
  private silenceTimer: NodeJS.Timeout | null = null
  private audioAnalyzer: AnalyserNode | null = null
  private microphoneSource: MediaStreamAudioSourceNode | null = null
  private voiceActivityMonitor: NodeJS.Timeout | null = null

  private constructor(
    jobId: string,
    resumeId: string | undefined,
    questions: any,
    config: ConversationalInterviewConfig,
    callbacks: ConversationalInterviewCallbacks,
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
    config: ConversationalInterviewConfig,
    callbacks: ConversationalInterviewCallbacks,
  ): Promise<ConversationalInterviewClient> {
    const client = new ConversationalInterviewClient(jobId, resumeId, questions, config, callbacks)
    await client.initialize()
    return client
  }

  private async initialize(): Promise<void> {
    try {
      // Initialize audio context for playback and analysis
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Request microphone access for recording user responses
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.mediaRecorder = new MediaRecorder(this.stream)

      // Set up audio analysis for voice activity detection
      this.setupVoiceActivityDetection()

      console.log("✅ ConversationalInterviewClient initialized successfully")
      this.callbacks.onConnected()
    } catch (error: any) {
      console.error("❌ Failed to initialize ConversationalInterviewClient:", error)
      this.callbacks.onError(`Failed to initialize: ${error.message}`)
    }
  }

  private setupVoiceActivityDetection(): void {
    if (!this.audioContext || !this.stream) return

    // Create audio analyzer for voice activity detection
    this.microphoneSource = this.audioContext.createMediaStreamSource(this.stream)
    this.audioAnalyzer = this.audioContext.createAnalyser()
    this.audioAnalyzer.fftSize = 256
    this.audioAnalyzer.smoothingTimeConstant = 0.8

    this.microphoneSource.connect(this.audioAnalyzer)

    console.log("✅ Voice activity detection setup complete")
  }

  async startInterview(): Promise<void> {
    try {
      this.active = true
      this.startTime = Date.now()
      this.currentQuestionIndex = 0

      console.log("🎙️ Starting conversational interview...")

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

      // Pre-generate audio for all questions
      await this.preGenerateAllQuestionAudio()

      // Start the conversation
      await this.playNextQuestion()
    } catch (error: any) {
      console.error("❌ Failed to start interview:", error)
      this.callbacks.onError(`Failed to start interview: ${error.message}`)
    }
  }

  private async preGenerateAllQuestionAudio(): Promise<void> {
    try {
      this.isGeneratingAudio = true
      const allQuestions = [...this.questions.technical, ...this.questions.behavioral]

      console.log(`🎵 Pre-generating audio for ${allQuestions.length} questions...`)

      for (let i = 0; i < allQuestions.length; i++) {
        const question = allQuestions[i]
        console.log(`🎵 Generating audio for question ${i + 1}/${allQuestions.length}`)

        try {
          const audioData = await this.generateQuestionAudio(question)
          this.preGeneratedQuestions.push({
            text: question,
            audioData: audioData,
            index: i,
          })
        } catch (error) {
          console.error(`❌ Failed to generate audio for question ${i + 1}:`, error)
          // Continue with other questions even if one fails
        }
      }

      this.isGeneratingAudio = false
      console.log(`✅ Pre-generated audio for ${this.preGeneratedQuestions.length} questions`)
    } catch (error: any) {
      this.isGeneratingAudio = false
      throw new Error(`Failed to pre-generate question audio: ${error.message}`)
    }
  }

  private async generateQuestionAudio(questionText: string): Promise<string> {
    const response = await fetch("/api/interview/generate-real-audio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        text: questionText,
        voice: this.config.voice,
        tone: "professional",
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.success && data.audioData) {
      return data.audioData
    } else {
      throw new Error(data.error || "Failed to generate audio")
    }
  }

  private async playNextQuestion(): Promise<void> {
    try {
      if (this.currentQuestionIndex >= this.preGeneratedQuestions.length) {
        console.log("🎉 All questions completed")
        this.callbacks.onInterviewComplete()
        this.endInterview()
        return
      }

      const questionData = this.preGeneratedQuestions[this.currentQuestionIndex]
      const questionNumber = this.currentQuestionIndex + 1
      const totalQuestions = this.preGeneratedQuestions.length

      console.log(`❓ Playing question ${questionNumber}/${totalQuestions}`)

      // Notify UI about the current question
      this.callbacks.onQuestionStarted(questionData.text, questionNumber, totalQuestions)

      // Play the pre-generated audio
      this.isPlayingQuestion = true
      this.callbacks.onQuestionAudioPlaying()

      await this.playAudioData(questionData.audioData)

      this.isPlayingQuestion = false
      this.callbacks.onQuestionAudioComplete()

      // Start listening for user response
      this.startListeningForResponse()
    } catch (error: any) {
      console.error("❌ Failed to play question:", error)
      this.callbacks.onError(`Failed to play question: ${error.message}`)
    }
  }

  private async playAudioData(audioData: string): Promise<void> {
    try {
      if (!this.audioContext) {
        throw new Error("Audio context not initialized")
      }

      // Decode base64 audio data
      const audioBuffer = Uint8Array.from(atob(audioData), (c) => c.charCodeAt(0))

      // Convert PCM data to AudioBuffer
      const sampleRate = 24000
      const numSamples = audioBuffer.length / 2

      const audioContextBuffer = this.audioContext.createBuffer(1, numSamples, sampleRate)
      const channelData = audioContextBuffer.getChannelData(0)

      // Convert 16-bit PCM to float32
      for (let i = 0; i < numSamples; i++) {
        const sample = (audioBuffer[i * 2] | (audioBuffer[i * 2 + 1] << 8)) / 32768.0
        channelData[i] = sample
      }

      // Play the audio
      const source = this.audioContext.createBufferSource()
      source.buffer = audioContextBuffer
      source.connect(this.audioContext.destination)

      return new Promise((resolve, reject) => {
        source.onended = () => {
          console.log("✅ Question audio playback completed")
          resolve()
        }

        source.onerror = (e) => {
          console.error("❌ Question audio playback failed:", e)
          reject(new Error("Audio playback failed"))
        }

        source.start()
      })
    } catch (error: any) {
      console.error("❌ Failed to play audio data:", error)
      throw new Error(`Failed to play audio data: ${error.message}`)
    }
  }

  private startListeningForResponse(): void {
    if (!this.audioAnalyzer) {
      console.error("❌ Audio analyzer not available")
      return
    }

    this.isListeningForResponse = true
    const responseStartTime = Date.now()
    let isSpeaking = false
    let lastSpeechTime = 0

    console.log("👂 Started listening for user response...")

    // Start voice activity monitoring
    this.voiceActivityMonitor = setInterval(() => {
      if (!this.audioAnalyzer || !this.isListeningForResponse) return

      const bufferLength = this.audioAnalyzer.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      this.audioAnalyzer.getByteFrequencyData(dataArray)

      // Calculate average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength
      const currentTime = Date.now()

      if (average > this.config.silenceThreshold) {
        // User is speaking
        if (!isSpeaking) {
          isSpeaking = true
          console.log("🗣️ User started speaking")
          this.callbacks.onUserSpeaking()
        }
        lastSpeechTime = currentTime

        // Clear any existing silence timer
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer)
          this.silenceTimer = null
        }
      } else {
        // Silence detected
        if (isSpeaking && !this.silenceTimer) {
          console.log("🤫 Silence detected, starting timer...")
          this.callbacks.onUserSilence()

          // Start silence timer
          this.silenceTimer = setTimeout(() => {
            if (this.isListeningForResponse) {
              const responseDuration = Date.now() - responseStartTime
              console.log(`✅ User response complete (${responseDuration}ms)`)
              this.stopListeningForResponse(responseDuration)
            }
          }, this.config.silenceDuration)
        }
      }
    }, 100) // Check every 100ms
  }

  private stopListeningForResponse(responseDuration: number): void {
    this.isListeningForResponse = false

    if (this.voiceActivityMonitor) {
      clearInterval(this.voiceActivityMonitor)
      this.voiceActivityMonitor = null
    }

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer)
      this.silenceTimer = null
    }

    console.log("👂 Stopped listening for user response")
    this.callbacks.onUserResponseComplete(responseDuration)

    // Move to next question after a brief pause
    setTimeout(() => {
      this.currentQuestionIndex++
      if (this.active) {
        this.playNextQuestion()
      }
    }, 1000) // 1 second pause between questions
  }

  endInterview(): void {
    console.log("🔚 Ending conversational interview...")
    this.active = false
    this.isListeningForResponse = false

    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer)
      this.silenceTimer = null
    }

    if (this.voiceActivityMonitor) {
      clearInterval(this.voiceActivityMonitor)
      this.voiceActivityMonitor = null
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop()
    }

    if (this.microphoneSource) {
      this.microphoneSource.disconnect()
      this.microphoneSource = null
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

  getCurrentQuestionIndex(): number {
    return this.currentQuestionIndex
  }

  getTotalQuestions(): number {
    return this.preGeneratedQuestions.length
  }

  isGeneratingAudio(): boolean {
    return this.isGeneratingAudio
  }

  isPlayingQuestion(): boolean {
    return this.isPlayingQuestion
  }

  isListening(): boolean {
    return this.isListeningForResponse
  }
}
