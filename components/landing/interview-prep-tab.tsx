"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play, Pause, Volume2, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface InterviewPrepTabProps {
  onActionUsed: () => void
  isDisabled: boolean
}

export function InterviewPrepTab({ onActionUsed, isDisabled }: InterviewPrepTabProps) {
  const [jobTitle, setJobTitle] = useState("")
  const [questions, setQuestions] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [audioError, setAudioError] = useState("")
  const [currentAudioFile, setCurrentAudioFile] = useState("")

  // Audio files array (removed genzquestion, added new ones)
  const audioFiles = [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/difficultteammatequestion-hPIXXsN5e15tA3YlhGky9PIeJWcZUb.wav",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/newtechquestion-3vsI3VbdOCoyszqpNAapMKUS8scz9i.wav",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/codemistakequestion-s5LhJ5QiYjKSyfNLrUksMgFePT4mWz.wav",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download-jhC1raOD49xzJHMVoOOJ3RHXCa3iwz.wav",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download%20%281%29-U3vEdmwNUMLvvYIbAzyVcQXKo9Djjm.wav",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download%20%282%29-S4u2yrMQHemhK7S8K1ip1MRQ8I8Rzx.wav",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download%20%283%29-eUh0v4ExZM8ZPI6yet2IoYN8T3VvSO.wav",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download%20%284%29-bLtfrfbqEWvee9WFcOVpF0K2TnK04x.wav",
  ]

  const generateQuestions = async () => {
    if (!jobTitle.trim() || isDisabled) return

    // Call the action used callback
    onActionUsed()

    setIsGenerating(true)
    try {
      const response = await fetch("/api/landing/generate-interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle: jobTitle.trim() }),
      })

      if (!response.ok) throw new Error("Failed to generate questions")

      const data = await response.json()
      setQuestions(data.questions || [])
    } catch (error) {
      console.error("Error generating questions:", error)
      setQuestions([
        "Tell me about yourself and your background.",
        "Why are you interested in this position?",
        "What are your greatest strengths?",
        "Describe a challenging situation you faced and how you handled it.",
        "Where do you see yourself in 5 years?",
      ])
    } finally {
      setIsGenerating(false)
    }
  }

  const playRandomAudio = async () => {
    if (isDisabled) return

    // Call the action used callback
    onActionUsed()

    if (currentAudio && isPlaying) {
      currentAudio.pause()
      setIsPlaying(false)
      setCurrentAudio(null)
      return
    }

    setIsLoading(true)
    setAudioError("")

    try {
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.currentTime = 0
      }

      // Select random audio file
      const randomFile = audioFiles[Math.floor(Math.random() * audioFiles.length)]
      setCurrentAudioFile(randomFile)

      // Create and configure new audio
      const audio = new Audio()

      // Set up event listeners before setting source
      const loadPromise = new Promise<void>((resolve, reject) => {
        const onCanPlay = () => {
          audio.removeEventListener("canplaythrough", onCanPlay)
          audio.removeEventListener("error", onError)
          resolve()
        }

        const onError = (e: Event) => {
          audio.removeEventListener("canplaythrough", onCanPlay)
          audio.removeEventListener("error", onError)
          reject(new Error("Failed to load audio"))
        }

        audio.addEventListener("canplaythrough", onCanPlay)
        audio.addEventListener("error", onError)
      })

      // Set up playback event listeners
      audio.addEventListener("play", () => setIsPlaying(true))
      audio.addEventListener("pause", () => setIsPlaying(false))
      audio.addEventListener("ended", () => {
        setIsPlaying(false)
        setCurrentAudio(null)
      })

      // Load the audio
      audio.src = randomFile
      audio.load()

      // Wait for audio to be ready
      await loadPromise

      // Play the audio
      await audio.play()
      setCurrentAudio(audio)
    } catch (error) {
      console.error("Audio error:", error)
      setAudioError("Unable to play audio. Please try again.")
      setIsPlaying(false)
      setCurrentAudio(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          AI Interview Practice
        </CardTitle>
        <CardDescription>Generate tailored interview questions and practice with audio prompts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Job Title Input */}
        <div className="space-y-2">
          <Label htmlFor="job-title">Job Title or Role</Label>
          <Input
            id="job-title"
            placeholder="e.g., Software Engineer, Marketing Manager, Data Analyst"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            disabled={isDisabled}
          />
        </div>

        {/* Generate Questions Button */}
        <Button
          onClick={generateQuestions}
          disabled={!jobTitle.trim() || isGenerating || isDisabled}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Questions...
            </>
          ) : (
            "Generate Interview Questions"
          )}
        </Button>

        {/* Audio Practice Section */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Audio Interview Practice</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Practice with real interview questions. Click to hear a random question and practice your response.
          </p>

          {audioError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{audioError}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-4">
            <Button
              onClick={playRandomAudio}
              disabled={isDisabled || isLoading}
              variant="outline"
              className="w-full bg-transparent"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading Audio...
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Question
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Play Random Question
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Generated Questions Display */}
        {questions.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Practice Questions for {jobTitle}</h3>
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Question {index + 1}:</p>
                  <p className="text-sm mt-1">{question}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demo Note */}
        <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
          <p className="font-medium mb-1">Demo Feature</p>
          <p>
            This is a preview of our AI interview prep tool. Sign up for unlimited access to personalized questions and
            advanced practice features.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
