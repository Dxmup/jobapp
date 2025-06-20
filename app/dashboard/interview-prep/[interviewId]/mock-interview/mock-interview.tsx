"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface MockInterviewProps {
  interviewId: string
}

export default function MockInterviewComponent({ interviewId }: MockInterviewProps) {
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [answer, setAnswer] = useState("")

  const startInterview = () => {
    setInterviewStarted(true)
    // In a real application, you would fetch the first question here
    setCurrentQuestion("Tell me about yourself.")
  }

  const submitAnswer = () => {
    // In a real application, you would send the answer to a backend
    console.log("Submitting answer:", answer)
    setAnswer("")
    // Fetch next question or end interview
    setCurrentQuestion("What are your strengths and weaknesses?")
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Mock Interview Session</CardTitle>
      </CardHeader>
      <CardContent>
        {!interviewStarted ? (
          <div className="text-center">
            <p className="mb-4">Click the button below to start your mock interview.</p>
            <Button onClick={startInterview}>Start Interview</Button>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold mb-4">Question:</h3>
            <p className="mb-6 p-4 bg-gray-100 rounded-md">{currentQuestion}</p>

            <div className="mb-4">
              <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer:
              </label>
              <textarea
                id="answer"
                className="w-full p-2 border rounded-md min-h-[100px]"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
              />
            </div>
            <Button onClick={submitAnswer} disabled={!answer.trim()}>
              Submit Answer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
