"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Sparkles, FileText, Briefcase, Calendar, ArrowRight, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { getDashboardStats } from "@/app/actions/dashboard-actions"

interface ActionItem {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  cta: string
  href: string
  priority: number
  completed: boolean
}

export function PriorityActions() {
  const router = useRouter()
  const [actions, setActions] = useState<ActionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    async function loadUserContext() {
      setLoading(true)
      try {
        // Get user stats to determine appropriate actions
        const stats = await getDashboardStats()

        // Generate personalized actions based on user's current state
        const actionItems: ActionItem[] = []

        // If user has no jobs, suggest adding a job
        if (!stats.success || stats.stats.activeApplications === 0) {
          actionItems.push({
            id: "add-job",
            title: "Track your first job application",
            description: "Start by adding a job you're interested in applying for",
            icon: <Briefcase className="h-5 w-5 text-blue-500" />,
            cta: "Add a job",
            href: "/dashboard/jobs/new",
            priority: 100,
            completed: false,
          })
        }

        // If user has no resumes, suggest creating one
        if (!stats.success || stats.stats.resumesCreated === 0) {
          actionItems.push({
            id: "create-resume",
            title: "Create your first resume",
            description: "Build a professional resume to use in your applications",
            icon: <FileText className="h-5 w-5 text-green-500" />,
            cta: "Create resume",
            href: "/dashboard/build-resume",
            priority: 90,
            completed: false,
          })
        }

        // If user has jobs but no interviews, suggest optimizing resume
        if (stats.success && stats.stats.activeApplications > 0 && stats.stats.interviewCount === 0) {
          actionItems.push({
            id: "optimize-resume",
            title: "Optimize your resume for better results",
            description: "Use AI to tailor your resume to get more interviews",
            icon: <Sparkles className="h-5 w-5 text-purple-500" />,
            cta: "Optimize now",
            href: "/dashboard/customize-resume",
            priority: 80,
            completed: false,
          })
        }

        // If user has interviews coming up, suggest preparing
        if (stats.success && stats.stats.interviewCount > 0) {
          actionItems.push({
            id: "prepare-interview",
            title: "Prepare for your upcoming interview",
            description: "Review common questions and prepare your responses",
            icon: <Calendar className="h-5 w-5 text-orange-500" />,
            cta: "Prepare now",
            href: "/dashboard/interview-prep",
            priority: 95,
            completed: false,
          })
        }

        // Add some default actions if we don't have enough
        if (actionItems.length < 3) {
          if (!actionItems.some((a) => a.id === "daily-application")) {
            actionItems.push({
              id: "daily-application",
              title: "Apply to a job today",
              description: "Maintain your application streak by applying to at least one job",
              icon: <CheckCircle2 className="h-5 w-5 text-teal-500" />,
              cta: "Find jobs",
              href: "/dashboard/jobs",
              priority: 70,
              completed: false,
            })
          }

          if (!actionItems.some((a) => a.id === "cover-letter") && actionItems.length < 3) {
            actionItems.push({
              id: "cover-letter",
              title: "Create a cover letter",
              description: "Stand out with a personalized cover letter",
              icon: <FileText className="h-5 w-5 text-indigo-500" />,
              cta: "Create now",
              href: "/dashboard/cover-letters/new",
              priority: 60,
              completed: false,
            })
          }
        }

        // Sort by priority and take top 3
        const sortedActions = actionItems.sort((a, b) => b.priority - a.priority).slice(0, 3)

        setActions(sortedActions)

        // Calculate progress (for demo, we'll use a random value)
        // In a real implementation, this would be based on actual user progress
        const completedCount = localStorage.getItem("completedActionCount")
          ? Number.parseInt(localStorage.getItem("completedActionCount") || "0")
          : 0

        setProgress(Math.min(100, Math.round((completedCount / 10) * 100)))
      } catch (error) {
        console.error("Error loading user context:", error)
        // Fallback actions if there's an error
        setActions([
          {
            id: "add-job",
            title: "Track your first job application",
            description: "Start by adding a job you're interested in applying for",
            icon: <Briefcase className="h-5 w-5 text-blue-500" />,
            cta: "Add a job",
            href: "/dashboard/jobs/new",
            priority: 100,
            completed: false,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    loadUserContext()
  }, [])

  const markCompleted = (id: string) => {
    // Update local state
    setActions((prev) => prev.map((action) => (action.id === id ? { ...action, completed: true } : action)))

    // In a real implementation, this would call an API to update the user's progress
    const completedCount = localStorage.getItem("completedActionCount")
      ? Number.parseInt(localStorage.getItem("completedActionCount") || "0")
      : 0

    localStorage.setItem("completedActionCount", (completedCount + 1).toString())

    // Update progress
    setProgress(Math.min(100, Math.round(((completedCount + 1) / 10) * 100)))
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Today's Priorities</CardTitle>
          <CardDescription>Loading your personalized action plan...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Today's Priorities</CardTitle>
            <CardDescription>Complete these actions to advance your job search</CardDescription>
          </div>
          <div className="text-sm font-medium">{progress}% complete</div>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actions.map((action) => (
            <div
              key={action.id}
              className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${
                action.completed ? "bg-muted/50 text-muted-foreground" : "hover:bg-accent/50 cursor-pointer"
              }`}
              onClick={() => {
                if (!action.completed) {
                  markCompleted(action.id)
                  router.push(action.href)
                }
              }}
            >
              <div className={`mt-1 rounded-full p-2 ${action.completed ? "bg-muted" : "bg-primary/10"}`}>
                {action.icon}
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${action.completed ? "line-through" : ""}`}>{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
              {!action.completed && (
                <Button variant="ghost" size="sm" className="mt-1">
                  {action.cta} <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              )}
              {action.completed && <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 flex justify-between">
        <div className="text-sm text-muted-foreground">Complete all actions to stay on track</div>
        <Button variant="link" size="sm" onClick={() => router.push("/dashboard/action-plan")}>
          View full action plan
        </Button>
      </CardFooter>
    </Card>
  )
}
