"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, Square, Download, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"

interface TestResult {
  name: string
  status: "pending" | "success" | "error"
  message: string
  details?: any
}

export default function MicrophoneTestPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<string>("")
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [logs, setLogs] = useState<string[]>([])

  // Different audio level detection methods
  const [webAudioLevel, setWebAudioLevel] = useState(0)
  const [mediaRecorderLevel, setMediaRecorderLevel] = useState(0)
  const [streamLevel, setStreamLevel] = useState(0)

  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const recordedChunks = useRef<Blob[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, `${timestamp}: ${message}`])
    console.log(`[MIC TEST] ${message}`)
  }

  const updateTestResult = (name: string, status: TestResult["status"], message: string, details?: any) => {
    setTestResults((prev) => {
      const existing = prev.find((r) => r.name === name)
      if (existing) {
        return prev.map((r) => (r.name === name ? { name, status, message, details } : r))
      }
      return [...prev, { name, status, message, details }]
    })
  }

  // Check microphone permissions
  const checkPermissions = async () => {
    updateTestResult("Permissions", "pending", "Checking microphone permissions...")

    try {
      // Check if permissions API is available
      if ("permissions" in navigator) {
        const result = await navigator.permissions.query({ name: "microphone" as PermissionName })
        setPermissionStatus(result.state)

        if (result.state === "granted") {
          updateTestResult("Permissions", "success", "Microphone permission granted", result.state)
        } else if (result.state === "denied") {
          updateTestResult("Permissions", "error", "Microphone permission denied", result.state)
        } else {
          updateTestResult("Permissions", "success", "Microphone permission will be requested", result.state)
        }

        addLog(`Permission state: ${result.state}`)
      } else {
        updateTestResult("Permissions", "success", "Permissions API not available, will request on use")
        addLog("Permissions API not available")
      }
    } catch (error) {
      updateTestResult("Permissions", "error", `Permission check failed: ${error}`)
      addLog(`Permission check error: ${error}`)
    }
  }

  // Get available audio devices
  const getAudioDevices = async () => {
    updateTestResult("Audio Devices", "pending", "Enumerating audio devices...")

    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = devices.filter((device) => device.kind === "audioinput")
      setAudioDevices(audioInputs)

      if (audioInputs.length === 0) {
        updateTestResult("Audio Devices", "error", "No audio input devices found")
      } else {
        updateTestResult("Audio Devices", "success", `Found ${audioInputs.length} audio input device(s)`, audioInputs)
        if (audioInputs.length > 0 && !selectedDevice) {
          setSelectedDevice(audioInputs[0].deviceId)
        }
      }

      addLog(`Found ${audioInputs.length} audio devices`)
    } catch (error) {
      updateTestResult("Audio Devices", "error", `Failed to enumerate devices: ${error}`)
      addLog(`Device enumeration error: ${error}`)
    }
  }

  // Test basic getUserMedia
  const testGetUserMedia = async () => {
    updateTestResult("getUserMedia", "pending", "Testing getUserMedia...")

    try {
      const constraints = {
        audio: selectedDevice ? { deviceId: selectedDevice } : true,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      updateTestResult("getUserMedia", "success", "Successfully obtained audio stream", {
        tracks: stream.getAudioTracks().length,
        active: stream.active,
      })

      addLog("getUserMedia successful")
      return stream
    } catch (error) {
      updateTestResult("getUserMedia", "error", `Failed to get user media: ${error}`)
      addLog(`getUserMedia error: ${error}`)
      throw error
    }
  }

  // Test Web Audio API
  const testWebAudioAPI = async (stream: MediaStream) => {
    updateTestResult("Web Audio API", "pending", "Testing Web Audio API...")

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8

      source.connect(analyser)
      analyserRef.current = analyser

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const checkLevel = () => {
        if (!analyserRef.current) return

        analyserRef.current.getByteFrequencyData(dataArray)

        // Calculate average
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i]
        }
        const average = sum / dataArray.length

        setWebAudioLevel(average)
        setAudioLevel(average)

        // Also try time domain data
        analyserRef.current.getByteTimeDomainData(dataArray)
        let max = 0
        for (let i = 0; i < dataArray.length; i++) {
          const value = Math.abs(dataArray[i] - 128)
          if (value > max) max = value
        }
        setStreamLevel(max)

        animationRef.current = requestAnimationFrame(checkLevel)
      }

      checkLevel()

      updateTestResult("Web Audio API", "success", "Web Audio API initialized successfully", {
        sampleRate: audioContext.sampleRate,
        state: audioContext.state,
      })

      addLog(`Web Audio API initialized - Sample rate: ${audioContext.sampleRate}Hz`)
    } catch (error) {
      updateTestResult("Web Audio API", "error", `Web Audio API failed: ${error}`)
      addLog(`Web Audio API error: ${error}`)
    }
  }

  // Test MediaRecorder
  const testMediaRecorder = async (stream: MediaStream) => {
    updateTestResult("MediaRecorder", "pending", "Testing MediaRecorder...")

    try {
      const mimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"]

      let selectedMimeType = ""
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType
          break
        }
      }

      if (!selectedMimeType) {
        throw new Error("No supported audio MIME types found")
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
      })

      mediaRecorderRef.current = mediaRecorder
      recordedChunks.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data)
          setMediaRecorderLevel(event.data.size)
          addLog(`Received audio chunk: ${event.data.size} bytes`)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: selectedMimeType })
        const url = URL.createObjectURL(blob)
        setRecordedAudio(url)
        addLog(`Recording complete: ${blob.size} bytes`)
      }

      updateTestResult("MediaRecorder", "success", `MediaRecorder ready with ${selectedMimeType}`, {
        mimeType: selectedMimeType,
        state: mediaRecorder.state,
      })

      addLog(`MediaRecorder initialized with ${selectedMimeType}`)
    } catch (error) {
      updateTestResult("MediaRecorder", "error", `MediaRecorder failed: ${error}`)
      addLog(`MediaRecorder error: ${error}`)
    }
  }

  // Run all tests
  const runAllTests = async () => {
    setLogs([])
    setTestResults([])
    addLog("Starting comprehensive microphone tests...")

    // Check permissions
    await checkPermissions()

    // Get devices
    await getAudioDevices()

    try {
      // Test getUserMedia
      const stream = await testGetUserMedia()

      // Test Web Audio API
      await testWebAudioAPI(stream)

      // Test MediaRecorder
      await testMediaRecorder(stream)

      addLog("All tests completed")
    } catch (error) {
      addLog(`Test suite failed: ${error}`)
    }
  }

  // Start recording
  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
      recordedChunks.current = []
      mediaRecorderRef.current.start(100) // Record in 100ms chunks
      setIsRecording(true)
      addLog("Recording started")
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      addLog("Recording stopped")
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            ← Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Microphone Diagnostic Tool</CardTitle>
          <CardDescription>Comprehensive testing to diagnose microphone issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={runAllTests} size="lg">
              <Mic className="mr-2 h-4 w-4" />
              Run All Tests
            </Button>

            {streamRef.current && (
              <>
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  variant={isRecording ? "destructive" : "default"}
                >
                  {isRecording ? (
                    <>
                      <Square className="mr-2 h-4 w-4" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" />
                      Start Recording
                    </>
                  )}
                </Button>
              </>
            )}
          </div>

          {audioDevices.length > 0 && (
            <div>
              <label className="text-sm font-medium">Select Microphone:</label>
              <select
                className="w-full mt-1 p-2 border rounded"
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
              >
                {audioDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audio Levels */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Audio Levels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Web Audio API Level</span>
              <span className="text-sm">{webAudioLevel.toFixed(1)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-100"
                style={{ width: `${(webAudioLevel / 255) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Time Domain Level</span>
              <span className="text-sm">{streamLevel.toFixed(1)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-600 h-4 rounded-full transition-all duration-100"
                style={{ width: `${(streamLevel / 128) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Visual Meter</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-8 rounded transition-all duration-100"
                  style={{
                    backgroundColor: webAudioLevel > i * 12 ? "#3B82F6" : "#E5E7EB",
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {testResults.map((result) => (
              <div key={result.name} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  {result.status === "success" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                  {result.status === "error" && <XCircle className="h-5 w-5 text-red-600" />}
                  {result.status === "pending" && <AlertCircle className="h-5 w-5 text-yellow-600 animate-pulse" />}
                  <div>
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-muted-foreground">{result.message}</div>
                  </div>
                </div>
                {result.details && (
                  <Badge variant="outline" className="text-xs">
                    {typeof result.details === "object" ? JSON.stringify(result.details) : result.details}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recorded Audio */}
      {recordedAudio && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recorded Audio</CardTitle>
          </CardHeader>
          <CardContent>
            <audio controls src={recordedAudio} className="w-full mb-2" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const a = document.createElement("a")
                a.href = recordedAudio
                a.download = "microphone-test.webm"
                a.click()
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Recording
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Debug Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-3 rounded text-xs font-mono max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet. Run tests to see debug information.</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Troubleshooting Tips:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Make sure your microphone is not muted in your system settings</li>
            <li>• Check if other applications can access your microphone</li>
            <li>• Try selecting a different microphone if multiple are available</li>
            <li>• Ensure you've granted microphone permissions to your browser</li>
            <li>• Speak loudly and clearly when testing audio levels</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
