"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, UserPlus, CreditCard, Settings, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"

type Activity = {
  id: string
  user_name: string
  user_email: string
  action: string
  target?: string
  created_at: string
  type: string
}

export function AdminRecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        const response = await fetch("/api/admin/recent-activity")
        if (!response.ok) {
          throw new Error("Failed to fetch recent activity")
        }
        const data = await response.json()
        setActivities(data.activities)
      } catch (err) {
        console.error("Error fetching recent activity:", err)
        setError("Failed to load recent activity")
      } finally {
        setLoading(false)
      }
    }

    fetchRecentActivity()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "job_created":
        return FileText
      case "user_registered":
        return UserPlus
      case "subscription":
        return CreditCard
      case "settings_updated":
        return Settings
      case "content_created":
        return FileText
      default:
        return AlertCircle
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Recent user activities across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Recent user activities across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Recent user activities across the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No recent activity found</div>
          ) : (
            activities.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              return (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="rounded-full bg-muted p-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={`/abstract-geometric-shapes.png?height=24&width=24&query=${activity.user_name}`}
                          alt={activity.user_name}
                        />
                        <AvatarFallback>
                          {activity.user_name?.charAt(0) || activity.user_email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{activity.user_name || activity.user_email}</span>
                      <span className="text-muted-foreground">{activity.action}</span>
                      {activity.target && <span className="font-medium">{activity.target}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
