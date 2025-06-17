"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle, Mic, Volume2, Zap, Globe, TestTube, Search, FileCode } from "lucide-react"

interface TestResult {
  success: boolean
  message: string
  details?: any
  error?: string
  testType?: string
}

export function InterviewTestPanel() {
  const [isTestingAudio, setIsTestingAudio] = useState(false)
  const [isTestingSpeech, setIsTestingSpeech] = useState(false)
  const [isTestingMicrophone, setIsTestingMicrophone] = useState(false)
  const [isTestingGeminiLive, setIsTestingGeminiLive] = useState(false)
  const [audioTestResult, setAudioTestResult] = useState<TestResult | null>(null)
  const [speechTestResult, setSpeechTestResult] = useState<TestResult | null>(null)
  const [microphoneTestResult, setMicrophoneTestResult] = useState<TestResult | null>(null)
  const [geminiLiveTestResult, setGeminiLiveTestResult] = useState<TestResult | null>(null)
  const [selectedVoice, setSelectedVoice] = useState("Kore")
  const [selectedTone, setSelectedTone] = useState("conversational")
  const [testAudioUrl, setTestAudioUrl] = useState<string | null>(null)
  const [testAudioData, setTestAudioData] = useState<ArrayBuffer | null>(null)
  const [exactFormatResult, setExactFormatResult] = useState<any>(null)

  const testAudioGeneration = async () => {
    setIsTestingAudio(true)
    setAudioTestResult(null)

    try {
      const response = await fetch("/api/interview/test-audio-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testType: "simple" }),
      })

      const result = await response.json()
      setAudioTestResult(result)
    } catch (error) {
      setAudioTestResult({
        success: false,
        message: "Audio generation test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsTestingAudio(false)
    }
  }

  const testVoiceVariations = async () => {
    setIsTestingAudio(true)
    setAudioTestResult(null)

    try {
      const response = await fetch("/api/interview/test-audio-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testType: "voices" }),
      })

      const result = await response.json()
      setAudioTestResult(result)
    } catch (error) {
      setAudioTestResult({
        success: false,
        message: "Voice variation test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsTestingAudio(false)
    }
  }

  const testGeminiLiveAPI = async (testType: string) => {
    setIsTestingGeminiLive(true)
    setGeminiLiveTestResult(null)
    setTestAudioUrl(null)
    setTestAudioData(null)

    try {
      const response = await fetch("/api/interview/test-gemini-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType,
          voice: selectedVoice,
          tone: selectedTone,
        }),
      })

      const result = await response.json()
      setGeminiLiveTestResult(result)

      // If the test was successful and we have audio data, store it for playback
      if (result.success && result.details?.hasAudioData && result.details?.audioUrl) {
        setTestAudioUrl(result.details.audioUrl)
        if (result.details.audioData) {
          setTestAudioData(result.details.audioData)
        }
      }
    } catch (error) {
      setGeminiLiveTestResult({
        success: false,
        message: "Gemini Live API test failed",
        error: error instanceof Error ? error.message : "Unknown error",
        testType,
      })
    } finally {
      setIsTestingGeminiLive(false)
    }
  }

  const testExactFormat = async () => {
    setIsTestingGeminiLive(true)
    setExactFormatResult(null)

    try {
      const response = await fetch("/api/interview/test-gemini-live-exact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voice: selectedVoice,
          tone: selectedTone,
        }),
      })

      const result = await response.json()
      setExactFormatResult(result)
    } catch (error) {
      setExactFormatResult({
        success: false,
        message: "Exact format test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsTestingGeminiLive(false)
    }
  }

  const testSpeechCapabilities = async () => {
    setIsTestingSpeech(true)
    setSpeechTestResult(null)

    try {
      // Test browser capabilities
      const capabilities = {
        speechSynthesis: "speechSynthesis" in window,
        mediaDevices: "mediaDevices" in navigator,
        audioContext: "AudioContext" in window || "webkitAudioContext" in window,
        mediaRecorder: "MediaRecorder" in window,
        webSocket: "WebSocket" in window,
      }

      const allSupported = Object.values(capabilities).every(Boolean)

      setSpeechTestResult({
        success: allSupported,
        message: allSupported ? "All speech capabilities supported" : "Some capabilities missing",
        details: capabilities,
      })
    } catch (error) {
      setSpeechTestResult({
        success: false,
        message: "Speech capabilities test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsTestingSpeech(false)
    }
  }

  const testMicrophoneAccess = async () => {
    setIsTestingMicrophone(true)
    setMicrophoneTestResult(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      // Test audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      source.connect(analyser)

      // Clean up
      stream.getTracks().forEach((track) => track.stop())
      audioContext.close()

      setMicrophoneTestResult({
        success: true,
        message: "Microphone access and audio processing successful",
        details: {
          audioTracks: stream.getAudioTracks().length,
          sampleRate: audioContext.sampleRate,
        },
      })
    } catch (error) {
      setMicrophoneTestResult({
        success: false,
        message: "Microphone access failed",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsTestingMicrophone(false)
    }
  }

  const testTextToSpeech = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance("This is a test of the text to speech system.")
      utterance.rate = 0.9
      utterance.pitch = 1.0
      speechSynthesis.speak(utterance)
    }
  }

  const renderTestResult = (result: TestResult | null, isLoading: boolean) => {
    if (!result && !isLoading) return null

    if (isLoading) {
      return (
        <Card className="border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Running test...</span>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className={result.success ? "border-green-200" : "border-red-200"}>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <span className="font-medium">{result.message}</span>
            {result.testType && <Badge variant="outline">{result.testType}</Badge>}
          </div>

          {result.details && (
            <div className="mt-2 space-y-2">
              {/* Audio size analysis */}
              {result.details.audioSizeAnalysis && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium mb-2">Audio Analysis:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      Size: {result.details.audioSizeAnalysis.bytes} bytes ({result.details.audioSizeAnalysis.kilobytes}{" "}
                      KB)
                    </div>
                    <div>Est. Duration: {result.details.audioSizeAnalysis.estimatedDurationSeconds}</div>
                    <div>Viable Audio: {result.details.audioSizeAnalysis.isViableAudio ? "✅ Yes" : "❌ No"}</div>
                    <div>Test Question: {result.details.testQuestion}</div>
                  </div>
                </div>
              )}

              {/* Debug info */}
              {result.details.debugInfo && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="text-sm font-medium mb-2">Debug Info:</div>
                  <div className="text-xs space-y-1">
                    {result.details.debugInfo.audioSize && (
                      <div>Audio Size: {result.details.debugInfo.audioSize} bytes</div>
                    )}
                    {result.details.debugInfo.chunksReceived !== undefined && (
                      <div>Chunks Received: {result.details.debugInfo.chunksReceived}</div>
                    )}
                    {result.details.debugInfo.totalAudioBytes !== undefined && (
                      <div>Total Audio Bytes: {result.details.debugInfo.totalAudioBytes}</div>
                    )}
                    {result.details.debugInfo.setupComplete !== undefined && (
                      <div>Setup Complete: {result.details.debugInfo.setupComplete ? "✅" : "❌"}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Gemini Live API specific details */}
              {result.testType?.includes("gemini") && (
                <div className="space-y-2">
                  {result.details.connectionTime && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Connection Time: </span>
                      <Badge variant="secondary">{result.details.connectionTime}</Badge>
                    </div>
                  )}
                  {result.details.audioGenerationTime && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Audio Generation: </span>
                      <Badge variant="secondary">{result.details.audioGenerationTime}</Badge>
                    </div>
                  )}
                  {result.details.audioDataSize && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Audio Size: </span>
                      <Badge variant={result.details.audioDataSize.includes("0 bytes") ? "destructive" : "default"}>
                        {result.details.audioDataSize}
                      </Badge>
                    </div>
                  )}
                  {result.details.successRate && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Success Rate: </span>
                      <Badge variant={Number.parseInt(result.details.successRate) > 80 ? "default" : "destructive"}>
                        {result.details.successRate}
                      </Badge>
                    </div>
                  )}
                  {result.details.viableAudioCount !== undefined && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Viable Audio Generated: </span>
                      <Badge variant={result.details.viableAudioCount > 0 ? "default" : "destructive"}>
                        {result.details.viableAudioCount} files
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Voice variation results */}
              {result.details.results && Array.isArray(result.details.results) && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Test Results:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                    {result.details.results.map((testResult: any, index: number) => (
                      <div
                        key={index}
                        className={`p-2 rounded text-sm ${
                          testResult.success && testResult.isViableAudio
                            ? "bg-green-50 text-green-800"
                            : "bg-red-50 text-red-800"
                        }`}
                      >
                        <div className="font-medium">
                          {testResult.voice || testResult.questionNumber} - {testResult.tone || "Test"}
                        </div>
                        <div className="text-xs">
                          {testResult.success && testResult.isViableAudio ? "✅" : "❌"} {testResult.time || "N/A"}
                        </div>
                        {testResult.audioSize && <div className="text-xs opacity-75">{testResult.audioSize}</div>}
                        {testResult.error && <div className="text-xs mt-1">Error: {testResult.error}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Browser capabilities */}
              {result.details.speechSynthesis !== undefined && (
                <div className="space-y-2">
                  {Object.entries(result.details).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      {value ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                      <Badge variant={value ? "default" : "destructive"}>{value ? "Supported" : "Missing"}</Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Microphone details */}
              {result.details.audioTracks !== undefined && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Audio tracks: {result.details.audioTracks}</p>
                  <p>Sample rate: {result.details.sampleRate} Hz</p>
                </div>
              )}
            </div>
          )}

          {result.error && <div className="mt-2 text-sm text-red-600">Error: {result.error}</div>}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>Mock Interview Testing Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="gemini-live" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="gemini-live">Gemini Live API</TabsTrigger>
            <TabsTrigger value="audio">Audio Generation</TabsTrigger>
            <TabsTrigger value="speech">Speech Detection</TabsTrigger>
            <TabsTrigger value="microphone">Microphone</TabsTrigger>
          </TabsList>

          <TabsContent value="gemini-live" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Voice</label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Puck">Puck (Energetic)</SelectItem>
                      <SelectItem value="Charon">Charon (Deep)</SelectItem>
                      <SelectItem value="Kore">Kore (Professional)</SelectItem>
                      <SelectItem value="Fenrir">Fenrir (Confident)</SelectItem>
                      <SelectItem value="Aoede">Aoede (Friendly)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Tone</label>
                  <Select value={selectedTone} onValueChange={setSelectedTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                <Button
                  onClick={() => testGeminiLiveAPI("connection")}
                  disabled={isTestingGeminiLive}
                  variant="outline"
                  size="sm"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Connection
                </Button>
                <Button
                  onClick={() => testGeminiLiveAPI("audio-generation")}
                  disabled={isTestingGeminiLive}
                  variant="outline"
                  size="sm"
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  Audio Gen
                </Button>
                <Button
                  onClick={() => testGeminiLiveAPI("detailed-audio-test")}
                  disabled={isTestingGeminiLive}
                  variant="outline"
                  size="sm"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Detailed
                </Button>
                <Button
                  onClick={() => testGeminiLiveAPI("voice-variations")}
                  disabled={isTestingGeminiLive}
                  variant="outline"
                  size="sm"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  All Voices
                </Button>
                <Button
                  onClick={() => testGeminiLiveAPI("stress-test")}
                  disabled={isTestingGeminiLive}
                  variant="outline"
                  size="sm"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Stress Test
                </Button>
                <Button onClick={testExactFormat} disabled={isTestingGeminiLive} variant="outline" size="sm">
                  <FileCode className="h-4 w-4 mr-2" />
                  Exact Format
                </Button>
              </div>

              {renderTestResult(geminiLiveTestResult, isTestingGeminiLive)}

              {exactFormatResult && (
                <Card className="border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCode className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Exact Format from Documentation</span>
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm font-medium mb-2">Setup Message:</div>
                        <pre className="text-xs overflow-x-auto p-2 bg-gray-100 rounded">
                          {JSON.stringify(exactFormatResult.details?.setupMessage, null, 2)}
                        </pre>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm font-medium mb-2">Client Content Message:</div>
                        <pre className="text-xs overflow-x-auto p-2 bg-gray-100 rounded">
                          {JSON.stringify(exactFormatResult.details?.clientContentMessage, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {testAudioUrl && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Audio Test</h3>
                  <audio controls src={testAudioUrl} className="w-full" />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="audio" className="space-y-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={testAudioGeneration} disabled={isTestingAudio}>
                  {isTestingAudio ? "Testing..." : "Test Basic Audio Generation"}
                </Button>
                <Button onClick={testVoiceVariations} disabled={isTestingAudio} variant="outline">
                  {isTestingAudio ? "Testing..." : "Test All Voice Variations"}
                </Button>
                <Button onClick={testTextToSpeech} variant="outline">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Test TTS
                </Button>
              </div>

              {renderTestResult(audioTestResult, isTestingAudio)}
            </div>
          </TabsContent>

          <TabsContent value="speech" className="space-y-4">
            <div className="space-y-4">
              <Button onClick={testSpeechCapabilities} disabled={isTestingSpeech}>
                {isTestingSpeech ? "Testing..." : "Test Speech Capabilities"}
              </Button>

              {renderTestResult(speechTestResult, isTestingSpeech)}
            </div>
          </TabsContent>

          <TabsContent value="microphone" className="space-y-4">
            <div className="space-y-4">
              <Button onClick={testMicrophoneAccess} disabled={isTestingMicrophone}>
                <Mic className="h-4 w-4 mr-2" />
                {isTestingMicrophone ? "Testing..." : "Test Microphone Access"}
              </Button>

              {renderTestResult(microphoneTestResult, isTestingMicrophone)}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
