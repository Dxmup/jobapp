"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ChevronRight, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

interface NextStep {
  id: string
  title: string
  description: string
  action: string
  href: string
  priority: "high" | "medium" | "low"
  aiRecommended?: boolean
}

interface NextStepsCardProps {
  jobId: string
  jobTitle: string
  steps: NextStep[]
  onCompleteStep?: (stepId: string) => void
}

export function NextStepsCard({ jobId, jobTitle, steps, onCompleteStep }: NextStepsCardProps) {
  const router = useRouter()
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  const handleCompleteStep = (stepId: string) => {
    setCompletedSteps((prev) => [...prev, stepId])
    if (onCompleteStep) {
      onCompleteStep(stepId)
    }
  }

  const handleAction = (step: NextStep) => {
    router.push(step.href)
  }

  const getPriorityColor = (priority: NextStep["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
    }
  }

  const activeSteps = steps.filter((step) => !completedSteps.includes(step.id))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Next Steps</CardTitle>
        <CardDescription>What to do next for {jobTitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeSteps.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-3" />
              <h3 className="text-lg font-medium">All steps completed!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You've completed all recommended steps for this job application.
              </p>
            </div>
          ) : (
            activeSteps.map((step) => (
              <div key={step.id} className="p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(step.priority)}`}>
                      {step.priority} priority
                    </div>

                    {step.aiRecommended && (
                      <div className="flex items-center text-xs text-purple-600 dark:text-purple-400">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Recommended
                      </div>
                    )}
                  </div>

                  <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => handleCompleteStep(step.id)}>
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="sr-only">Mark as done</span>
                  </Button>
                </div>

                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-3">{step.description}</p>

                <Button variant="outline" size="sm" className="w-full" onClick={() => handleAction(step)}>
                  {step.action}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
      {activeSteps.length > 0 && (
        <CardFooter className="border-t bg-muted/50 flex justify-between">
          <div className="text-sm text-muted-foreground">
            {activeSteps.length} step{activeSteps.length !== 1 ? "s" : ""} remaining
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
