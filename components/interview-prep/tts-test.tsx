"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, VolumeX, Loader2 } from "lucide-react"

export function TTSTest() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<number>(0)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if speech synthesis is supported
    setIsSupported("speechSynthesis" in window)

    if ("speechSynthesis" in window) {
      // Load voices
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices()
        setVoices(availableVoices)

        // Select first English voice by default
        const englishVoice = availableVoices.findIndex((voice) => voice.lang.startsWith("en"))
        if (englishVoice !== -1) {
          setSelectedVoice(englishVoice)
        }
      }

      loadVoices()
      speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  const testTTS = () => {
    if (!isSupported) return

    const testText =
      "Hello! I'm calling from TechCorp regarding your application for the Software Engineer position. I'd like to ask you a few questions about your experience. Are you ready to begin?"

    const utterance = new SpeechSynthesisUtterance(testText)
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 0.8

    if (voices[selectedVoice]) {
      utterance.voice = voices[selectedVoice]
    }

    utterance.onstart = () => {
      setIsPlaying(true)
    }

    utterance.onend = () => {
      setIsPlaying(false)
    }

    utterance.onerror = (event) => {
      console.error("TTS Error:", event.error)
      setIsPlaying(false)
    }

    speechSynthesis.speak(utterance)
  }

  const stopTTS = () => {
    speechSynthesis.cancel()
    setIsPlaying(false)
  }

  if (!isSupported) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <VolumeX className="h-5 w-5" />
            Text-to-Speech Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">
            Your browser doesn't support text-to-speech. The interview will show questions as text instead of speaking
            them.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Audio Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select Voice ({voices.length} available):</label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(Number(e.target.value))}
            className="w-full p-2 border rounded-md"
          >
            {voices.map((voice, index) => (
              <option key={index} value={index}>
                {voice.name} ({voice.lang}) {voice.default ? "(Default)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Button onClick={testTTS} disabled={isPlaying} className="flex items-center gap-2">
            {isPlaying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Speaking...
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" />
                Test Interview Voice
              </>
            )}
          </Button>

          {isPlaying && (
            <Button onClick={stopTTS} variant="outline">
              Stop
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          <p>This will test the interviewer voice with a sample question.</p>
        </div>
      </CardContent>
    </Card>
  )
}
