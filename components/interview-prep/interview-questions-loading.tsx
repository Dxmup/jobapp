"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const loadingMessages = [
  "Analyzing job description...",
  "Reviewing your resume...",
  "Consulting with AI interview experts...",
  "Charging the flux capacitor...",
  "Brewing a cup of interview wisdom...",
  "Summoning the interview gods...",
  "Calculating optimal question difficulty...",
  "Polishing tough questions...",
  "Calibrating the interview-o-meter...",
  "Consulting ancient interview scrolls...",
  "Gathering insights from 1,000+ interviews...",
  "Preparing to make you interview-ready...",
  "Generating questions that will impress...",
  "Aligning the interview stars...",
  "Feeding the AI some interview coffee...",
  "Dusting off the crystal ball...",
  "Tuning the question generator to 11...",
  "Searching for the perfect questions...",
  "Warming up the neural networks...",
  "Applying secret interview sauce...",
]

export function InterviewQuestionsLoading() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((current) => (current + 1) % loadingMessages.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Preparing Your Interview Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative w-16 h-16 mb-6">
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-background"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-primary/20 animate-ping"></div>
            </div>
          </div>

          <p className="text-lg font-medium text-center mb-2 min-h-[28px] transition-opacity duration-500">
            {loadingMessages[messageIndex]}
          </p>

          <p className="text-sm text-muted-foreground text-center max-w-md">
            We're using AI to generate personalized interview questions based on the job description and your resume.
            This might take a moment, but it's worth the wait!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
