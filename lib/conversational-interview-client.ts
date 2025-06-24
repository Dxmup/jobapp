import { AudioFormatAnalyzer, type AudioFormatInfo } from "./audio-format-analyzer"

export interface ConversationalInterviewConfig {
  voice: "Puck" | "Charon" | "Kore" | "Fenrir" | "Aoede" | "Leda" | "Orus" | "Zephyr"
  maxDuration: number
  timeWarningAt: number
  silenceThreshold: number // Audio level threshold for silence detection
  silenceDuration: number // Duration of silence before considering user finished (ms)
  queueSize: number // Number of questions to keep in queue
  interviewType?: "phone-screener" | "first-interview"
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
  onAudioGenerationProgress: (current: number, total: number) => void
  onAudioFormatInfo?: (formatInfo: AudioFormatInfo) => void
}

interface QueuedQuestion {
  text: string
  audioData?: string
  audioFormatInfo?: AudioFormatInfo
  index: number
  isGenerating?: boolean
  abortController?: AbortController
}

// Add this constant for interviewer names
const INTERVIEWER_NAMES = ["Alex", "Jordan", "Taylor", "Casey", "Morgan", "Jamie", "Riley", "Avery", "Cameron"]

export class ConversationalInterviewClient {
  private jobId: string
  private resumeId?: string
  private questions: any
  private jobContext: any
  private resumeContext: any
  private config: ConversationalInterviewConfig
  private callbacks: ConversationalInterviewCallbacks
  private active = false
  private startTime = 0
  private audioContext: AudioContext | null = null
  private mediaRecorder: MediaRecorder | null = null
  private currentQuestionIndex = 0
  private timeoutId: NodeJS.Timeout | null = null
  private stream: MediaStream | null = null
  private questionQueue: QueuedQuestion[] = []
  private allQuestions: string[] = []
  private isPlayingQuestion = false
  private isListeningForResponse = false
  private silenceTimer: NodeJS.Timeout | null = null
  private audioAnalyzer: AnalyserNode | null = null
  private microphoneSource: MediaStreamAudioSourceNode | null = null
  private voiceActivityMonitor: NodeJS.Timeout | null = null
  private generatingAudioCount = 0
  private totalAudioMemoryMB = 0
  private interviewerName: string
  private activeRequests: Set<AbortController> = new Set()

  private constructor(
    jobId: string,
    resumeId: string | undefined,
    questions: any,
    jobContext: any,
    resumeContext: any,
    config: ConversationalInterviewConfig,
    callbacks: ConversationalInterviewCallbacks,
  ) {
    this.jobId = jobId
    this.resumeId = resumeId
    this.questions = questions
    this.jobContext = jobContext
    this.config = config
    this.callbacks = callbacks

    // Select random interviewer name
    this.interviewerName = INTERVIEWER_NAMES[Math.floor(Math.random() * INTERVIEWER_NAMES.length)]

    // Use the provided userFirstName directly, with fallback
    const candidateName =
      resumeContext?.name &&
      resumeContext.name !== "undefined" &&
      resumeContext.name !== "liveInterview candidate" &&
      resumeContext.name !== "interviewPrep candidate" &&
      resumeContext.name.trim()
        ? resumeContext.name.trim()
        : "conversationalClient candidate" // Changed from "clientConstructor candidate"

    this.resumeContext = {
      ...resumeContext,
      name: candidateName,
      interviewerName: this.interviewerName,
    }

    console.log(`🎭 Selected interviewer: ${this.interviewerName}`)
    console.log(`👤 Using candidate name: ${candidateName}`)
  }

