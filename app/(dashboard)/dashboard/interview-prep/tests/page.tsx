"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Play, Square, Volume2, Mic, Zap, VolumeX, Volume1 } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface TestResult {
  id: string
  type: string
  status: "success" | "error" | "running"
  message: string
  timestamp: string
  details?: any
  audioData?: string
}

export default function GeminiLiveAPITestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState<string | null>(null)
  const [selectedVoice, setSelectedVoice] = useState("Kore")
  const [selectedTone, setSelectedTone] = useState("conversational")
  const [customText, setCustomText] = useState("Hello, this is a test of the Gemini Live API audio generation.")
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const [volume, setVolume] = useState(0.8)

  const voices = ["Puck", "Charon", "Kore", "Fenrir", "Aoede", "Leda", "Orus", "Zephyr"]
  const tones = ["professional", "conversational", "casual"]

  const addTestResult = (result: Omit<TestResult, "id" | "timestamp">) => {
    const newResult: TestResult = {
      ...result,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
    }
    setTestResults((prev) => [newResult, ...prev])
    return newResult.id
  }

  const updateTestResult = (id: string, updates: Partial<TestResult>) => {
    setTestResults((prev) => prev.map((result) => (result.id === id ? { ...result, ...updates } : result)))
  }

  const playTestTone = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime) // A4 note
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime)

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.5) // Play for 0.5 seconds

      console.log("Test tone played successfully")
    } catch (error) {
      console.error("Failed to play test tone:", error)
    }
  }

  const playAudio = (audioData: string, resultId: string) => {
    try {
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.currentTime = 0
      }

      // Convert base64 to blob and create audio
      const audioBuffer = Uint8Array.from(atob(audioData), (c) => c.charCodeAt(0))
      const audioBlob = new Blob([audioBuffer], { type: "audio/wav" })
      const audioUrl = URL.createObjectURL(audioBlob)

      const audio = new Audio(audioUrl)
      audio.volume = volume // Set the volume
      setCurrentAudio(audio)
      setPlayingAudioId(resultId)

      audio.onended = () => {
        setPlayingAudioId(null)
        URL.revokeObjectURL(audioUrl)
      }

      audio.onerror = (e) => {
        console.error("Audio playback error:", e)
        setPlayingAudioId(null)
        URL.revokeObjectURL(audioUrl)
      }

      audio.play()
    } catch (error) {
      console.error("Failed to play audio:", error)
      setPlayingAudioId(null)
    }
  }

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setPlayingAudioId(null)
    }
  }

  const runTest = async (testType: string, payload: any = {}) => {
    setIsRunning(testType)
    const resultId = addTestResult({
      type: testType,
      status: "running",
      message: "Running test...",
    })

    try {
      const response = await fetch("/api/interview/generate-real-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          voice: selectedVoice,
          tone: selectedTone,
        }),
      })

      const data = await response.json()

      if (data.success) {
        updateTestResult(resultId, {
          status: "success",
          message: data.message,
          details: data,
          audioData: data.audioData,
        })
      } else {
        updateTestResult(resultId, {
          status: "error",
          message: data.error || "Test failed",
          details: data,
        })
      }
    } catch (error) {
      updateTestResult(resultId, {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        details: { error: String(error) },
      })
    } finally {
      setIsRunning(null)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Gemini Live API Test Suite</h1>
        <p className="text-muted-foreground">Test real audio generation using the official Gemini Live API</p>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Audio Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="voice">Voice</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice} value={voice}>
                      {voice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={selectedTone} onValueChange={setSelectedTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((tone) => (
                    <SelectItem key={tone} value={tone}>
                      {tone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customText">Custom Text</Label>
            <Textarea
              id="customText"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Enter text to convert to speech..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="volume">Volume</Label>
              <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <VolumeX className="h-4 w-4 text-muted-foreground" />
              <Slider
                id="volume"
                min={0}
                max={1}
                step={0.01}
                value={[volume]}
                onValueChange={(vals) => setVolume(vals[0])}
                className="flex-1"
              />
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Button size="sm" variant="outline" onClick={playTestTone}>
                <Volume1 className="h-4 w-4 mr-1" />
                Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Audio Generation Tests
          </CardTitle>
          <CardDescription>Generate real audio using the Gemini Live API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              onClick={() => runTest("custom-text", { text: customText })}
              disabled={isRunning === "custom-text" || !customText.trim()}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Volume2 className="h-5 w-5" />
              <span>Generate Audio</span>
              <span className="text-xs opacity-70">Custom Text</span>
            </Button>

            <Button
              onClick={() => runTest("quick-test", { text: "This is a quick test of the Gemini Live API." })}
              disabled={isRunning === "quick-test"}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Zap className="h-5 w-5" />
              <span>Quick Test</span>
              <span className="text-xs opacity-70">Standard Text</span>
            </Button>

            <Button
              onClick={() => runTest("voice-test", { text: `Hello, this is the ${selectedVoice} voice speaking.` })}
              disabled={isRunning === "voice-test"}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Mic className="h-5 w-5" />
              <span>Voice Test</span>
              <span className="text-xs opacity-70">{selectedVoice}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Real Test Results</CardTitle>
          <CardDescription>Live results from actual Gemini Live API calls</CardDescription>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No tests run yet. Click a test button above to start.
            </p>
          ) : (
            <div className="space-y-4">
              {testResults.map((result) => (
                <div key={result.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          result.status === "success"
                            ? "default"
                            : result.status === "error"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {result.status}
                      </Badge>
                      <span className="font-medium">{result.type}</span>
                      <span className="text-sm text-muted-foreground">{result.timestamp}</span>
                    </div>
                    {result.audioData && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => playAudio(result.audioData!, result.id)}
                          disabled={playingAudioId === result.id}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Play Audio
                        </Button>
                        {playingAudioId === result.id && (
                          <Button size="sm" variant="outline" onClick={stopAudio}>
                            <Square className="h-4 w-4 mr-1" />
                            Stop
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-sm">{result.message}</p>
                  {result.details && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground">View Details</summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
