"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, BrainCircuit, MessageSquare, Play, Pause, Volume2 } from "lucide-react"

const sampleQuestions = [
  "Tell me about yourself and your background.",
  "Why are you interested in this position?",
  "What are your greatest strengths and weaknesses?",
  "Describe a challenging project you worked on and how you overcame obstacles.",
  "Where do you see yourself in 5 years?",
  "Why are you leaving your current position?",
  "How do you handle stress and pressure?",
  "What questions do you have for us?",
]

const audioFiles = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/difficultteammatequestion-hPIXXsN5e15tA3YlhGky9PIeJWcZUb.wav",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/newtechquestion-3vsI3VbdOCoyszqpNAapMKUS8scz9i.wav",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/codemistakequestion-s5LhJ5QiYjKSyfNLrUksMgFePT4mWz.wav",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/genzquestion-RdP2yWQ9GjjI3s2BXN1l8X3UfgcqRg.wav",
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
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const generateQuestions = async () => {
    if (!jobTitle.trim() || isDisabled) return

    setIsGenerating(true)
    onActionUsed?.()

    try {
      // Simulate API call for demo
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const jobSpecificQuestions = [
        `What specific experience do you have with ${jobTitle} responsibilities?`,
        `How would you approach the key challenges in ${jobTitle}?`,
        `What tools and technologies are you familiar with for ${jobTitle}?`,
        ...sampleQuestions.slice(0, 5),
      ]

      setQuestions(jobSpecificQuestions)
    } catch (error) {
      // Silent error handling for demo
      setQuestions(sampleQuestions)
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
            <Label htmlFor="job-title">Job Title</Label>
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
              placeholder="Paste the job description here for more targeted questions..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="border-purple-200 focus:border-purple-400 min-h-[100px]"
              disabled={isDisabled}
            />
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
