"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PreloadedMockInterviewProps {
  job: any
  resume?: any
  questions: {
    technical: string[]
    behavioral: string[]
  }
  userName?: string
}

export function PreloadedMockInterview({ job, resume, questions, userName }: PreloadedMockInterviewProps) {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Mock Interview Not Available</CardTitle>
          <CardDescription>
            This component has been deprecated in favor of the live audio interview system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Please use the main interview prep functionality which includes live audio interviews with Gemini Live API.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
