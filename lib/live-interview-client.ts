import { GeminiStreamService } from "@/lib/gemini-stream-service"

export interface LiveInterviewConfig {
  voice: "Puck" | "Charon" | "Kore" | "Fenrir" | "Aoede" | "Leda" | "Orus" | "Zephyr"
  maxDuration: number
  timeWarningAt: number
}

export interface LiveInterviewCallbacks {
  onConnected?: () => void
  onDisconnected?: () => void
  onError?: (error: string) => void
  onTimeWarning?: (minutesLeft: number) => void
  onTimeUp?: () => void
  onInterviewComplete?: () => void
  onAudioReceived?: (data: ArrayBuffer) => void
}

export class LiveInterviewClient {
  private service: GeminiStreamService
  private config: LiveInterviewConfig
  private callbacks: LiveInterviewCallbacks
  private start = 0
  private active = false
  private timer: NodeJS.Timeout | null = null

  private constructor(service: GeminiStreamService, config: LiveInterviewConfig, callbacks: LiveInterviewCallbacks) {
    this.service = service
    this.config = config
    this.callbacks = callbacks
  }

  static async create(
    job: any,
    resume: any | undefined,
    questions: { technical: string[]; behavioral: string[] },
    config: LiveInterviewConfig,
    callbacks: LiveInterviewCallbacks,
  ): Promise<LiveInterviewClient> {
    const apiKey = process.env.GOOGLE_AI_API_KEY || ""
    const service = new GeminiStreamService(
      apiKey,
      { job, resume, questions, voice: config.voice },
      {
        onOpen: callbacks.onConnected,
        onClose: callbacks.onDisconnected,
        onError: (e) => callbacks.onError?.(e?.message || String(e)),
        onAudio: (d) => callbacks.onAudioReceived?.(Buffer.from(d, "base64").buffer),
      },
    )

    return new LiveInterviewClient(service, config, callbacks)
  }

  async startInterview() {
    await this.service.startSession()
    this.active = true
    this.start = Date.now()
    this.timer = setInterval(() => {
      const elapsed = Date.now() - this.start
      if (elapsed >= this.config.maxDuration) {
        this.callbacks.onTimeUp?.()
        this.endInterview()
      } else if (elapsed >= this.config.timeWarningAt) {
        const remaining = Math.round((this.config.maxDuration - elapsed) / 60000)
        this.callbacks.onTimeWarning?.(remaining)
      }
    }, 1000)
  }

  sendAudio(data: ArrayBuffer) {
    this.service.sendAudio(data)
  }

  isActive() {
    return this.active
  }

  getInterviewDuration() {
    return this.active ? Date.now() - this.start : 0
  }

  getRemainingTime() {
    return this.config.maxDuration - (Date.now() - this.start)
  }

  endInterview() {
    this.service.close()
    this.active = false
    if (this.timer) clearInterval(this.timer)
    this.callbacks.onInterviewComplete?.()
  }
}
