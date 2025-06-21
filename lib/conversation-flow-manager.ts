export type ConversationState =
  | "initializing"
  | "assigning_personality"
  | "loading_intro"
  | "preloading_questions"
  | "ready_for_question"
  | "playing_question"
  | "waiting_to_listen"
  | "listening_for_response"
  | "processing_silence"
  | "preparing_next"
  | "interview_complete"
  | "paused"
  | "error"

export interface ConversationOptions {
  responseDelay: number
  listeningStartDelay: number
  silenceThreshold: number
  maxResponseTime: number
}

export interface ConversationCallbacks {
  onStateChange: (state: ConversationState) => void
  onQuestionChange: (questionIndex: number, total: number) => void
  onAudioProgress: (current: number, duration: number) => void
  onError: (error: string) => void
  onComplete: () => void
  onVolumeChange: (volume: number) => void
}

export interface InterviewQuestion {
  type: string
  text: string
  index: number
}

export interface QueueStatus {
  total: number
  ready: number
  loading: number
  current: number
}

export interface Personality {
  voice: string
  tone: string
}

export class ConversationFlowManager {
  private state: ConversationState = "initializing"
  private options: ConversationOptions
  private callbacks: ConversationCallbacks
  private questions: InterviewQuestion[] = []
  private currentQuestionIndex = 0
  private personality: Personality = { voice: "", tone: "" }
  private audioContext: AudioContext | null = null
  private mediaRecorder: MediaRecorder | null = null
  private audioQueue: Map<number, HTMLAudioElement> = new Map()
  private isDestroyed = false
  private volumeAnalyzer: AnalyserNode | null = null
  private volumeDataArray: Uint8Array | null = null
  private volumeAnimationFrame: number | null = null

  constructor(options: ConversationOptions, callbacks: ConversationCallbacks) {
    this.options = options
    this.callbacks = callbacks
  }

  async initialize(questions: InterviewQuestion[]): Promise<void> {
    try {
      this.questions = questions
      this.setState("assigning_personality")

      // Assign a random personality
      await this.assignPersonality()

      this.setState("preloading_questions")

      // Preload audio for questions
      await this.preloadQuestions()

      this.setState("ready_for_question")
    } catch (error: any) {
      this.handleError(`Initialization failed: ${error.message}`)
    }
  }

  async startConversation(): Promise<void> {
    try {
      if (this.state !== "ready_for_question") {
        throw new Error("Conversation not ready to start")
      }

      // Initialize audio context and microphone
      await this.initializeAudio()

      // Start with the first question
      this.currentQuestionIndex = 0
      await this.playCurrentQuestion()
    } catch (error: any) {
      this.handleError(`Failed to start conversation: ${error.message}`)
    }
  }

