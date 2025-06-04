"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type Application = {
  id: string
  company: string
  position: string
  date: string
  status: string
  response: boolean
  responseTime: string
}

export function ApplicationsTable() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchApplications() {
      try {
        setLoading(true)
        const response = await fetch("/api/analytics/recent-applications")

        if (!response.ok) {
          throw new Error(`Failed to fetch applications: ${response.status}`)
        }

        const data = await response.json()
        setApplications(data.applications)
      } catch (err) {
        console.error("Error fetching applications:", err)
        setError("Failed to load applications")
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const statusColors = {
    drafting: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    saved: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    interviewing: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
    interview: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
    offer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  }

  const statusLabels = {
    drafting: "Drafting",
    saved: "Saved",
    applied: "Applied",
    interviewing: "Interviewing",
    interview: "Interviewing",
    offer: "Offer Received",
    rejected: "Rejected",
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No applications found. Start adding job applications to see them here.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-6 p-4 font-medium border-b">
        <div>Company</div>
        <div>Position</div>
        <div>Date</div>
        <div>Status</div>
        <div>Response</div>
        <div>Response Time</div>
      </div>

      {applications.map((app) => (
        <div key={app.id} className="grid grid-cols-6 p-4 border-b">
          <div>{app.company}</div>
          <div>{app.position}</div>
          <div>{app.date}</div>
          <div>
            <Badge
              className={`${statusColors[app.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}`}
            >
              {statusLabels[app.status as keyof typeof statusLabels] || app.status}
            </Badge>
          </div>
          <div>{app.response ? "Yes" : "No"}</div>
          <div>{app.responseTime}</div>
        </div>
      ))}
    </div>
  )
}
