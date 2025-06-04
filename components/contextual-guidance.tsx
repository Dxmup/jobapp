"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, HelpCircle, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react"
import { usePathname } from "next/navigation"

interface GuidanceStep {
  id: string
  title: string
  content: string
  element?: string // CSS selector for the element to highlight
  position?: "top" | "right" | "bottom" | "left"
}

interface GuidanceFlow {
  id: string
  path: string
  title: string
  steps: GuidanceStep[]
}

// Example guidance flows for different pages
const guidanceFlows: GuidanceFlow[] = [
  {
    id: "jobs-page",
    path: "/dashboard/jobs",
    title: "Managing Your Job Applications",
    steps: [
      {
        id: "add-job",
        title: "Track New Jobs",
        content: "Click here to add a new job you're interested in or have applied to.",
        element: "[data-guidance='add-job-button']",
        position: "bottom",
      },
      {
        id: "job-status",
        title: "Update Job Status",
        content: "Change the status of your application as you progress through the hiring process.",
        element: "[data-guidance='job-status-selector']",
        position: "right",
      },
      {
        id: "job-details",
        title: "View Job Details",
        content: "Click on any job to see more details and track your progress.",
        element: "[data-guidance='job-card']",
        position: "bottom",
      },
    ],
  },
  {
    id: "resumes-page",
    path: "/dashboard/resumes",
    title: "Managing Your Resumes",
    steps: [
      {
        id: "create-resume",
        title: "Create New Resume",
        content: "Click here to create a new resume or upload an existing one.",
        element: "[data-guidance='create-resume-button']",
        position: "bottom",
      },
      {
        id: "customize-resume",
        title: "Customize for Jobs",
        content: "Use AI to tailor your resume for specific job applications.",
        element: "[data-guidance='customize-button']",
        position: "left",
      },
    ],
  },
]

export function ContextualGuidance() {
  const pathname = usePathname()
  const [activeFlow, setActiveFlow] = useState<GuidanceFlow | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [completedFlows, setCompletedFlows] = useState<string[]>([])

  // Check if there's a guidance flow for the current path
  useEffect(() => {
    const matchingFlow = guidanceFlows.find((flow) => pathname.startsWith(flow.path))

    if (matchingFlow && !completedFlows.includes(matchingFlow.id)) {
      // Don't show immediately, wait a moment for the page to load
      const timer = setTimeout(() => {
        setActiveFlow(matchingFlow)
        setCurrentStepIndex(0)
        setIsVisible(true)
      }, 1000)

      return () => clearTimeout(timer)
    } else {
      setActiveFlow(null)
      setIsVisible(false)
    }
  }, [pathname, completedFlows])

  // Handle highlighting the current element
  useEffect(() => {
    if (!activeFlow || !isVisible) return

    const currentStep = activeFlow.steps[currentStepIndex]
    if (!currentStep.element) return

    const element = document.querySelector(currentStep.element)
    if (!element) return

    // Add highlight class to the element
    element.classList.add("ring-2", "ring-primary", "ring-offset-2", "transition-all", "duration-300")

    return () => {
      // Remove highlight when component unmounts or step changes
      element.classList.remove("ring-2", "ring-primary", "ring-offset-2", "transition-all", "duration-300")
    }
  }, [activeFlow, currentStepIndex, isVisible])

  const nextStep = () => {
    if (!activeFlow) return

    if (currentStepIndex < activeFlow.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    } else {
      // Mark this flow as completed
      setCompletedFlows((prev) => [...prev, activeFlow.id])
      setIsVisible(false)
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }

  const dismissGuidance = () => {
    if (activeFlow) {
      setCompletedFlows((prev) => [...prev, activeFlow.id])
    }
    setIsVisible(false)
  }

  if (!isVisible || !activeFlow) return null

  const currentStep = activeFlow.steps[currentStepIndex]

  return (
    <div className="fixed bottom-20 right-6 z-50 max-w-sm">
      <Card className="border-primary/20 shadow-lg">
        <div className="absolute top-2 right-2">
          <Button variant="ghost" size="icon" onClick={dismissGuidance} className="h-6 w-6">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <CardContent className="pt-6 pb-4">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-sm">{currentStep.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{currentStep.content}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1 mt-4">
            {activeFlow.steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full ${index === currentStepIndex ? "w-4 bg-primary" : "w-1.5 bg-muted"}`}
              />
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 flex justify-between pt-2 pb-2">
          <Button variant="ghost" size="sm" onClick={prevStep} disabled={currentStepIndex === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          <Button variant="ghost" size="sm" onClick={nextStep}>
            {currentStepIndex < activeFlow.steps.length - 1 ? (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                Got it
                <CheckCircle className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
