"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, Play, Pause } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const sampleQuestions = [
  {
    question: "Tell me about a time when you had to learn a new technology quickly for a project.",
    category: "Behavioral",
    difficulty: "Medium",
  },
  {
    question: "How would you optimize a slow-performing database query?",
    category: "Technical",
    difficulty: "Hard",
  },
  {
    question: "Describe your experience with React and how you've used it in previous projects.",
    category: "Technical",
    difficulty: "Medium",
  },
  {
    question: "How do you handle disagreements with team members during code reviews?",
    category: "Behavioral",
    difficulty: "Medium",
  },
  {
    question: "What interests you most about working at our company?",
    category: "Company Culture",
    difficulty: "Easy",
  },
]

export function InterviewPrepTab() {
  const [jobTitle, setJobTitle] = useState("Software Engineer")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isRecording, setIsRecording] = useState(false)

  const generateQuestions = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch("/api/landing/generate-interview-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle,
          jobDescription: `Looking for a ${jobTitle} with relevant experience and skills.`,
        }),
      })

      const data = await response.json()

      if (data.success) {
        console.log("Generated questions:", data.questions)
        setShowResults(true)
      } else {
        console.error("Error generating questions:", data.error)
        // Still show sample questions on error
        setShowResults(true)
      }
    } catch (error) {
      console.error("Error generating questions:", error)
      // Still show sample questions on error
      setShowResults(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
  }

  const nextQuestion = () => {
    setCurrentQuestion((prev) => (prev + 1) % sampleQuestions.length)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="job-title-ip">Job Title</Label>
            <Input
              id="job-title-ip"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Software Engineer"
            />
          </div>

          <Button
            onClick={generateQuestions}
            disabled={isGenerating || !jobTitle.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Generate Interview Questions
              </>
            )}
          </Button>

          {showResults && (
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Practice Session</CardTitle>
                <CardDescription>
                  Question {currentQuestion + 1} of {sampleQuestions.length}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Badge className={getDifficultyColor(sampleQuestions[currentQuestion].difficulty)}>
                    {sampleQuestions[currentQuestion].difficulty}
                  </Badge>
                  <Badge variant="outline">{sampleQuestions[currentQuestion].category}</Badge>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={toggleRecording} variant={isRecording ? "destructive" : "default"} size="sm">
                    {isRecording ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Start Recording
                      </>
                    )}
                  </Button>
                  <Button onClick={nextQuestion} variant="outline" size="sm">
                    Next Question
                  </Button>
                </div>

                {isRecording && (
                  <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                    <span className="text-sm">Recording your response...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <AnimatePresence>
            {showResults && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card className="border-green-200 dark:border-green-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                      <Users className="mr-2 h-5 w-5" />
                      Interview Questions
                    </CardTitle>
                    <CardDescription>AI-generated questions for {jobTitle}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Current Question:</h4>
                        <p className="text-lg leading-relaxed">{sampleQuestions[currentQuestion].question}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">All Questions:</h4>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                          {sampleQuestions.map((q, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                index === currentQuestion
                                  ? "border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20"
                                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                              }`}
                              onClick={() => setCurrentQuestion(index)}
                            >
                              <div className="flex items-start justify-between">
                                <p className="text-sm flex-1">{q.question}</p>
                                <div className="flex space-x-1 ml-2">
                                  <Badge variant="outline" className="text-xs">
                                    {q.category}
                                  </Badge>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {!showResults && (
            <Card className="border-dashed border-2 border-slate-200 dark:border-slate-700">
              <CardContent className="flex items-center justify-center h-[400px] text-center">
                <div className="space-y-2">
                  <Users className="h-12 w-12 text-slate-400 mx-auto" />
                  <p className="text-slate-500 dark:text-slate-400">Interview questions will appear here</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
