import { GoogleGenAI, Modality } from "@google/genai"

export interface StreamCallbacks {
  onOpen?: () => void
  onMessage?: (message: any) => void
  onError?: (error: any) => void
  onClose?: () => void
  onAudio?: (audioData: string) => void
}

export interface StreamInit {
  job: { title: string; company: string; description?: string }
  resume?: { content?: string }
  questions: { technical: string[]; behavioral: string[] }
  voice?: string
}

export class GeminiStreamService {
  private ai: GoogleGenAI
  private session: any | null = null
  private voice: string
  private callbacks: StreamCallbacks
  private init: StreamInit

  constructor(apiKey: string, init: StreamInit, callbacks: StreamCallbacks = {}) {
    this.ai = new GoogleGenAI({ apiKey })
    this.init = init
    this.voice = init.voice || this.randomVoice()
    this.callbacks = callbacks
  }

  private randomVoice(): string {
    const voices = [
      "Puck",
      "Charon",
      "Kore",
      "Fenrir",
      "Aoede",
      "Leda",
      "Orus",
      "Zephyr",
    ]
    return voices[Math.floor(Math.random() * voices.length)]
  }

  private buildPrompt(): string {
    const { job, resume, questions } = this.init
    let prompt = `You are conducting a mock interview for the ${job.title} position at ${job.company}.`
    if (job.description) {
      prompt += `\nJOB DESCRIPTION:\n${job.description}`
    }
    if (resume?.content) {
      prompt += `\nRESUME:\n${resume.content}`
    }
    prompt += "\nQUESTIONS TO COVER:";
    questions.technical.forEach((q, i) => {
      prompt += `\n${i + 1}. [TECHNICAL] ${q}`
    })
    questions.behavioral.forEach((q, i) => {
      prompt += `\n${i + 1 + questions.technical.length}. [BEHAVIORAL] ${q}`
    })
    prompt += "\nConduct the interview in a natural manner.";
    return prompt
  }

  async startSession(): Promise<void> {
    const config = {
      model: "gemini-2.0-flash-live-001",
      callbacks: {
        onopen: () => this.callbacks.onOpen?.(),
        onmessage: (msg: any) => {
          this.callbacks.onMessage?.(msg)
          const parts =
            msg.candidates?.[0]?.content?.parts || msg.serverContent?.modelTurn?.parts
          if (parts) {
            for (const part of parts) {
              if (part.inlineData?.data) {
                this.callbacks.onAudio?.(part.inlineData.data)
              }
            }
          }
        },
        onerror: (e: any) => this.callbacks.onError?.(e),
        onclose: () => this.callbacks.onClose?.(),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: { parts: [{ text: this.buildPrompt() }] },
        speechConfig: { voiceName: this.voice },
      },
    }

    this.session = await this.ai.live.connect(config as any)
  }

  sendAudio(audioData: ArrayBuffer) {
    if (!this.session) return
    const base64 = Buffer.from(audioData).toString("base64")
    this.session.sendRealtimeInput({
      audio: { data: base64, mimeType: "audio/pcm;rate=16000" },
    })
  }

  sendText(text: string) {
    if (!this.session) return
    this.session.sendClientContent({ turns: text })
  }

  close() {
    if (this.session) {
      this.session.close()
      this.session = null
    }
  }
}
