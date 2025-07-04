"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, BrainCircuit, MessageSquare, Play, Pause, Volume2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const audioFiles = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/difficultteammatequestion-hPIXXsN5e15tA3YlhGky9PIeJWcZUb.wav",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/newtechquestion-3vsI3VbdOCoyszqpNAapMKUS8scz9i.wav",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/codemistakequestion-s5LhJ5QiYjKSyfNLrUksMgFePT4mWz.wav",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download%20%282%29-WOGKBWYAgLx2L7GyvOQgKdSxFpk0Vn.wav",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download-cgfB7a6LlKpVSstDYOn6JOK8XDDgSQ.wav",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download%20%281%29-B5pYd2GCeLjIfZjnzYt39zxNMFdsJQ.wav",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download%20%283%29-7RBnZI3lr55ayuwdRWupacowLjumDp.wav",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download%20%284%29-9ryXfGgTMt2UjRnd8aABTmpKK8YSWd.wav",
]

interface InterviewPrepTabProps {
  onActionUsed?: () => void
  isDisabled?: boolean
}

export function InterviewPrepTab({ onActionUsed, isDisabled }: InterviewPrepTabProps) {
  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [questions, setQuestions] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const generateQuestions = async () => {
    if (!jobTitle.trim() || isDisabled) return

    setIsGenerating(true)
    setError(null)
    onActionUsed?.()

    try {
      // Create a more substantial job description if none provided
      let effectiveJobDescription = jobDescription.trim()

      if (!effectiveJobDescription) {
        effectiveJobDescription = `Job Title: ${jobTitle.trim()}

We are looking for a qualified ${jobTitle.trim()} to join our team. The ideal candidate will have relevant experience in this role and demonstrate strong problem-solving skills, excellent communication abilities, and the capacity to work effectively in a collaborative environment. This position offers opportunities for professional growth and development.`
      }

      // Ensure minimum length requirement
      if (effectiveJobDescription.length < 50) {
        effectiveJobDescription += ` The successful candidate will contribute to our team's success and help drive our company's mission forward. We value innovation, teamwork, and professional excellence in all our endeavors.`
      }

      const response = await fetch("/api/landing/generate-interview-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: effectiveJobDescription,
          role: jobTitle.trim(),
          experience: "entry to mid-level",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success || !data.questions || !Array.isArray(data.questions)) {
        throw new Error("Invalid response format from API")
      }

      setQuestions(data.questions)
    } catch (error) {
      console.error("Error generating questions:", error)
      setError(error instanceof Error ? error.message : "Failed to generate questions. Please try again.")

      // Fallback to sample questions in case of error
      const fallbackQuestions = [
        `What specific experience do you have with ${jobTitle} responsibilities?`,
        `How would you approach the key challenges in ${jobTitle}?`,
        `What tools and technologies are you familiar with for ${jobTitle}?`,
        "Tell me about yourself and your background.",
        "Why are you interested in this position?",
        "What are your greatest strengths and weaknesses?",
        "Describe a challenging project you worked on and how you overcame obstacles.",
        "Where do you see yourself in 5 years?",
      ]
      setQuestions(fallbackQuestions)
    } finally {
      setIsGenerating(false)
    }
  }

  const playRandomAudio = () => {
    if (isDisabled) return

    if (isPlaying && audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      setCurrentAudio(null)
      return
    }

    const randomIndex = Math.floor(Math.random() * audioFiles.length)
    const selectedAudio = audioFiles[randomIndex]

    setCurrentAudio(selectedAudio)
    setIsPlaying(true)
    onActionUsed?.()

    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(selectedAudio)
    audioRef.current = audio

    audio.onended = () => {
      setIsPlaying(false)
      setCurrentAudio(null)
    }

    audio.onerror = () => {
      setIsPlaying(false)
      setCurrentAudio(null)
    }

    audio.play().catch(() => {
      setIsPlaying(false)
      setCurrentAudio(null)
    })
  }

  return (
    <div className="space-y-6">
      {/* Audio Practice Section */}
      <Card className="bg-gradient-to-r from-purple-50 to-cyan-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Volume2 className="w-5 h-5" />
            Practice with Real Interview Questions
          </CardTitle>
          <CardDescription>Listen to actual interview questions and practice your responses out loud</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center">
            <Button
              onClick={playRandomAudio}
              disabled={isDisabled}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Stop Audio
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Play Random Question
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Input Form */}
      <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <BrainCircuit className="w-5 h-5" />
            Generate Custom Questions
          </CardTitle>
          <CardDescription>
            Get personalized interview questions based on the specific job you're applying for
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-title">Job Title *</Label>
            <Input
              id="job-title"
              placeholder="e.g., Senior Software Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="border-purple-200 focus:border-purple-400"
              disabled={isDisabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-description">Job Description (Optional)</Label>
            <Textarea
              id="job-description"
              placeholder="Paste the job description here for more targeted questions... (If left empty, we'll generate questions based on the job title)"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="border-purple-200 focus:border-purple-400 min-h-[100px]"
              disabled={isDisabled}
            />
            <p className="text-xs text-gray-500">
              💡 Tip: Adding a job description will generate more specific and relevant questions
            </p>
          </div>

          <Button
            onClick={generateQuestions}
            disabled={!jobTitle.trim() || isGenerating || isDisabled}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Interview Questions
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <MessageSquare className="w-5 h-5" />
                Interview Questions
              </CardTitle>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {questions.length} Questions
              </Badge>
            </div>
            <CardDescription>
              Practice these questions to prepare for your interview. Take time to think through your responses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-purple-50 to-cyan-50 rounded-lg border border-purple-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-slate-700 leading-relaxed">{question}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">💡 Practice Tips:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Practice answering out loud, not just in your head</li>
                <li>• Use the STAR method (Situation, Task, Action, Result) for behavioral questions</li>
                <li>• Prepare specific examples from your experience</li>
                <li>• Practice with a friend or record yourself</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
