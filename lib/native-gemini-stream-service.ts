import { NativeGeminiClient, type NativeGeminiConfig, type GeminiCallbacks } from "./native-gemini-client"

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
  private client: NativeGeminiClient
  private callbacks: StreamCallbacks

  constructor(apiKey: string, init: StreamInit, callbacks: StreamCallbacks = {}) {
    this.callbacks = callbacks

    const config: NativeGeminiConfig = {
      apiKey,
      voice: init.voice || this.randomVoice(),
      job: init.job,
      resume: init.resume,
      questions: init.questions,
    }

    const clientCallbacks: GeminiCallbacks = {
      onConnected: callbacks.onOpen,
      onDisconnected: callbacks.onClose,
      onError: (error) => callbacks.onError?.(new Error(error)),
      onAudio: callbacks.onAudio,
      onMessage: callbacks.onMessage,
    }

    this.client = new NativeGeminiClient(config, clientCallbacks)
  }

  private randomVoice(): string {
    const voices = ["Puck", "Charon", "Kore", "Fenrir", "Aoede", "Leda", "Orus", "Zephyr"]
    return voices[Math.floor(Math.random() * voices.length)]
  }

  async startSession(): Promise<void> {
    return this.client.startSession()
  }

  sendAudio(audioData: ArrayBuffer): void {
    this.client.sendAudio(audioData)
  }

  sendText(text: string): void {
    this.client.sendText(text)
  }

  close(): void {
    this.client.close()
  }
}
