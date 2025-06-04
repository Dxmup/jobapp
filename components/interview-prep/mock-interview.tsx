"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowLeft, Mic, MicOff, Phone, PhoneOff, Volume2 } from "lucide-react"
import Link from "next/link"
import { GeminiLiveClient } from "@/lib/gemini-live-api"

interface Job {
  id: string
  title: string
  company: string
  description: string
}

interface Resume {
  id: string
  name: string
  content: string
}

interface Questions {
  technical: string[]
  behavioral: string[]
}

interface MockInterviewProps {
  job: Job
  resume?: Resume | null
  questions: Questions
}

type InterviewState = "setup" | "connecting" | "active" | "ended" | "error"

interface Message {
  speaker: "interviewer" | "candidate"
  message: string
  timestamp: Date
  audioUrl?: string
}

// Audio message from the Live API
interface AudioMessage {
  data: string // base64 encoded audio data
  timestamp: number
}

export const MockInterview: React.FC<MockInterviewProps> = ({ job, resume, questions }) => {
  const router = useRouter()
  const [interviewState, setInterviewState] = useState<InterviewState>("setup")
  const [isRecording, setIsRecording] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [conversation, setConversation] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [debugMessages, setDebugMessages] = useState<string[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechEndDetected, setSpeechEndDetected] = useState(false)
  const [waitingForResponse, setWaitingForResponse] = useState(false)
  const [canManuallyEnd, setCanManuallyEnd] = useState(false)

  // Audio accumulation for proper playback
  const [audioMessages, setAudioMessages] = useState<AudioMessage[]>([])
  const [isAccumulatingAudio, setIsAccumulatingAudio] = useState(false)
  const audioChunkTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastChunkTimeRef = useRef<number>(0)
  const speechActivityTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const nextQuestionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Refs
  const conversationEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const liveClientRef = useRef<GeminiLiveClient | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const audioAnalyserRef = useRef<AnalyserNode | null>(null)
  const lastAudioLevelRef = useRef<number>(0)
  const silenceStartTimeRef = useRef<number | null>(null)
  const speakingStartTimeRef = useRef<number | null>(null)

  // Ensure questions have default values
  const safeQuestions = {
    technical: questions?.technical || [],
    behavioral: questions?.behavioral || [],
  }

  const allQuestions = [...safeQuestions.technical, ...safeQuestions.behavioral]

  const addDebugMessage = useCallback((message: string) => {
    console.log(`[DEBUG] ${message}`)
    setDebugMessages((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }, [])

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation])

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  // Monitor for audio chunks and play after a pause in receiving
  useEffect(() => {
    if (audioMessages.length > 0 && !isAudioPlaying) {
      const now = Date.now()

      // If it's been more than 1000ms since the last chunk, play the audio
      if (now - lastChunkTimeRef.current > 1000) {
        if (audioChunkTimeoutRef.current) {
          clearTimeout(audioChunkTimeoutRef.current)
          audioChunkTimeoutRef.current = null
        }

        addDebugMessage(`No new chunks for 1000ms, playing ${audioMessages.length} accumulated chunks`)
        playAccumulatedAudio()
      } else {
        // Clear any existing timeout
        if (audioChunkTimeoutRef.current) {
          clearTimeout(audioChunkTimeoutRef.current)
        }

        // Set a new timeout to play audio after 1000ms of no new chunks
        audioChunkTimeoutRef.current = setTimeout(() => {
          addDebugMessage(`Timeout reached, playing ${audioMessages.length} accumulated chunks`)
          playAccumulatedAudio()
        }, 1000)
      }
    }

    return () => {
      if (audioChunkTimeoutRef.current) {
        clearTimeout(audioChunkTimeoutRef.current)
      }
    }
  }, [audioMessages])

  // Force play accumulated audio after a certain number of chunks
  useEffect(() => {
    if (audioMessages.length >= 5 && !isAudioPlaying) {
      if (audioChunkTimeoutRef.current) {
        clearTimeout(audioChunkTimeoutRef.current)
        audioChunkTimeoutRef.current = null
      }

      addDebugMessage(`Reached 5 chunks threshold, playing accumulated audio`)
      playAccumulatedAudio()
    }
  }, [audioMessages])

  // Auto-trigger next question after 6 seconds of silence (increased from 4)
  useEffect(() => {
    if (speechEndDetected && !isAudioPlaying && !isSpeaking && !waitingForResponse) {
      // Clear any existing timeout
      if (nextQuestionTimeoutRef.current) {
        clearTimeout(nextQuestionTimeoutRef.current)
      }

      // Set a new timeout to trigger the next question after 6 seconds
      nextQuestionTimeoutRef.current = setTimeout(() => {
        if (speechEndDetected && !isAudioPlaying && !isSpeaking && !waitingForResponse) {
          addDebugMessage("Auto-triggering next question after 6 seconds of silence")
          triggerNextQuestion()
        }
      }, 6000)
    }

    return () => {
      if (nextQuestionTimeoutRef.current) {
        clearTimeout(nextQuestionTimeoutRef.current)
      }
    }
  }, [speechEndDetected, isAudioPlaying, isSpeaking, waitingForResponse])

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    if (processorRef.current) {
      processorRef.current.disconnect()
    }
    if (audioAnalyserRef.current) {
      audioAnalyserRef.current.disconnect()
    }
    if (liveClientRef.current) {
      liveClientRef.current.disconnect()
    }
    if (audioChunkTimeoutRef.current) {
      clearTimeout(audioChunkTimeoutRef.current)
    }
    if (speechActivityTimeoutRef.current) {
      clearTimeout(speechActivityTimeoutRef.current)
    }
    if (nextQuestionTimeoutRef.current) {
      clearTimeout(nextQuestionTimeoutRef.current)
    }
    speakingStartTimeRef.current = null
    setCanManuallyEnd(false)
  }

  const setupAudioRecording = async (): Promise<void> => {
    try {
      addDebugMessage("Setting up audio recording...")

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      streamRef.current = stream

      // Use webkitAudioContext as fallback
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      const audioContext = new AudioContextClass({ sampleRate: 16000 })
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)

      // Create an analyser to detect speech activity
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      audioAnalyserRef.current = analyser

      source.connect(analyser)

      // Setup audio processor for sending audio to API
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor

      source.connect(processor)
      processor.connect(audioContext.destination)

      // Setup speech activity detection
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      // Function to check audio levels
      const checkAudioLevel = () => {
        if (!isRecording || isMuted) {
          requestAnimationFrame(checkAudioLevel)
          return
        }

        analyser.getByteFrequencyData(dataArray)

        // Calculate average level
        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i]
        }
        const average = sum / bufferLength

        // Log audio levels every 1 second for debugging (changed from 3 seconds)
        if (Date.now() % 1000 < 100) {
          const speakingDuration = speakingStartTimeRef.current ? Date.now() - speakingStartTimeRef.current : 0
          addDebugMessage(
            `🔊 Audio: ${average.toFixed(1)} (threshold: 3) | Speaking: ${isSpeaking} (${speakingDuration}ms) | Silence: ${silenceStartTimeRef.current ? Date.now() - silenceStartTimeRef.current : 0}ms`,
          )
        }

        // Detect speech activity (lowered threshold even further)
        const isSpeechActive = average > 3 // Lowered from 5 to 3

        if (isSpeechActive) {
          if (!isSpeaking) {
            addDebugMessage(`🎤 Speech activity detected (level: ${average.toFixed(1)}) - You are now speaking`)
            setIsSpeaking(true)
            setWaitingForResponse(false)
            speakingStartTimeRef.current = Date.now() // Track when speaking started

            // Add visual feedback to conversation
            addToConversation("candidate", "🎤 Speaking...")

            // Enable manual end after 2 seconds of speaking
            setTimeout(() => {
              if (isSpeaking) {
                setCanManuallyEnd(true)
                addDebugMessage("Manual 'Done Speaking' button now available")
              }
            }, 2000)
          }

          // Reset silence timer
          silenceStartTimeRef.current = null
          setSpeechEndDetected(false)
        } else {
          // If we were speaking but now silent, start tracking silence
          if (isSpeaking) {
            // Only start tracking silence if we've been speaking for at least 2 seconds
            const speakingDuration = speakingStartTimeRef.current ? Date.now() - speakingStartTimeRef.current : 0

            if (speakingDuration < 2000) {
              // Haven't been speaking long enough, don't start silence detection yet
              addDebugMessage(`Not tracking silence yet - only spoke for ${speakingDuration}ms (need 2000ms)`)
              return
            }

            if (silenceStartTimeRef.current === null) {
              silenceStartTimeRef.current = Date.now()
              addDebugMessage("🔇 Started tracking silence (after minimum speaking duration)")
            } else {
              // If silence has continued for 3 seconds (increased from 1), consider speech ended
              const silenceDuration = Date.now() - silenceStartTimeRef.current
              if (silenceDuration > 3000 && !speechEndDetected) {
                addDebugMessage(
                  `✅ End of speech detected (${silenceDuration}ms silence after ${speakingDuration}ms speaking)`,
                )
                setIsSpeaking(false)
                setSpeechEndDetected(true)
                speakingStartTimeRef.current = null // Reset speaking start time

                // Update the conversation to show speech ended
                setConversation((prev) => {
                  const updated = [...prev]
                  const lastMessage = updated[updated.length - 1]
                  if (lastMessage && lastMessage.speaker === "candidate" && lastMessage.message === "🎤 Speaking...") {
                    lastMessage.message = "✅ Finished speaking - waiting for response..."
                  }
                  return updated
                })

                // Send explicit end of audio stream
                if (liveClientRef.current && liveClientRef.current.isSessionConnected()) {
                  liveClientRef.current
                    .sendAudioStreamEnd()
                    .then(() => {
                      addDebugMessage("📤 Sent explicit audioStreamEnd signal")
                      setWaitingForResponse(true)
                    })
                    .catch((err) => {
                      addDebugMessage(`❌ Error sending audioStreamEnd: ${err}`)
                    })
                }
              }
            }
          }
        }

        lastAudioLevelRef.current = average

        // Continue checking
        requestAnimationFrame(checkAudioLevel)
      }

      // Start monitoring audio levels
      checkAudioLevel()

      processor.onaudioprocess = (event) => {
        if (isRecording && liveClientRef.current && !isMuted) {
          const inputBuffer = event.inputBuffer
          const inputData = inputBuffer.getChannelData(0)

          // Convert to 16-bit PCM
          const pcmData = new Int16Array(inputData.length)
          for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7fff
          }

          // Send to Live API if connected
          if (liveClientRef.current.isSessionConnected()) {
            liveClientRef.current.sendAudio(pcmData.buffer).catch((err) => {
              addDebugMessage(`Error sending audio: ${err.message}`)
            })
          }
        }
      }

      addDebugMessage("Audio recording setup complete")
    } catch (error) {
      addDebugMessage(`Audio setup error: ${error}`)
      throw error
    }
  }

  const startInterview = async () => {
    try {
      setInterviewState("connecting")
      setError(null)
      setDebugMessages([])
      addDebugMessage("Starting interview...")

      // Get API key
      const response = await fetch("/api/interview/start-live-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          resumeId: resume?.id,
          questions: safeQuestions,
          jobDescription: job.description,
          resumeContent: resume?.content,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || "Failed to start session")
      }

      const { apiKey, sessionData } = await response.json()
      addDebugMessage("Session data received")

      // Setup audio first
      await setupAudioRecording()

      // Initialize Live API client
      const liveClient = new GeminiLiveClient(apiKey)
      liveClientRef.current = liveClient

      liveClient.setCallbacks({
        onOpen: () => {
          addDebugMessage("Live API connected")
          setInterviewState("active")
          setIsRecording(true)
          setIsSpeaking(false)
          setSpeechEndDetected(false)
          setWaitingForResponse(false)

          // Add a welcome message to the conversation
          addToConversation("interviewer", "Connection established. The interview will begin shortly...")
        },
        onMessage: (message) => {
          const messageTypes = Object.keys(message).join(", ")
          addDebugMessage(`Received message type: ${messageTypes}`)

          // Log the full message for debugging
          console.log("Full Live API message:", message)

          handleLiveAPIMessage(message)

          // Reset waiting for response when we get a message
          setWaitingForResponse(false)
        },
        onError: (error) => {
          addDebugMessage(`Live API error: ${error}`)
          setError(`Connection error: ${error}`)

          // If we're still in connecting state, move to error state
          if (interviewState === "connecting") {
            setInterviewState("error")
          }
        },
        onClose: () => {
          addDebugMessage("Live API disconnected")
          setIsRecording(false)

          // If we're still in connecting state, move to error state
          if (interviewState === "connecting") {
            setInterviewState("error")
            setError("Connection closed before interview could start. Please try again.")
          }
        },
      })

      // Connect to Live API
      addDebugMessage("Connecting to Live API...")
      await liveClient.connect({
        jobTitle: job.title,
        company: job.company,
        jobDescription: job.description,
        resume: resume?.content,
        questions: safeQuestions,
      })

      // Set a timeout to check if we're still in connecting state after 15 seconds
      setTimeout(() => {
        if (interviewState === "connecting") {
          addDebugMessage("Connection timeout - still in connecting state after 15 seconds")
          setInterviewState("error")
          setError("Connection timeout. Please try again.")
        }
      }, 15000)
    } catch (error) {
      addDebugMessage(`Start error: ${error}`)
      setError(error instanceof Error ? error.message : "Failed to start interview")
      setInterviewState("error")
    }
  }

  const handleLiveAPIMessage = async (message: any) => {
    // Handle setup complete
    if (message.setupComplete) {
      addDebugMessage("Setup complete received")
      return
    }

    // Handle text responses
    if (message.text) {
      addDebugMessage(`Text response: ${message.text}`)
      addToConversation("interviewer", message.text)
    }

    // Handle server content
    if (message.serverContent) {
      const content = message.serverContent

      // Handle model turn with parts
      if (content.modelTurn?.parts) {
        for (const part of content.modelTurn.parts) {
          // Handle text responses
          if (part.text) {
            addDebugMessage(`Server text: ${part.text}`)
            addToConversation("interviewer", part.text)
          }

          // Handle inline audio data - accumulate chunks
          if (part.inlineData?.data) {
            const audioData = part.inlineData.data
            addDebugMessage(
              `Received audio chunk: ${audioData.length} chars (mimeType: ${part.inlineData.mimeType || "unknown"})`,
            )

            // Only process non-empty audio chunks
            if (audioData && audioData.length > 0) {
              lastChunkTimeRef.current = Date.now()

              // Add to audio messages
              setAudioMessages((prev) => [...prev, { data: audioData, timestamp: Date.now() }])

              if (!isAccumulatingAudio) {
                setIsAccumulatingAudio(true)
              }
            } else {
              addDebugMessage("Skipping empty audio chunk")
            }
          }
        }
      }

      // Handle audio transcription as fallback
      if (content.outputTranscription?.text) {
        addDebugMessage(`Transcript: ${content.outputTranscription.text}`)
        // Add transcript as text if no audio is available
        if (audioMessages.length === 0) {
          addToConversation("interviewer", content.outputTranscription.text)
        }
      }

      // Handle turn complete - play accumulated audio or reset states
      if (content.turnComplete) {
        addDebugMessage("Turn complete - processing accumulated audio")
        if (audioMessages.length > 0) {
          // Clear any pending timeouts
          if (audioChunkTimeoutRef.current) {
            clearTimeout(audioChunkTimeoutRef.current)
            audioChunkTimeoutRef.current = null
          }

          await playAccumulatedAudio()
        } else {
          // No audio to play, reset states immediately
          addDebugMessage("Turn complete with no audio - resetting to listening state")
          setIsSpeaking(false)
          setSpeechEndDetected(false)
          setWaitingForResponse(false)
          setCanManuallyEnd(false)
          silenceStartTimeRef.current = null
        }
      }
    }

    // Handle single audio data (fallback)
    if (message.data && !message.serverContent) {
      addDebugMessage(`Processing single audio response: ${message.data.length} chars`)

      if (message.data && message.data.length > 0) {
        lastChunkTimeRef.current = Date.now()

        // Add to audio messages
        setAudioMessages((prev) => [...prev, { data: message.data, timestamp: Date.now() }])

        if (!isAccumulatingAudio) {
          setIsAccumulatingAudio(true)
        }
      }
    }
  }

  const playAccumulatedAudio = async () => {
    try {
      if (audioMessages.length === 0) {
        addDebugMessage("No audio chunks to play")
        setIsAudioPlaying(false)
        setIsAccumulatingAudio(false)
        return
      }

      // Filter out empty audio messages
      const validAudioMessages = audioMessages.filter((msg) => msg.data && msg.data.length > 0)

      if (validAudioMessages.length === 0) {
        addDebugMessage("No valid audio chunks to play (all empty)")
        setIsAudioPlaying(false)
        setIsAccumulatingAudio(false)
        setAudioMessages([])

        // Reset states since there's no audio
        setIsSpeaking(false)
        setSpeechEndDetected(false)
        setWaitingForResponse(false)
        setCanManuallyEnd(false)
        silenceStartTimeRef.current = null
        addDebugMessage("Reset to listening state - no audio to play")
        return
      }

      setIsAudioPlaying(true)
      addDebugMessage(
        `Playing accumulated audio: ${validAudioMessages.length} valid chunks out of ${audioMessages.length} total`,
      )

      // Sort messages by timestamp to ensure correct order
      const sortedMessages = [...validAudioMessages].sort((a, b) => a.timestamp - b.timestamp)

      // Following the example from LiveAPI.md
      const combinedAudio = sortedMessages.reduce((acc, message) => {
        try {
          // Convert base64 to buffer using a more reliable method
          const base64 = message.data
          const binaryString = window.atob(base64)
          const len = binaryString.length
          const bytes = new Uint8Array(len)

          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }

          // Create Int16Array from the bytes (16-bit PCM)
          // This ensures proper handling of little-endian 16-bit PCM data
          const int16Array = new Int16Array(bytes.buffer)

          // Append the samples to our accumulator
          return acc.concat(Array.from(int16Array))
        } catch (e) {
          addDebugMessage(`Error processing chunk: ${e}`)
          return acc
        }
      }, [] as number[])

      if (combinedAudio.length === 0) {
        addDebugMessage("No valid audio data after processing chunks")
        setIsAudioPlaying(false)
        setIsAccumulatingAudio(false)
        setAudioMessages([])

        // Reset states since there's no audio
        setIsSpeaking(false)
        setSpeechEndDetected(false)
        setWaitingForResponse(false)
        setCanManuallyEnd(false)
        silenceStartTimeRef.current = null
        addDebugMessage("Reset to listening state - no valid audio data")
        return
      }

      // Create Int16Array from combined audio
      const audioBuffer = new Int16Array(combinedAudio)

      // Create WAV file with 24kHz sample rate (Live API output)
      const wavFile = createWavFile(audioBuffer, 24000)

      // Create blob and URL
      const audioBlob = new Blob([wavFile], { type: "audio/wav" })
      const audioUrl = URL.createObjectURL(audioBlob)

      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.onended = () => {
          addDebugMessage("Audio playback ended")
          setIsAudioPlaying(false)

          // Reset all speech detection states when interviewer finishes speaking
          setIsSpeaking(false)
          setSpeechEndDetected(false)
          setWaitingForResponse(false)
          setCanManuallyEnd(false)

          // Reset silence tracking
          silenceStartTimeRef.current = null

          addDebugMessage("Reset to listening state - ready for candidate response")

          URL.revokeObjectURL(audioUrl)
        }
        audioRef.current.onerror = (e) => {
          addDebugMessage(`Audio playback error: ${e}`)
          setIsAudioPlaying(false)
          URL.revokeObjectURL(audioUrl)
        }

        try {
          await audioRef.current.play()
          addDebugMessage("Audio playback started successfully")

          // Add to conversation
          addToConversation("interviewer", "🔊 Audio response", audioUrl)

          // Reset audio messages
          setAudioMessages([])
          setIsAccumulatingAudio(false)
        } catch (e) {
          addDebugMessage(`Audio play error: ${e}`)
          setIsAudioPlaying(false)
        }
      }
    } catch (error) {
      addDebugMessage(`Audio playback error: ${error}`)
      setIsAudioPlaying(false)
      setIsAccumulatingAudio(false)
      setAudioMessages([])
    }
  }

  const createWavFile = (audioData: Int16Array, sampleRate: number): ArrayBuffer => {
    const numSamples = audioData.length
    const bytesPerSample = 2 // 16-bit = 2 bytes
    const numChannels = 1 // Mono

    // WAV header is 44 bytes
    const headerSize = 44
    const dataSize = numSamples * bytesPerSample
    const fileSize = headerSize + dataSize

    const buffer = new ArrayBuffer(fileSize)
    const view = new DataView(buffer)

    // RIFF chunk descriptor
    writeString(view, 0, "RIFF")
    view.setUint32(4, fileSize - 8, true) // File size - 8
    writeString(view, 8, "WAVE")

    // "fmt " sub-chunk
    writeString(view, 12, "fmt ")
    view.setUint32(16, 16, true) // Sub-chunk size (16 for PCM)
    view.setUint16(20, 1, true) // Audio format (1 = PCM)
    view.setUint16(22, numChannels, true) // Number of channels
    view.setUint32(24, sampleRate, true) // Sample rate
    view.setUint32(28, sampleRate * numChannels * bytesPerSample, true) // Byte rate
    view.setUint16(32, numChannels * bytesPerSample, true) // Block align
    view.setUint16(34, 8 * bytesPerSample, true) // Bits per sample

    // "data" sub-chunk
    writeString(view, 36, "data")
    view.setUint32(40, dataSize, true) // Sub-chunk size

    // Write audio data (little-endian)
    for (let i = 0; i < numSamples; i++) {
      view.setInt16(headerSize + i * bytesPerSample, audioData[i], true)
    }

    return buffer
  }

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  const addToConversation = (speaker: "interviewer" | "candidate", message: string, audioUrl?: string) => {
    setConversation((prev) => [
      ...prev,
      {
        speaker,
        message,
        timestamp: new Date(),
        audioUrl,
      },
    ])
  }

  const endInterview = () => {
    addDebugMessage("Ending interview")
    setIsRecording(false)

    // Send audio stream end signal
    if (liveClientRef.current && liveClientRef.current.isSessionConnected()) {
      liveClientRef.current
        .sendAudioStreamEnd()
        .catch((err) => addDebugMessage(`Error sending audio stream end: ${err}`))
    }

    cleanup()
    setInterviewState("ended")
  }

  const toggleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !newMutedState
      })
    }

    // Send audio stream end signal when muting
    if (newMutedState && liveClientRef.current && liveClientRef.current.isSessionConnected()) {
      liveClientRef.current
        .sendAudioStreamEnd()
        .catch((err) => addDebugMessage(`Error sending audio stream end: ${err}`))
    }

    addDebugMessage(`Microphone ${newMutedState ? "muted" : "unmuted"}`)
  }

  const restartInterview = () => {
    cleanup()
    setInterviewState("setup")
    setConversation([])
    setError(null)
    setDebugMessages([])
    setAudioMessages([])
    setIsAccumulatingAudio(false)
    setIsSpeaking(false)
    setSpeechEndDetected(false)
    setWaitingForResponse(false)
    setCanManuallyEnd(false)
    speakingStartTimeRef.current = null
  }

  const testAudio = async () => {
    try {
      addDebugMessage("Testing audio...")
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      const audioContext = new AudioContextClass()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 440
      gainNode.gain.value = 0.1

      oscillator.start()
      setTimeout(() => {
        oscillator.stop()
        audioContext.close()
        addDebugMessage("Test audio complete")
      }, 500)
    } catch (error) {
      addDebugMessage(`Test audio error: ${error}`)
    }
  }

  const triggerNextQuestion = () => {
    if (liveClientRef.current && liveClientRef.current.isSessionConnected()) {
      addDebugMessage("Triggering next question")
      setWaitingForResponse(true)

      // First send an explicit end of audio stream if needed
      liveClientRef.current
        .sendAudioStreamEnd()
        .then(() => {
          // Then trigger the next response
          return liveClientRef.current!.triggerNextResponse()
        })
        .then(() => {
          addDebugMessage("Next question triggered successfully")
        })
        .catch((err) => {
          addDebugMessage(`Error triggering next question: ${err}`)
          setWaitingForResponse(false)
        })
    }
  }

  const manuallyEndSpeech = () => {
    addDebugMessage("Manually ending speech")
    setIsSpeaking(false)
    setSpeechEndDetected(true)
    setCanManuallyEnd(false)
    speakingStartTimeRef.current = null

    // Send explicit end of audio stream
    if (liveClientRef.current && liveClientRef.current.isSessionConnected()) {
      liveClientRef.current
        .sendAudioStreamEnd()
        .then(() => {
          addDebugMessage("Sent manual audioStreamEnd signal")
          setWaitingForResponse(true)
        })
        .catch((err) => {
          addDebugMessage(`Error sending manual audioStreamEnd: ${err}`)
        })
    }
  }

  if (interviewState === "setup") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/interview-prep/${job.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Interview Prep
            </Button>
          </Link>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Mock Phone Interview
            </CardTitle>
            <CardDescription>
              Practice your interview skills with our AI interviewer for the {job.title} position at {job.company}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Job Details</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Position:</strong> {job.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Company:</strong> {job.company}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Resume</h3>
                <p className="text-sm text-muted-foreground">{resume ? resume.name : "No resume selected"}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Interview Questions ({allQuestions.length})</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{safeQuestions.technical.length} Technical</Badge>
                <Badge variant="secondary">{safeQuestions.behavioral.length} Behavioral</Badge>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Before we start:</h3>
              <ul className="text-sm space-y-1">
                <li>• Make sure you're in a quiet environment</li>
                <li>• Check that your microphone is working</li>
                <li>• Speak clearly and at a normal pace</li>
                <li>• The interview will last approximately 15-20 minutes</li>
                <li>• After you finish speaking, wait 6 seconds for the interviewer to respond</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button onClick={startInterview} size="lg" className="flex-1">
                <Phone className="mr-2 h-4 w-4" />
                Start Mock Interview
              </Button>
              <Button onClick={testAudio} variant="outline" size="lg">
                <Volume2 className="mr-2 h-4 w-4" />
                Test Audio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (interviewState === "connecting") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-pulse">
              <Phone className="h-12 w-12 text-blue-600 mb-4" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Connecting to interviewer...</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Please wait while we set up your mock interview session.
            </p>
            <div className="w-full max-h-32 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
              {debugMessages.map((msg, index) => (
                <div key={index} className="text-gray-600">
                  {msg}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (interviewState === "error") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="text-red-500 mb-4">
              <AlertCircle className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
            <p className="text-sm text-red-600 text-center mb-4">
              {error || "Failed to connect to the interview service. Please try again."}
            </p>
            <div className="w-full max-h-32 overflow-y-auto bg-gray-50 p-2 rounded text-xs mb-4">
              {debugMessages.slice(-10).map((msg, index) => (
                <div key={index} className="text-gray-600">
                  {msg}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={restartInterview} variant="outline">
                Try Again
              </Button>
              <Link href={`/dashboard/interview-prep/${job.id}`}>
                <Button>Back to Interview Prep</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (interviewState === "active") {
    return (
      <div className="space-y-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">Interview in Progress</span>
              </div>
              <Badge variant="outline">
                {job.title} at {job.company}
              </Badge>
              {isSpeaking && (
                <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                  Speaking...
                </Badge>
              )}
              {speechEndDetected && !waitingForResponse && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                  Waiting (6s)...
                </Badge>
              )}
              {waitingForResponse && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  Waiting for Response...
                </Badge>
              )}
              {isAccumulatingAudio && (
                <Badge variant="secondary">Receiving Audio ({audioMessages.length} chunks)</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {canManuallyEnd && isSpeaking && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={manuallyEndSpeech}
                  className="bg-blue-50 border-blue-200 hover:bg-blue-100"
                >
                  Done Speaking
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  addDebugMessage("🔄 Manual trigger - forcing next question")
                  triggerNextQuestion()
                }}
                className="bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
              >
                Next Question
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMute}
                className={isMuted ? "bg-red-50 border-red-200" : ""}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button variant="destructive" size="sm" onClick={endInterview}>
                <PhoneOff className="h-4 w-4 mr-2" />
                End Interview
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                {conversation.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.speaker === "candidate" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.speaker === "candidate" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">
                        {message.speaker === "candidate" ? "You" : "Interviewer"}
                      </p>
                      <p className="whitespace-pre-wrap">{message.message}</p>
                      {message.audioUrl && (
                        <audio controls className="mt-2 w-full">
                          <source src={message.audioUrl} type="audio/wav" />
                        </audio>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={conversationEndRef} />
              </div>

              <div className="flex items-center justify-center mt-4">
                <div className="text-center">
                  {isAudioPlaying ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-sm text-muted-foreground">Interviewer speaking...</p>
                    </div>
                  ) : isAccumulatingAudio ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <p className="text-sm text-muted-foreground">
                        Receiving audio ({audioMessages.length} chunks)...
                      </p>
                    </div>
                  ) : isSpeaking ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <p className="text-sm text-muted-foreground">
                        You are speaking...{" "}
                        {canManuallyEnd ? "(Click 'Done Speaking' when finished)" : "(Detecting when you finish)"}
                      </p>
                    </div>
                  ) : speechEndDetected ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                      <p className="text-sm text-muted-foreground">
                        Waiting for interviewer response... (Auto-triggering in 6s)
                      </p>
                    </div>
                  ) : isRecording ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <p className="text-sm text-muted-foreground">
                        Your microphone is active. Speak clearly to respond.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Waiting for response...</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addDebugMessage("Manual state reset triggered")
                    setIsSpeaking(false)
                    setSpeechEndDetected(false)
                    setWaitingForResponse(false)
                    setCanManuallyEnd(false)
                    silenceStartTimeRef.current = null
                  }}
                >
                  Reset State
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (audioMessages.length > 0) {
                      addDebugMessage("Manually playing accumulated audio")
                      playAccumulatedAudio()
                    }
                  }}
                  disabled={audioMessages.length === 0}
                >
                  Force Play Audio ({audioMessages.length})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto bg-gray-50 p-3 rounded text-xs font-mono">
                {debugMessages.map((msg, index) => (
                  <div key={index} className="text-gray-700 mb-1">
                    {msg}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <audio ref={audioRef} className="hidden" />
      </div>
    )
  }

  if (interviewState === "ended") {
    const questionCount = conversation.filter(
      (msg) =>
        msg.speaker === "interviewer" &&
        (msg.message.includes("?") || /^(what|how|why|when|where|who|could|would|do|can|tell)/i.test(msg.message)),
    ).length

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Interview Complete!</CardTitle>
            <CardDescription>
              Great job completing your mock interview for {job.title} at {job.company}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Interview Summary</h3>
              <p className="text-sm">
                You completed a {questionCount > 0 ? questionCount : "brief"} question interview session with{" "}
                {conversation.length} total exchanges.
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={restartInterview} variant="outline">
                Practice Again
              </Button>
              <Link href={`/dashboard/interview-prep/${job.id}`}>
                <Button>Back to Interview Prep</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
