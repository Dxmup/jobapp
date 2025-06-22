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
      // Simulate audio generation and preloading
      for (let i = 0; i < this.questions.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate processing time

        // Create a simple mock audio element
        const audio = new Audio()
        audio.preload = "auto"

        // Create a simple silent audio using Web Audio API instead of data URL
        await this.createSilentAudio(audio, 3) // 3 seconds of silence

        // Set up audio event listeners
        audio.addEventListener("loadedmetadata", () => {
          this.callbacks.onAudioProgress(0, audio.duration)
        })

        audio.addEventListener("timeupdate", () => {
          this.callbacks.onAudioProgress(audio.currentTime, audio.duration)
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

  private async createSilentAudio(audioElement: HTMLAudioElement, duration: number): Promise<void> {
    try {
      // Create a simple silent audio buffer
      const sampleRate = 44100
      const numChannels = 1
      const length = sampleRate * duration

      // Create audio context if needed
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      // Create buffer
      const buffer = this.audioContext.createBuffer(numChannels, length, sampleRate)

      // Fill with silence (zeros)
      for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel)
        for (let i = 0; i < length; i++) {
          channelData[i] = 0
        }
      }

      // Convert buffer to blob and set as audio source
      const blob = await this.audioBufferToBlob(buffer)
      audioElement.src = URL.createObjectURL(blob)
    } catch (error: any) {
      // Fallback: use a minimal data URL for silence
      audioElement.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAAAQBcAAEAfAAABAAgAZGF0YQAAAAA="
    }
  }

  private async audioBufferToBlob(buffer: AudioBuffer): Promise<Blob> {
    return new Promise((resolve) => {
      const length = buffer.length
      const arrayBuffer = new ArrayBuffer(44 + length * 2)
      const view = new DataView(arrayBuffer)

      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i))
        }
      }

      writeString(0, "RIFF")
      view.setUint32(4, 36 + length * 2, true)
      writeString(8, "WAVE")
      writeString(12, "fmt ")
      view.setUint32(16, 16, true)
      view.setUint16(20, 1, true)
      view.setUint16(22, 1, true)
      view.setUint32(24, buffer.sampleRate, true)
      view.setUint32(28, buffer.sampleRate * 2, true)
      view.setUint16(32, 2, true)
      view.setUint16(34, 16, true)
      writeString(36, "data")
      view.setUint32(40, length * 2, true)

      // Convert float samples to 16-bit PCM
      const channelData = buffer.getChannelData(0)
      let offset = 44
      for (let i = 0; i < length; i++) {
        const sample = Math.max(-1, Math.min(1, channelData[i]))
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
        offset += 2
      }

      resolve(new Blob([arrayBuffer], { type: "audio/wav" }))
    })
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