  pause(): void {
    if (this.state === "paused") return

    this.setState("paused")

    // Pause any playing audio
    this.audioQueue.forEach((audio) => {
      if (!audio.paused) {
        audio.pause()
      }
    })

    // Stop recording if active
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.pause()
    }
  }

  resume(): void {
    if (this.state !== "paused") return

    // Resume based on previous state
    this.setState("playing_question")

    // Resume audio if it was playing
    const currentAudio = this.audioQueue.get(this.currentQuestionIndex)
    if (currentAudio && currentAudio.paused) {
      currentAudio.play()
    }
  }

  skipQuestion(): void {
    if (this.state === "listening_for_response") {
      this.processResponse()
    }
  }

  destroy(): void {
    this.isDestroyed = true

    // Stop all audio
    this.audioQueue.forEach((audio) => {
      audio.pause()
      audio.src = ""
    })
    this.audioQueue.clear()

    // Stop recording
    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop()
    }

    // Close audio context
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close()
    }

    // Cancel animation frames
    if (this.volumeAnimationFrame) {
      cancelAnimationFrame(this.volumeAnimationFrame)
    }
  }

  getPersonality(): Personality {
    return this.personality
  }

  getQueueStatus(): QueueStatus {
    const total = this.questions.length
    const ready = this.audioQueue.size
    const loading = Math.max(0, total - ready)

    return {
      total,
      ready,
      loading,
      current: this.currentQuestionIndex,
    }
  }

  private setState(newState: ConversationState): void {
    if (this.isDestroyed) return

    this.state = newState
    this.callbacks.onStateChange(newState)
  }

  private handleError(error: string): void {
    console.error("ConversationFlowManager Error:", error)
    this.setState("error")
    this.callbacks.onError(error)
  }

  private async assignPersonality(): Promise<void> {
    try {
      // Simulate personality assignment
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const voices = ["Professional", "Friendly", "Analytical", "Supportive"]
      const tones = ["Formal", "Conversational", "Direct", "Encouraging"]

      this.personality = {
        voice: voices[Math.floor(Math.random() * voices.length)],
        tone: tones[Math.floor(Math.random() * tones.length)],
      }
    } catch (error: any) {
      throw new Error(`Failed to assign personality: ${error.message}`)
    }
  }

  private async preloadQuestions(): Promise<void> {
    try {
      // Wait for voices to be loaded
      if (speechSynthesis.getVoices().length === 0) {
        await new Promise((resolve) => {
          speechSynthesis.onvoiceschanged = resolve
          // Fallback timeout
          setTimeout(resolve, 1000)
        })
      }

      // Generate audio for each question
      for (let i = 0; i < this.questions.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 300)) // Stagger processing

        const question = this.questions[i]
        const audio = new Audio()
        audio.preload = "auto"

        // Generate TTS audio for the question
        await this.createQuestionAudio(audio, question.text)

        // Set up audio event listeners
        audio.addEventListener("loadedmetadata", () => {
          this.callbacks.onAudioProgress(0, audio.duration || 0)
        })

        audio.addEventListener("timeupdate", () => {
          this.callbacks.onAudioProgress(audio.currentTime || 0, audio.duration || 0)
        })

        audio.addEventListener("ended", () => {
          this.onAudioEnded()
        })

        this.audioQueue.set(i, audio)
      }
    } catch (error: any) {
      throw new Error(`Failed to preload questions: ${error.message}`)
    }
  }

  private async createQuestionAudio(audioElement: HTMLAudioElement, questionText: string): Promise<void> {
    try {
      // Check if speech synthesis is available
      if (!("speechSynthesis" in window)) {
        throw new Error("Speech synthesis not supported")
      }

      // Create speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(questionText)

      // Configure voice settings based on personality
      utterance.rate = 0.9 // Slightly slower for clarity
      utterance.pitch = 1.0
      utterance.volume = 0.8

      // Try to select an appropriate voice
      const voices = speechSynthesis.getVoices()
      if (voices.length > 0) {
        // Prefer English voices
        const englishVoices = voices.filter((voice) => voice.lang.startsWith("en"))
        if (englishVoices.length > 0) {
          // Select voice based on personality
          const voiceIndex = this.selectVoiceByPersonality(englishVoices)
          utterance.voice = englishVoices[voiceIndex]
        }
      }

      // Create audio using MediaRecorder to capture speech synthesis
      await this.synthesizeToAudio(utterance, audioElement)
    } catch (error: any) {
      console.warn("TTS failed, using fallback:", error.message)
      // Fallback to text display with silent audio
      await this.createFallbackAudio(audioElement, questionText, 4)
    }
  }

  private selectVoiceByPersonality(voices: SpeechSynthesisVoice[]): number {
    // Select voice based on assigned personality
    const { voice, tone } = this.personality

    if (voice === "Professional" || tone === "Formal") {
      // Prefer more formal-sounding voices
      const formalVoice = voices.find(
        (v) =>
          v.name.includes("Microsoft") ||
          v.name.includes("Google") ||
          v.name.includes("Alex") ||
          v.name.includes("Daniel"),
      )
      if (formalVoice) return voices.indexOf(formalVoice)
    }

    if (voice === "Friendly" || tone === "Conversational") {
      // Prefer warmer-sounding voices
      const friendlyVoice = voices.find(
        (v) =>
          v.name.includes("Samantha") ||
          v.name.includes("Karen") ||
          v.name.includes("Zira") ||
          v.name.includes("Susan"),
      )
      if (friendlyVoice) return voices.indexOf(friendlyVoice)
    }

    // Default to first available voice
    return 0
  }

  private async synthesizeToAudio(utterance: SpeechSynthesisUtterance, audioElement: HTMLAudioElement): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Create a temporary audio context for recording
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const destination = audioContext.createMediaStreamDestination()

        // Set up speech synthesis
        utterance.onstart = () => {
          console.log("🎙️ Speech synthesis started")
        }

        utterance.onend = () => {
          console.log("✅ Speech synthesis completed")
          resolve()
        }

        utterance.onerror = (event) => {
          console.error("❌ Speech synthesis error:", event.error)
          reject(new Error(`Speech synthesis failed: ${event.error}`))
        }

        // For now, we'll use a simpler approach - just speak and use timing
        speechSynthesis.speak(utterance)

        // Estimate duration and create a placeholder audio
        const estimatedDuration = this.estimateSpeechDuration(utterance.text)
        this.createTimedAudio(audioElement, estimatedDuration)
      } catch (error) {
        reject(error)
      }
    })
  }

  private estimateSpeechDuration(text: string): number {
    // Estimate speech duration based on text length and speech rate
    const wordsPerMinute = 150 // Average speaking rate
    const words = text.split(" ").length
    const minutes = words / wordsPerMinute
    const seconds = minutes * 60
    return Math.max(3, Math.ceil(seconds)) // Minimum 3 seconds
  }

  private createTimedAudio(audioElement: HTMLAudioElement, duration: number): void {
    // Create a simple timed audio element that tracks progress
    let startTime: number
    let currentTime = 0
    let isPlaying = false

    // Override play method
    const originalPlay = audioElement.play.bind(audioElement)
    audioElement.play = () => {
      return new Promise((resolve) => {
        isPlaying = true
        startTime = Date.now()

        const updateProgress = () => {
          if (!isPlaying) return

          currentTime = (Date.now() - startTime) / 1000

          // Dispatch timeupdate event
          const event = new Event("timeupdate")
          audioElement.dispatchEvent(event)

          if (currentTime >= duration) {
            isPlaying = false
            currentTime = duration

            // Dispatch ended event
            const endedEvent = new Event("ended")
            audioElement.dispatchEvent(endedEvent)
            resolve()
          } else {
            requestAnimationFrame(updateProgress)
          }
        }

        updateProgress()
      })
    }

    // Set duration property
    Object.defineProperty(audioElement, "duration", {
      get: () => duration,
    })

    // Set currentTime property
    Object.defineProperty(audioElement, "currentTime", {
      get: () => currentTime,
    })
  }

  private async createFallbackAudio(audioElement: HTMLAudioElement, text: string, duration: number): Promise<void> {
    // Create a fallback that shows the question text and plays silent audio
    console.log("📝 Fallback mode - Question text:", text)

    // Store the question text for display
    audioElement.setAttribute("data-question-text", text)

    // Create timed silent audio
    this.createTimedAudio(audioElement, duration)
  }

  private async initializeAudio(): Promise<void> {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Create audio context if not exists
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      // Set up volume analyzer
      const source = this.audioContext.createMediaStreamSource(stream)
      this.volumeAnalyzer = this.audioContext.createAnalyser()
      this.volumeAnalyzer.fftSize = 256
      this.volumeDataArray = new Uint8Array(this.volumeAnalyzer.frequencyBinCount)
      source.connect(this.volumeAnalyzer)

      // Set up media recorder
      this.mediaRecorder = new MediaRecorder(stream)

      this.mediaRecorder.ondataavailable = (event) => {
        // Handle recorded audio data
        console.log("Audio data available:", event.data.size)
      }

      this.mediaRecorder.onstop = () => {
        console.log("Recording stopped")
      }
    } catch (error: any) {
      throw new Error(`Failed to initialize audio: ${error.message}`)
    }
  }

  private async playCurrentQuestion(): Promise<void> {
    try {
      this.setState("playing_question")
      this.callbacks.onQuestionChange(this.currentQuestionIndex, this.questions.length)

      const audio = this.audioQueue.get(this.currentQuestionIndex)
      if (audio) {
        await audio.play()
      } else {
        // Simulate audio playback
        await new Promise((resolve) => setTimeout(resolve, 3000))
        this.onAudioEnded()
      }
    } catch (error: any) {
      this.handleError(`Failed to play question: ${error.message}`)
    }
  }

  private onAudioEnded(): void {
    this.setState("waiting_to_listen")

    setTimeout(() => {
      this.setState("listening_for_response")
      this.startListening()
    }, this.options.listeningStartDelay)
  }

  private startListening(): void {
    try {
      if (this.mediaRecorder && this.mediaRecorder.state === "inactive") {
        this.mediaRecorder.start()
      }

      // Start volume monitoring
      this.monitorVolume()

      // Set timeout for max response time
      setTimeout(() => {
        if (this.state === "listening_for_response") {
          this.processResponse()
        }
      }, this.options.maxResponseTime)
    } catch (error: any) {
      this.handleError(`Failed to start listening: ${error.message}`)
    }
  }

  private monitorVolume(): void {
    if (!this.volumeAnalyzer || !this.volumeDataArray) return

    const monitor = () => {
      if (this.state !== "listening_for_response" || this.isDestroyed) return

      this.volumeAnalyzer!.getByteFrequencyData(this.volumeDataArray!)

      // Calculate average volume
      let sum = 0
      for (let i = 0; i < this.volumeDataArray!.length; i++) {
        sum += this.volumeDataArray![i]
      }
      const average = sum / this.volumeDataArray!.length / 255

      this.callbacks.onVolumeChange(average)

      this.volumeAnimationFrame = requestAnimationFrame(monitor)
    }

    monitor()
  }

  private processResponse(): void {
    try {
      this.setState("processing_silence")

      // Stop recording
      if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
        this.mediaRecorder.stop()
      }

      // Cancel volume monitoring
      if (this.volumeAnimationFrame) {
        cancelAnimationFrame(this.volumeAnimationFrame)
        this.volumeAnimationFrame = null
      }

      // Process the response
      setTimeout(() => {
        this.moveToNextQuestion()
      }, this.options.responseDelay)
    } catch (error: any) {
      this.handleError(`Failed to process response: ${error.message}`)
    }
  }

  private moveToNextQuestion(): void {
    this.currentQuestionIndex++

    if (this.currentQuestionIndex >= this.questions.length) {
      this.setState("interview_complete")
      this.callbacks.onComplete()
    } else {
      this.setState("preparing_next")
      setTimeout(() => {
        this.playCurrentQuestion()
      }, 1000)
    }
  }
}
