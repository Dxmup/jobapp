"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type Activity = {
  id: string
  description: string
  timestamp: string
  timeAgo: string
}

export function RecentActivityCard() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        const response = await fetch("/api/user/recent-activity")
        if (!response.ok) throw new Error("Failed to fetch recent activity")

        const data = await response.json()

        // Format the activities with relative time
        const formattedActivities = data.activities.map((activity: any) => ({
          ...activity,
          timeAgo: formatTimeAgo(new Date(activity.timestamp)),
        }))

        setActivities(formattedActivities)
      } catch (error) {
        console.error("Error fetching recent activity:", error)
        // Provide fallback data if fetch fails
        setActivities([])
        // Show error in development environment
        if (process.env.NODE_ENV === "development") {
          console.warn("Recent activity fetch error details:", error)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchRecentActivity()
  }, [])

  // Helper function to format relative time
  function formatTimeAgo(date: Date): string {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return `${Math.floor(diffInSeconds / 604800)}w ago`
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Clock className="mr-2 h-4 w-4 text-purple-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : activities.length > 0 ? (
          <div className="text-sm">
            {activities.slice(0, 3).map((activity, index) => (
              <div
                key={activity.id}
                className={`flex items-center py-1 gap-2 ${index < activities.length - 1 ? "border-b" : ""}`}
              >
                <span className="text-muted-foreground truncate flex-1 mr-2">{activity.description}</span>
                <span className="text-xs">{activity.timeAgo}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground py-2 text-center">No recent activity found</div>
        )}
      </CardContent>
    </Card>
  )
}