  static async create(
    jobId: string,
    resumeId: string | undefined,
    questions: any,
    jobContext: any,
    resumeContext: any,
    config: ConversationalInterviewConfig,
    callbacks: ConversationalInterviewCallbacks,
  ): Promise<ConversationalInterviewClient> {
    const client = new ConversationalInterviewClient(
      jobId,
      resumeId,
      questions,
      jobContext,
      resumeContext,
      config,
      callbacks,
    )
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

      // Prepare all questions with introduction
      const introductionText = this.createIntroductionText()
      this.allQuestions = [introductionText, ...this.questions.technical, ...this.questions.behavioral]
      console.log(`📝 Prepared ${this.allQuestions.length} questions for interview (including introduction)`)
      console.log("🎵 Expected audio format: 24kHz, 16-bit, Mono PCM")

      console.log("✅ ConversationalInterviewClient initialized successfully")
      this.callbacks.onConnected()
    } catch (error: any) {
      console.error("❌ Failed to initialize ConversationalInterviewClient:", error)
      this.callbacks.onError(`Failed to initialize: ${error.message}`)
    }
  }

  private createIntroductionText(): string {
    const applicantName = this.resumeContext?.name || "createIntroduction candidate" // Changed from "introductionText candidate"
    const companyName = this.jobContext?.company || "our company"
    const positionTitle = this.jobContext?.title || "this position"
    const durationMinutes = Math.round(this.config.maxDuration / (60 * 1000))

    return `Hello ${applicantName}, this is ${this.interviewerName} calling from ${companyName}. Thank you for taking the time to speak with me today about the ${positionTitle} role. I hope you're doing well. Before we dive into the questions, I want to let you know this should take about ${durationMinutes} minutes, and I'm excited to learn more about your background and experience. Are you ready to begin?`
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

      // Initialize the question queue with first batch
      await this.initializeQuestionQueue()

      // Start the conversation
      await this.playNextQuestion()
    } catch (error: any) {
      console.error("❌ Failed to start interview:", error)
      this.callbacks.onError(`Failed to start interview: ${error.message}`)
    }
  }

  private async initializeQuestionQueue(): Promise<void> {
    try {
      console.log(`🔄 Initializing question queue with ${this.config.queueSize} questions...`)

      // Add first batch of questions to queue
      const initialBatchSize = Math.min(this.config.queueSize, this.allQuestions.length)

      for (let i = 0; i < initialBatchSize; i++) {
        this.questionQueue.push({
          text: this.allQuestions[i],
          index: i,
          isGenerating: false,
        })
      }

      // Start generating audio for the first few questions
      await this.generateNextQueuedAudio()

      console.log(`✅ Question queue initialized with ${this.questionQueue.length} questions`)
    } catch (error: any) {
      throw new Error(`Failed to initialize question queue: ${error.message}`)
    }
  }

  private async generateNextQueuedAudio(): Promise<void> {
    // Find the next question that needs audio generation
    const questionToGenerate = this.questionQueue.find((q) => !q.audioData && !q.isGenerating)

    if (!questionToGenerate) {
      console.log("📭 No more questions need audio generation in current queue")
      return
    }

    try {
      questionToGenerate.isGenerating = true
      this.generatingAudioCount++

      // Create abort controller for this request
      const abortController = new AbortController()
      questionToGenerate.abortController = abortController
      this.activeRequests.add(abortController)

      console.log(
        `🎵 Generating audio for question ${questionToGenerate.index + 1}: "${questionToGenerate.text.substring(0, 50)}..."`,
      )

      this.callbacks.onAudioGenerationProgress(this.generatingAudioCount, this.config.queueSize)

      const audioData = await this.generateQuestionAudio(
        questionToGenerate.text,
        questionToGenerate.index === 0,
        abortController,
      )

      // Check if request was aborted
      if (abortController.signal.aborted) {
        console.log(`🚫 Audio generation aborted for question ${questionToGenerate.index + 1}`)
        return
      }

      questionToGenerate.audioData = audioData
      questionToGenerate.isGenerating = false

      // Analyze the received audio format
      const formatInfo = AudioFormatAnalyzer.analyzeReceivedAudio(audioData)
      const validation = AudioFormatAnalyzer.validateAudioFormat(audioData)

      console.log(`📊 Audio format for question ${questionToGenerate.index + 1}:`, formatInfo)

      if (!validation.isValid) {
        console.warn(`⚠️ Audio validation issues:`, validation.issues)
        console.log(`💡 Recommendations:`, validation.recommendations)
      }

      questionToGenerate.audioFormatInfo = formatInfo
      // Track total memory usage
      this.totalAudioMemoryMB += formatInfo.sizeInMB

      // Notify callback with format info
      if (this.callbacks.onAudioFormatInfo) {
        this.callbacks.onAudioFormatInfo(formatInfo)
      }

      console.log(
        `✅ Audio generated for question ${questionToGenerate.index + 1} (${formatInfo.estimatedDuration}s, ${formatInfo.sizeInMB}MB)`,
      )

      // Remove from active requests
      this.activeRequests.delete(abortController)

      // Continue generating audio for other questions in the background
      setTimeout(() => {
        if (this.active) {
          this.generateNextQueuedAudio()
        }
      }, 100) // Small delay to prevent overwhelming the API
    } catch (error: any) {
      console.error(`❌ Failed to generate audio for question ${questionToGenerate.index + 1}:`, error)
      questionToGenerate.isGenerating = false

      // Remove from active requests
      if (questionToGenerate.abortController) {
        this.activeRequests.delete(questionToGenerate.abortController)
      }

      // Continue with other questions even if one fails
      setTimeout(() => {
        if (this.active) {
          this.generateNextQueuedAudio()
        }
      }, 1000)
    }
  }

  private async playNextQuestion(): Promise<void> {
    try {
      if (this.currentQuestionIndex >= this.allQuestions.length) {
        console.log("🎉 All questions completed")
        await this.playClosingStatement()
        this.callbacks.onInterviewComplete()
        this.endInterview()
        return
      }

      // Find the current question in the queue
      let currentQuestion = this.questionQueue.find((q) => q.index === this.currentQuestionIndex)

      if (!currentQuestion) {
        // Question not in queue yet, add it
        currentQuestion = {
          text: this.allQuestions[this.currentQuestionIndex],
          index: this.currentQuestionIndex,
          isGenerating: false,
        }
        this.questionQueue.push(currentQuestion)
      }

      const questionNumber = this.currentQuestionIndex + 1
      const totalQuestions = this.allQuestions.length
      const isIntroduction = this.currentQuestionIndex === 0

      console.log(`❓ Playing ${isIntroduction ? "introduction" : "question"} ${questionNumber}/${totalQuestions}`)

      // Notify UI about the current question
      this.callbacks.onQuestionStarted(currentQuestion.text, questionNumber, totalQuestions)

      // Wait for audio to be ready if it's still generating
      if (!currentQuestion.audioData) {
        if (!currentQuestion.isGenerating) {
          // Start generating audio for this question
          currentQuestion.isGenerating = true
          console.log(
            `🎵 Generating audio on-demand for ${isIntroduction ? "introduction" : "question"} ${questionNumber}`,
          )
          try {
            const abortController = new AbortController()
            currentQuestion.abortController = abortController
            this.activeRequests.add(abortController)

            currentQuestion.audioData = await this.generateQuestionAudio(
              currentQuestion.text,
              isIntroduction,
              abortController,
            )
            currentQuestion.isGenerating = false

            this.activeRequests.delete(abortController)
          } catch (error) {
            console.error(
              `❌ Failed to generate audio for ${isIntroduction ? "introduction" : "question"} ${questionNumber}:`,
              error,
            )
            this.callbacks.onError(
              `Failed to generate audio for ${isIntroduction ? "introduction" : "question"} ${questionNumber}`,
            )
            return
          }
        } else {
          // Wait for audio generation to complete
          console.log(
            `⏳ Waiting for audio generation to complete for ${isIntroduction ? "introduction" : "question"} ${questionNumber}`,
          )
          while (currentQuestion.isGenerating && this.active) {
            await new Promise((resolve) => setTimeout(resolve, 100))
          }
        }
      }

      if (!currentQuestion.audioData) {
        console.error(
          `❌ No audio data available for ${isIntroduction ? "introduction" : "question"} ${questionNumber}`,
        )
        this.callbacks.onError(
          `No audio data available for ${isIntroduction ? "introduction" : "question"} ${questionNumber}`,
        )
        return
      }

      // Play the audio
      this.isPlayingQuestion = true
      this.callbacks.onQuestionAudioPlaying()

      await this.playAudioData(currentQuestion.audioData)

      this.isPlayingQuestion = false
      this.callbacks.onQuestionAudioComplete()

      // Add next questions to queue if needed
      this.maintainQueue()

      // Start listening for user response
      this.startListeningForResponse()
    } catch (error: any) {
      console.error("❌ Failed to play question:", error)
      this.callbacks.onError(`Failed to play question: ${error.message}`)
    }
  }

  private async generateQuestionAudio(
    questionText: string,
    isIntroduction = false,
    abortController?: AbortController,
  ): Promise<string> {
    const prompt = isIntroduction
      ? this.createIntroductionPrompt(questionText)
      : this.createQuestionPrompt(questionText)

    const response = await fetch("/api/interview/generate-real-audio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        text: prompt,
        voice: this.config.voice,
        tone: "professional",
        jobContext: this.jobContext,
        resumeContext: this.resumeContext,
      }),
      signal: abortController?.signal,
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

  private createIntroductionPrompt(introText: string): string {
    const phoneScreenerInstructions =
      this.config.interviewType === "phone-screener"
        ? `

🚨 CRITICAL: THIS IS A PHONE SCREENING - NOT A FULL INTERVIEW 🚨

The questions you'll be asking are designed for full interviews, but you MUST adapt them for a brief 15-minute phone screening:

- Ask simplified, high-level versions of questions
- Focus on basic qualifications and interest level
- Expect brief 30-60 second answers
- Skip detailed behavioral examples
- Ask "Do you have experience with..." instead of "Tell me about a time..."
- Keep it conversational but efficient

`
        : ""

    return `ROLE: You are ${this.interviewerName}, a professional phone interviewer from ${this.jobContext?.company || "the company"}.
${phoneScreenerInstructions}
INSTRUCTION: Deliver this introduction naturally and warmly as if starting a phone interview. Speak clearly and professionally.

INTRODUCTION: "${introText}"

DELIVERY REQUIREMENTS:
1. Speak this introduction with a warm, welcoming tone
2. Include natural pauses and inflection
3. Sound genuinely pleased to be speaking with the candidate
4. DO NOT include any stage directions, parenthetical instructions, or descriptions like "(pause)", "(short pause)", "small pause", etc.
5. DO NOT narrate your actions - only speak the actual words you would say

OUTPUT: Speak the introduction directly without any stage directions or descriptions of how to speak it.`
  }

  private createQuestionPrompt(questionText: string): string {
    const phoneScreenerInstructions =
      this.config.interviewType === "phone-screener"
        ? `

🚨 CRITICAL: THIS IS A PHONE SCREENING - NOT A FULL INTERVIEW 🚨

You MUST completely transform the provided question to be appropriate for a 15-minute phone screening. The original question is designed for in-depth interviews but you need to make it screening-appropriate.

MANDATORY ADAPTATIONS:
1. SHORTEN: Convert multi-part questions into single, simple questions
2. SCREEN-FOCUS: Ask about basic qualifications, not detailed examples
3. HIGH-LEVEL: Ask "Do you have experience with X?" instead of "Tell me about a time when..."
4. BRIEF: Expect 30-60 second answers, not 3-5 minute stories
5. QUALIFYING: Focus on yes/no qualifications and basic interest level

TRANSFORMATION EXAMPLES:
❌ WRONG (Full Interview): "Tell me about a challenging project where you had to overcome significant technical obstacles. Walk me through your problem-solving process, the stakeholders involved, and the final outcome."
✅ CORRECT (Phone Screen): "Do you have experience working on challenging technical projects? Can you briefly mention one example?"

❌ WRONG (Full Interview): "Describe a situation where you had to work with a difficult team member. How did you handle the conflict and what was the resolution?"
✅ CORRECT (Phone Screen): "How do you typically handle disagreements with team members?"

❌ WRONG (Full Interview): "Walk me through your approach to system design for a large-scale application, including your considerations for scalability, reliability, and performance."
✅ CORRECT (Phone Screen): "Do you have experience with system design for large applications?"

REMEMBER: This is a SCREENING to determine basic fit - save detailed behavioral and technical deep-dives for later rounds!

`
        : ""

    return `ROLE: You are ${this.interviewerName}, a professional phone interviewer conducting a ${this.config.interviewType === "phone-screener" ? "screening interview" : "first-round interview"} for ${this.jobContext?.title || "this position"} at ${this.jobContext?.company || "the company"}.
${phoneScreenerInstructions}
INSTRUCTION: Ask this interview question naturally and professionally. Speak as if you're genuinely interested in hearing the candidate's response.

QUESTION: "${questionText}"

DELIVERY REQUIREMENTS:
1. Ask this question with a professional, encouraging tone
2. Include natural pauses and speak clearly for phone audio quality
3. Sound engaged and interested in their response
4. DO NOT include any stage directions, parenthetical instructions, or descriptions like "(pause)", "(short pause)", "small pause", etc.
5. DO NOT narrate your actions - only speak the actual words you would say

OUTPUT: Ask the question directly without any stage directions or descriptions.`
  }

  private async playClosingStatement(): Promise<void> {
    const applicantName = this.resumeContext?.name || "playClosing candidate" // Changed from "there"
    const companyName = this.jobContext?.company || "our company"

    const closingText = `${applicantName}, thank you so much for taking the time to speak with me today. I really enjoyed learning about your experience and background. The next step in our process is a follow-up interview with the hiring manager, and you can expect to hear from us within 3 to 5 business days. Do you have any questions about the role, ${companyName}, or our interview process before we wrap up? Thank you again, and have a wonderful rest of your day!`

    const closingPrompt = `ROLE: You are ${this.interviewerName}, a professional phone interviewer concluding a screening interview.

INSTRUCTION: Deliver this closing statement naturally and professionally as if ending a phone interview.

CLOSING: "${closingText}"

DELIVERY REQUIREMENTS:
1. Speak with a warm, professional tone
2. Sound genuinely appreciative of their time
3. Speak clearly for phone audio quality
4. DO NOT include any stage directions, parenthetical instructions, or descriptions like "(pause)", "(short pause)", "small pause", etc.
5. DO NOT narrate your actions - only speak the actual words you would say

OUTPUT: Speak the closing statement directly without any stage directions or descriptions.`

    try {
      console.log("🎬 Playing closing statement...")
      const abortController = new AbortController()
      this.activeRequests.add(abortController)

      const audioData = await this.generateQuestionAudio(closingPrompt, false, abortController)

      this.activeRequests.delete(abortController)

      this.isPlayingQuestion = true
      await this.playAudioData(audioData)
      this.isPlayingQuestion = false

      console.log("✅ Closing statement completed")
    } catch (error) {
      console.error("❌ Failed to play closing statement:", error)
    }
  }

  private maintainQueue(): void {
    // Remove old questions from queue to keep it manageable and free memory
    const questionsToRemove = this.questionQueue.filter((q) => q.index < this.currentQuestionIndex)

    questionsToRemove.forEach((question) => {
      if (question.audioData && question.audioFormatInfo) {
        console.log(
          `🗑️ Removing audio data for completed question ${question.index + 1} (${question.audioFormatInfo.sizeInMB}MB)`,
        )
        this.totalAudioMemoryMB -= question.audioFormatInfo.sizeInMB
        question.audioData = undefined
        question.audioFormatInfo = undefined
      }
    })

    this.questionQueue = this.questionQueue.filter((q) => q.index >= this.currentQuestionIndex)

    // Add new questions to queue if needed
    const currentQueueSize = this.questionQueue.length
    const questionsToAdd = Math.min(
      this.config.queueSize - currentQueueSize,
      this.allQuestions.length - (this.currentQuestionIndex + currentQueueSize),
    )

    for (let i = 0; i < questionsToAdd; i++) {
      const questionIndex = this.currentQuestionIndex + currentQueueSize + i
      if (questionIndex < this.allQuestions.length) {
        this.questionQueue.push({
          text: this.allQuestions[questionIndex],
          index: questionIndex,
          isGenerating: false,
        })
      }
    }

    // Start generating audio for new questions
    if (questionsToAdd > 0) {
      setTimeout(() => {
        if (this.active) {
          this.generateNextQueuedAudio()
        }
      }, 500) // Small delay after user response
    }

    console.log(
      `🔄 Queue maintained: ${this.questionQueue.length} questions in queue, ${questionsToRemove.length} cleaned up`,
    )
  }

  private async playAudioData(audioData: string): Promise<void> {
    try {
      if (!this.audioContext) {
        throw new Error("Audio context not initialized")
      }

      console.log("🎵 Converting audio format for playback...")

      // Use our audio format analyzer for conversion
      const audioBuffer = await AudioFormatAnalyzer.convertToAudioBuffer(audioData, this.audioContext)

      console.log(
        `✅ Audio converted: ${audioBuffer.duration.toFixed(2)}s, ${audioBuffer.sampleRate}Hz, ${audioBuffer.numberOfChannels} channel(s)`,
      )

      // Play the audio
      const source = this.audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(this.audioContext.destination)

      return new Promise((resolve, reject) => {
        source.onended = () => {
          console.log("✅ Question audio playback completed")
          this.cleanupPlayedAudio()
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

  private cleanupPlayedAudio(): void {
    const currentIndex = this.currentQuestionIndex

    this.questionQueue = this.questionQueue.filter((question) => {
      if (question.index < currentIndex) {
        if (question.audioData && question.audioFormatInfo) {
          console.log(
            `🗑️ Cleaning up audio data for played question ${question.index + 1} (${question.audioFormatInfo.sizeInMB}MB)`,
          )
          this.totalAudioMemoryMB -= question.audioFormatInfo.sizeInMB
          question.audioData = undefined
          question.audioFormatInfo = undefined
        }
        return false
      }
      return true
    })

    // Force garbage collection hint (not guaranteed but helps)
    if (typeof window !== "undefined" && "gc" in window) {
      ;(window as any).gc()
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

    console.log("👂 Started listening for user response...")

    // Start voice activity monitoring
    this.voiceActivityMonitor = setInterval(() => {
      if (!this.audioAnalyzer || !this.isListeningForResponse) return

      const bufferLength = this.audioAnalyzer.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      this.audioAnalyzer.getByteFrequencyData(dataArray)

      // Calculate average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength

      if (average > this.config.silenceThreshold) {
        // User is speaking
        if (!isSpeaking) {
          isSpeaking = true
          console.log("🗣️ User started speaking")
          this.callbacks.onUserSpeaking()
        }

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

  forceCleanup(): void {
    console.log("🧹 Force cleaning up interview client...")
    this.endInterview()
  }

  endInterview(): void {
    console.log("🔚 Ending conversational interview...")

    // IMMEDIATE CLEANUP - Cancel everything first
    this.active = false
    this.isListeningForResponse = false
    this.isPlayingQuestion = false

    // Cancel all active API requests IMMEDIATELY with priority abort
    console.log(`🚫 IMMEDIATELY cancelling ${this.activeRequests.size} active API requests...`)
    this.activeRequests.forEach((controller) => {
      try {
        controller.abort()
        console.log("🚫 Aborted API request")
      } catch (error) {
        console.warn("Error aborting request:", error)
      }
    })
    this.activeRequests.clear()

    // Force abort any ongoing audio generation
    this.questionQueue.forEach((question) => {
      if (question.abortController && !question.abortController.signal.aborted) {
        try {
          question.abortController.abort()
          console.log(`🚫 Force aborted question ${question.index + 1} generation`)
        } catch (error) {
          console.warn("Error force aborting question:", error)
        }
      }
    })

    // Clear all timers IMMEDIATELY
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

    // Rest of cleanup continues...

    // Stop media recorder
    if (this.mediaRecorder) {
      try {
        if (this.mediaRecorder.state === "recording") {
          this.mediaRecorder.stop()
        }
      } catch (error) {
        console.warn("Error stopping media recorder:", error)
      }
      this.mediaRecorder = null
    }

    // Disconnect audio nodes
    if (this.microphoneSource) {
      try {
        this.microphoneSource.disconnect()
      } catch (error) {
        console.warn("Error disconnecting microphone source:", error)
      }
      this.microphoneSource = null
    }

    if (this.audioAnalyzer) {
      try {
        this.audioAnalyzer.disconnect()
      } catch (error) {
        console.warn("Error disconnecting audio analyzer:", error)
      }
      this.audioAnalyzer = null
    }

    // Stop all media stream tracks
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        try {
          track.stop()
        } catch (error) {
          console.warn("Error stopping track:", error)
        }
      })
      this.stream = null
    }

    // Clear audio queue and free memory
    this.questionQueue.forEach((question) => {
      if (question.audioData) {
        question.audioData = undefined
      }
      if (question.audioFormatInfo) {
        question.audioFormatInfo = undefined
      }
      if (question.abortController) {
        try {
          question.abortController.abort()
        } catch (error) {
          // Ignore abort errors during cleanup
        }
      }
    })
    this.questionQueue = []
    this.totalAudioMemoryMB = 0

    // Close audio context
    if (this.audioContext) {
      try {
        if (this.audioContext.state !== "closed") {
          this.audioContext.close()
        }
      } catch (error) {
        console.warn("Error closing audio context:", error)
      }
      this.audioContext = null
    }

    // Force garbage collection hint
    if (typeof window !== "undefined" && "gc" in window) {
      try {
        ;(window as any).gc()
      } catch (error) {
        // Ignore if gc is not available
      }
    }

    console.log("✅ Interview cleanup completed")
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
    return this.allQuestions.length
  }

  getQueueStatus(): {
    queued: number
    ready: number
    generating: number
  } {
    return {
      queued: this.questionQueue.length,
      ready: this.questionQueue.filter((q) => q.audioData).length,
      generating: this.questionQueue.filter((q) => q.isGenerating).length,
    }
  }

  isPlayingQuestion(): boolean {
    return this.isPlayingQuestion
  }

  isListening(): boolean {
    return this.isListeningForResponse
  }

  getMemoryStatus(): {
    queueSize: number
    audioDataSize: number
    estimatedMemoryMB: number
    audioFormat: string
    totalProcessed: number
  } {
    let questionsWithAudio = 0
    let totalDuration = 0

    this.questionQueue.forEach((question) => {
      if (question.audioData && question.audioFormatInfo) {
        questionsWithAudio++
        totalDuration += question.audioFormatInfo.estimatedDuration
      }
    })

    return {
      queueSize: this.questionQueue.length,
      audioDataSize: questionsWithAudio,
      estimatedMemoryMB: Math.round(this.totalAudioMemoryMB * 100) / 100,
      audioFormat: "24kHz 16-bit Mono PCM",
      totalProcessed: this.currentQuestionIndex,
    }
  }

  getInterviewerName(): string {
    return this.interviewerName
  }
}
