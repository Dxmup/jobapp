"use client"

import { useState, useEffect } from "react"
import { PriorityActions } from "@/components/dashboard/priority-actions"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { QuickActionsMenu } from "@/components/dashboard/quick-actions-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, ListTodo } from "lucide-react"
import Link from "next/link"
import { RecentActivityCard } from "./recent-activity-card"
import { QuickStatsCard } from "./quick-stats-card"
import { Skeleton } from "@/components/ui/skeleton"

type ProgressStats = {
  applicationsSubmitted: number
  applicationsTarget: number
  responsesReceived: number
  interviewsCompleted: number
}

export function EnhancedDashboardOverview() {
  const [activeTab, setActiveTab] = useState("overview")
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProgressStats() {
      try {
        setLoading(true)
        const response = await fetch("/api/user/progress-stats")

        if (!response.ok) {
          throw new Error("Failed to fetch progress stats")
        }

        const data = await response.json()
        setProgressStats(data.stats)
      } catch (error) {
        console.error("Error fetching progress stats:", error)
        // Fallback to default values
        setProgressStats({
          applicationsSubmitted: 0,
          applicationsTarget: 20,
          responsesReceived: 0,
          interviewsCompleted: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    if (activeTab === "progress") {
      fetchProgressStats()
    }
  }, [activeTab])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="priorities">Priorities</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <Button variant="outline" size="sm" asChild>
            <Link
              href={
                activeTab === "priorities"
                  ? "/dashboard/action-plan"
                  : activeTab === "progress"
                    ? "/dashboard/analytics"
                    : "/dashboard/jobs"
              }
            >
              {activeTab === "priorities"
                ? "View all actions"
                : activeTab === "progress"
                  ? "View detailed analytics"
                  : "View all jobs"}
            </Link>
          </Button>
        </div>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <DashboardOverview />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RecentActivityCard />
            <QuickStatsCard />
          </div>
        </TabsContent>

        <TabsContent value="priorities" className="mt-4">
          <PriorityActions />
        </TabsContent>

        <TabsContent value="progress" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Job Search Progress</CardTitle>
              <CardDescription>Track your journey to landing your dream job</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Applications Submitted</span>
                      <span className="font-medium">
                        {progressStats?.applicationsSubmitted || 0}/{progressStats?.applicationsTarget || 20}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{
                          width: `${
                            progressStats
                              ? Math.min(
                                  100,
                                  (progressStats.applicationsSubmitted / progressStats.applicationsTarget) * 100,
                                )
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Responses Received</span>
                      <span className="font-medium">
                        {progressStats?.responsesReceived || 0}/{progressStats?.applicationsSubmitted || 0}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full"
                        style={{
                          width: `${
                            progressStats && progressStats.applicationsSubmitted > 0
                              ? (progressStats.responsesReceived / progressStats.applicationsSubmitted) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Interviews Completed</span>
                      <span className="font-medium">
                        {progressStats?.interviewsCompleted || 0}/{progressStats?.responsesReceived || 0}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="bg-green-500 h-full rounded-full"
                        style={{
                          width: `${
                            progressStats && progressStats.responsesReceived > 0
                              ? (progressStats.interviewsCompleted / progressStats.responsesReceived) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/dashboard/analytics">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Detailed Analytics
                      </Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link href="/dashboard/jobs/new">
                        <ListTodo className="mr-2 h-4 w-4" />
                        Add Application
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <QuickActionsMenu />
    </div>
  )
}
