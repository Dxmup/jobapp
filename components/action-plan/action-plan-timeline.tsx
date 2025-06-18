"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Briefcase,
  MessageSquare,
  Calendar,
  ArrowRight,
  Search,
} from "lucide-react"

type ActionStatus = "completed" | "in-progress" | "upcoming"

interface ActionItem {
  id: string
  title: string
  description: string
  dueDate: string
  category: string
  status: ActionStatus
  priority: "high" | "medium" | "low"
  jobId?: string
  resumeId?: string
  coverLetterId?: string
  actionUrl?: string
}

export function ActionPlanTimeline() {
  const [filter, setFilter] = useState<ActionStatus | "all">("all")
  const [actions, setActions] = useState<ActionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActions() {
      try {
        setLoading(true)
        const response = await fetch("/api/action-plan/timeline")
        if (response.ok) {
          const data = await response.json()
          setActions(data)
        }
      } catch (error) {
        console.error("Failed to fetch action timeline:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActions()
  }, [])

  const filteredActions = filter === "all" ? actions : actions.filter((action) => action.status === filter)

  const getStatusIcon = (status: ActionStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "upcoming":
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "resume":
        return <FileText className="h-4 w-4" />
      case "applications":
        return <Briefcase className="h-4 w-4" />
      case "interviews":
        return <MessageSquare className="h-4 w-4" />
      case "follow-ups":
        return <Calendar className="h-4 w-4" />
      case "research":
        return <Search className="h-4 w-4" />
      default:
        return <Circle className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      case "medium":
        return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
      case "low":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Action Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-5 h-5 bg-muted rounded-full mt-1"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Action Timeline</CardTitle>
          <div className="flex gap-2">
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              All
            </Button>
            <Button
              variant={filter === "upcoming" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("upcoming")}
            >
              Upcoming
            </Button>
            <Button
              variant={filter === "in-progress" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("in-progress")}
            >
              In Progress
            </Button>
            <Button
              variant={filter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("completed")}
            >
              Completed
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredActions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No actions found for the selected filter.</p>
            <p className="text-sm mt-1">Start by creating a job application or uploading a resume.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredActions.map((action) => (
              <div key={action.id} className="flex gap-4">
                <div className="mt-1">{getStatusIcon(action.status)}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{action.title}</h3>
                      <Badge variant="outline" className={getPriorityColor(action.priority)}>
                        {action.priority}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{action.dueDate}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                  <div className="flex items-center justify-between pt-1">
                    <Badge variant="outline" className="bg-muted">
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(action.category)}
                        <span>{action.category}</span>
                      </div>
                    </Badge>
                    {action.status !== "completed" && action.actionUrl && (
                      <Button variant="ghost" size="sm" className="h-7 gap-1" asChild>
                        <a href={action.actionUrl}>
                          <span className="text-xs">Take action</span>
                          <ArrowRight className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
