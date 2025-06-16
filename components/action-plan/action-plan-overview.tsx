"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface OverviewStats {
  tasksCompleted: number
  totalTasks: number
  applicationsSubmitted: number
  interviewsScheduled: number
  overallProgress: number
}

export function ActionPlanOverview() {
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [timeframe, setTimeframe] = useState("week")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        const response = await fetch(`/api/action-plan/overview?timeframe=${timeframe}`)
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch overview stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [timeframe])

  if (loading || !stats) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Progress Overview</CardTitle>
            <Tabs defaultValue="week" value={timeframe} onValueChange={setTimeframe}>
              <TabsList>
                <TabsTrigger value="day">Today</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-2 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statCards = [
    {
      title: "Tasks Completed",
      value: `${stats.tasksCompleted}/${stats.totalTasks}`,
      color: "bg-blue-500",
    },
    {
      title: "Applications Submitted",
      value: stats.applicationsSubmitted.toString(),
      color: "bg-purple-500",
    },
    {
      title: "Interviews Scheduled",
      value: stats.interviewsScheduled.toString(),
      color: "bg-green-500",
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Progress Overview</CardTitle>
          <Tabs defaultValue="week" value={timeframe} onValueChange={setTimeframe}>
            <TabsList>
              <TabsTrigger value="day">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm font-medium">{stats.overallProgress}%</span>
        </div>
        <Progress value={stats.overallProgress} className="h-2 mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="bg-muted/50">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{stat.title}</div>
                <div className="text-2xl font-bold mt-1">{stat.value}</div>
                <div className={`h-1 mt-2 rounded-full ${stat.color}`} />
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
