"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, MessageSquare, Briefcase, Clock } from "lucide-react"

const sampleQuestions = [
  "Tell me about yourself and your background in software development.",
  "What interests you most about this Senior Frontend Developer position?",
  "Describe a challenging project you've worked on and how you overcame obstacles.",
  "How do you stay current with the latest frontend technologies and best practices?",
  "Walk me through your approach to debugging a complex React application.",
  "How do you ensure your code is maintainable and scalable?",
  "Describe a time when you had to collaborate with designers and backend developers.",
  "What's your experience with testing frameworks and writing unit tests?",
]

export function InterviewPrepTab() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [questions, setQuestions] = useState<string[]>([])
  const [jobTitle, setJobTitle] = useState("Senior Frontend Developer")

  const generateQuestions = async () => {
    setIsGenerating(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setQuestions(sampleQuestions)
    setIsGenerating(false)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
          <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">AI Interview Preparation</span>
        </div>
        <h3 className="text-2xl font-bold">Practice with Confidence</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get personalized interview questions based on the job description. Practice your responses and build
          confidence for the real interview.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Job Position
            </CardTitle>
            <CardDescription>The AI will generate questions specific to this role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-lg">{jobTitle}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                We're looking for an experienced frontend developer to join our team and help build the next generation
                of our web applications using React, TypeScript, and modern development practices.
              </p>
            </div>
            <Button onClick={generateQuestions} disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                "Generate Interview Questions"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Interview Questions
              {questions.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {questions.length} questions
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {questions.length > 0
                ? "Practice these questions to prepare for your interview"
                : "Click generate to see personalized questions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {questions.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {questions.map((question, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-relaxed flex-1">{question}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Generate questions to start practicing</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {questions.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-purple-950/20 dark:to-cyan-950/20 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-lg">Practice Tips</h4>
                <p className="text-sm text-muted-foreground">
                  Practice answering these questions out loud. Use the STAR method (Situation, Task, Action, Result) for
                  behavioral questions. Take your time and provide specific examples from your experience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
