"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Award } from "lucide-react"

export function ApplicationsChart() {
  const [streak, setStreak] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStreak = async () => {
    try {
      setLoading(true)
      // Add cache-busting parameter to prevent caching
      const response = await fetch(`/api/analytics/streak?t=${Date.now()}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch application streak")
      }

      const data = await response.json()
      setStreak(data.streak)
      setError(null)
    } catch (err) {
      console.error("Error fetching application streak:", err)
      setError("Failed to load streak data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStreak()

    // Set up an interval to refresh the streak data every 30 seconds
    const intervalId = setInterval(fetchStreak, 30000)

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Application Streak</CardTitle>
          <CardDescription>Consecutive days with applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="ml-4 space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[70px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Application Streak</CardTitle>
          <CardDescription>Consecutive days with applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-destructive">
            <span>Error loading streak data</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-primary" />
          Application Streak
        </CardTitle>
        <CardDescription>Consecutive days marking jobs as applied</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Award className="h-8 w-8 text-primary" />
            {streak && streak > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {streak}
              </span>
            )}
          </div>
          <div className="ml-4">
            <p className="text-2xl font-bold">
              {streak || 0} {streak === 1 ? "day" : "days"}
            </p>
            <p className="text-xs text-muted-foreground">
              {streak === 0
                ? "Start your streak by marking a job as applied!"
                : streak === 1
                  ? "You've marked a job as applied today!"
                  : `You've marked jobs as applied ${streak} days in a row!`}
            </p>
          </div>
        </div>
        <button onClick={fetchStreak} className="mt-4 text-xs text-primary hover:underline">
          Refresh streak
        </button>
      </CardContent>
    </Card>
  )
}
