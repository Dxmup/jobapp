"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, BrainCircuit, MessageSquare, Play, Pause, Volume2, RotateCcw } from "lucide-react"

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
  "/audio/difficultteammatequestion.wav",
  "/audio/newtechquestion.wav",
  "/audio/codemistakequestion.wav",
  "/audio/genzquestion.wav",
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
  const [playedAudioFiles, setPlayedAudioFiles] = useState<string[]>([])
  const [availableAudioFiles, setAvailableAudioFiles] = useState<string[]>(audioFiles)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const generateQuestions = async () => {
    if (!jobTitle.trim() || isDisabled) return

    setIsGenerating(true)
    onActionUsed?.()

    try {
      // Simulate API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // For demo, mix sample questions with job-specific ones
      const jobSpecificQuestions = [
        `What specific experience do you have with ${jobTitle} responsibilities?`,
        `How would you approach the key challenges in ${jobTitle}?`,
        `What tools and technologies are you familiar with for ${jobTitle}?`,
        ...sampleQuestions.slice(0, 5),
      ]

      setQuestions(jobSpecificQuestions)
    } catch (error) {
      console.error("Error generating questions:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const resetAudioQueue = () => {
    setPlayedAudioFiles([])
    setAvailableAudioFiles(audioFiles)
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsPlaying(false)
    setCurrentAudio(null)
  }

  const playRandomAudio = () => {
    if (isDisabled) return

    if (isPlaying && audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      setCurrentAudio(null)
      return
    }

    // Check if all questions have been played
    if (availableAudioFiles.length === 0) {
      return
    }

    // Select random audio file from available ones
    const randomIndex = Math.floor(Math.random() * availableAudioFiles.length)
    const selectedAudio = availableAudioFiles[randomIndex]

    setCurrentAudio(selectedAudio)
    setIsPlaying(true)
    onActionUsed?.()

    // Create and play audio
    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(selectedAudio)
    audioRef.current = audio

    audio.onended = () => {
      setIsPlaying(false)
      setCurrentAudio(null)

      // Remove the played audio from available files and add to played files
      setPlayedAudioFiles((prev) => [...prev, selectedAudio])
      setAvailableAudioFiles((prev) => prev.filter((file) => file !== selectedAudio))
    }

    audio.onerror = () => {
      setIsPlaying(false)
      setCurrentAudio(null)
      console.error("Error playing audio file")
    }

    audio.play().catch((error) => {
      console.error("Error playing audio:", error)
      setIsPlaying(false)
      setCurrentAudio(null)
    })
  }

  const getAudioFileName = (filePath: string) => {
    return filePath.split("/").pop()?.replace(".wav", "") || ""
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
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={playRandomAudio}
              disabled={isDisabled || availableAudioFiles.length === 0}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Stop Audio
                </>
              ) : availableAudioFiles.length === 0 ? (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  All Questions Completed!
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Play Random Question
                </>
              )}
            </Button>

            {playedAudioFiles.length > 0 && (
              <Button
                onClick={resetAudioQueue}
                disabled={isDisabled}
                variant="outline"
                size="lg"
                className="border-purple-200 text-purple-700 hover:bg-purple-50 bg-transparent"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Queue
              </Button>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-4">
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {playedAudioFiles.length} / {audioFiles.length} Questions Practiced
            </Badge>
            {availableAudioFiles.length > 0 && (
              <Badge variant="outline" className="border-cyan-200 text-cyan-700">
                {availableAudioFiles.length} Remaining
              </Badge>
            )}
          </div>

          {currentAudio && (
            <div className="text-center">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                🎧 Playing: {getAudioFileName(currentAudio)}
              </Badge>
            </div>
          )}

          {/* Completion Message */}
          {availableAudioFiles.length === 0 && playedAudioFiles.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
              <h4 className="font-medium text-green-800 mb-2">🎉 Great job!</h4>
              <p className="text-sm text-green-700">
                You've practiced all {audioFiles.length} interview questions. Click "Reset Queue" to practice again.
              </p>
            </div>
          )}

          <div className="bg-white/80 p-4 rounded-lg border border-purple-100">
            <h4 className="font-medium text-purple-800 mb-2">🎯 How to Practice:</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Click "Play Random Question" to hear a unique interview question</li>
              <li>• Each question will only play once until you reset the queue</li>
              <li>• Listen carefully and take a moment to think</li>
              <li>• Answer out loud as if you're in a real interview</li>
              <li>• Track your progress as you complete each question</li>
            </ul>
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

      {/* Generated Questions */}
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
