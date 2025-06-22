"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { InterviewFlowManager, type ConversationStep } from "@/lib/conversation-flow-manager"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useUser } from "@clerk/nextjs"

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
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState<ConversationStep | null>(null)
  const [userInput, setUserInput] = useState("")
  const [conversationHistory, setConversationHistory] = useState<
    { role: "interviewer" | "candidate"; content: string }[]
  >([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useUser()
  const [conversationFlowManager, setConversationFlowManager] = useState<InterviewFlowManager | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [conversationHistory])

  const startInterview = async () => {
    setInterviewStarted(true)
    setConversationHistory([])

    const resumeContext = {
      name: userName || resume?.name || "the candidate",
      title: resume?.title,
      experience: resume?.experience,
    }

    const flowManager = new InterviewFlowManager({
      jobDescription: job.description,
      resume: resumeContext,
      technicalQuestions: questions.technical,
      behavioralQuestions: questions.behavioral,
      userName: userName || user?.firstName || "the candidate",
    })

    setConversationFlowManager(flowManager)

    const firstStep = await flowManager.start()
    setCurrentStep(firstStep)
    setConversationHistory([{ role: "interviewer", content: firstStep.message }])
  }

  const handleUserMessage = async () => {
    if (!userInput.trim()) return

    setLoading(true)
    const newHistory = [...conversationHistory, { role: "candidate" as const, content: userInput }]
    setConversationHistory(newHistory)

    if (conversationFlowManager && currentStep) {
      const nextStep = await conversationFlowManager.processUserResponse(userInput, currentStep)

      setCurrentStep(nextStep)
      setConversationHistory([...newHistory, { role: "interviewer" as const, content: nextStep.message }])
    }

    setUserInput("")
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-4">
      {!interviewStarted ? (
        <Card>
          <CardHeader>
            <CardTitle>Ready to start your mock interview?</CardTitle>
            <CardDescription>Click the button below to begin.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This interview will be tailored to the job description and resume you provided.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={startInterview}>Start Interview</Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Mock Interview</CardTitle>
            <CardDescription>Respond to the interviewer's questions below.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 h-[500px] overflow-y-auto" ref={chatContainerRef}>
              {conversationHistory.map((message, index) => (
                <div key={index} className={message.role === "interviewer" ? "text-gray-800" : "text-blue-600"}>
                  <Badge variant={message.role === "interviewer" ? "secondary" : "default"}>
                    {message.role === "interviewer" ? "Interviewer" : "You"}
                  </Badge>
                  <p className="mt-1">{message.content}</p>
                </div>
              ))}
              {loading && (
                <div>
                  <Badge variant="secondary">Interviewer</Badge>
                  <Skeleton className="w-[90%] h-4 mt-1" />
                </div>
              )}
            </div>
            <Separator className="my-4" />
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Type your answer here..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUserMessage()
                  }
                }}
              />
              <Button onClick={handleUserMessage} disabled={loading}>
                {loading ? "Loading..." : "Send"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
