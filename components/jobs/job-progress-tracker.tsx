"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: string
  title: string
  description: string
  status: "completed" | "current" | "upcoming" | "overdue"
  date?: string
}

interface JobProgressTrackerProps {
  jobId: string
  jobTitle: string
  steps: Step[]
  onCompleteStep?: (stepId: string) => void
}

export function JobProgressTracker({ jobId, jobTitle, steps, onCompleteStep }: JobProgressTrackerProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(
    steps.find((step) => step.status === "current")?.id || null,
  )

  const getStepIcon = (status: Step["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "current":
        return <Circle className="h-6 w-6 text-blue-500 fill-blue-100" />
      case "upcoming":
        return <Circle className="h-6 w-6 text-gray-300" />
      case "overdue":
        return <AlertCircle className="h-6 w-6 text-red-500" />
    }
  }

  const getStepLineColor = (status: Step["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "current":
        return "bg-blue-500"
      case "upcoming":
      case "overdue":
        return "bg-gray-200"
    }
  }

  const handleCompleteStep = (stepId: string) => {
    if (onCompleteStep) {
      onCompleteStep(stepId)
    }

    // Find the next step and expand it
    const currentIndex = steps.findIndex((step) => step.id === stepId)
    if (currentIndex < steps.length - 1) {
      setExpandedStep(steps[currentIndex + 1].id)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Progress</CardTitle>
        <CardDescription>Track your progress for {jobTitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className={cn("absolute left-3 top-6 bottom-0 w-0.5", getStepLineColor(step.status))} />
              )}

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">{getStepIcon(step.status)}</div>

                <div className="flex-1">
                  <div
                    className={cn(
                      "flex items-center justify-between cursor-pointer",
                      expandedStep === step.id ? "mb-2" : "",
                    )}
                    onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                  >
                    <h3
                      className={cn(
                        "font-medium",
                        step.status === "completed" && "text-green-700 dark:text-green-400",
                        step.status === "current" && "text-blue-700 dark:text-blue-400",
                        step.status === "overdue" && "text-red-700 dark:text-red-400",
                      )}
                    >
                      {step.title}
                    </h3>

                    {step.date && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {step.date}
                      </div>
                    )}
                  </div>

                  {expandedStep === step.id && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">{step.description}</p>

                      {step.status === "current" && (
                        <Button size="sm" onClick={() => handleCompleteStep(step.id)}>
                          Mark as Completed
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
