"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

type Stats = {
  responseRate: string
  interviewConversion: string
  applicationsThisWeek: number
}

export function QuickStatsCard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchQuickStats() {
      try {
        const response = await fetch("/api/user/quick-stats")
        if (!response.ok) throw new Error("Failed to fetch quick stats")

        const data = await response.json()
        setStats(data.stats)
      } catch (error) {
        console.error("Error fetching quick stats:", error)
        // Provide fallback data if fetch fails
        setStats({
          responseRate: "0%",
          interviewConversion: "0%",
          applicationsThisWeek: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchQuickStats()
  }, [])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
          Quick Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : stats ? (
          <div className="text-sm">
            <div className="flex justify-between items-center py-1 border-b">
              <span className="text-muted-foreground flex items-center">
                Response rate
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 ml-1 text-muted-foreground/70 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Percentage of applications that received any response (interviews, offers, or rejections) out of
                        total applications.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <span className="font-medium">{stats.responseRate}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b">
              <span className="text-muted-foreground flex items-center">
                Interview conversion
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 ml-1 text-muted-foreground/70 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Percentage of applications that led to interviews or offers out of total applications.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <span className="font-medium">{stats.interviewConversion}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground flex items-center">
                Applications this week
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 ml-1 text-muted-foreground/70 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Total number of job applications created in the last 7 days.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <span className="font-medium">{stats.applicationsThisWeek}</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground py-2 text-center">Stats unavailable</div>
        )}
      </CardContent>
    </Card>
  )
}
