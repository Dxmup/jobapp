"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, BrainCircuit, MessageSquare } from "lucide-react"

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

export function InterviewPrepTab() {
  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [questions, setQuestions] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const generateQuestions = async () => {
    if (!jobTitle.trim()) return

    setIsGenerating(true)

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

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <BrainCircuit className="w-5 h-5" />
            Interview Preparation
          </CardTitle>
          <CardDescription>
            Generate personalized interview questions based on the job you're applying for
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
            />
          </div>

          <Button
            onClick={generateQuestions}
            disabled={!jobTitle.trim() || isGenerating}
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
