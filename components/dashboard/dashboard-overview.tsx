"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderKanban, Trophy, Calendar, Clock, AlertCircle } from "lucide-react"
import { getDashboardStats } from "@/app/actions/dashboard-actions"
import { format, isToday, isTomorrow, parseISO } from "date-fns"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

type Event = {
  id: string
  jobId: string
  eventType: string
  title: string
  description: string | null
  date: string
  createdAt: string
  updatedAt: string
  jobTitle: string
  company: string
}

export function DashboardOverview() {
  const router = useRouter()
  const [activeApplications, setActiveApplications] = useState(0)
  const [resumesCreated, setResumesCreated] = useState(0)
  const [coverLetters, setCoverLetters] = useState(0)
  const [applicationStreak, setApplicationStreak] = useState(0)
  const [interviewCount, setInterviewCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [todayEvents, setTodayEvents] = useState<Event[]>([])
  const [tomorrowEvents, setTomorrowEvents] = useState<Event[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [eventsError, setEventsError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Function to refresh dashboard data
  const refreshDashboard = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await getDashboardStats()

      if (result.success) {
        setActiveApplications(result.stats.activeApplications)
        setResumesCreated(result.stats.resumesCreated)
        setCoverLetters(result.stats.coverLetters)
        setApplicationStreak(result.stats.applicationStreak)
        setInterviewCount(result.stats.interviewCount)
      } else if (result.error) {
        console.error("Failed to fetch dashboard stats:", result.error)
        setError(result.error)
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      setError("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
      setLastRefresh(new Date())
    }
  }

  // Fetch actual user data
  useEffect(() => {
    refreshDashboard()

    // Set up an interval to refresh data every 5 minutes
    const intervalId = setInterval(() => {
      refreshDashboard()
    }, 300000)

    return () => clearInterval(intervalId)
  }, [])

  // Listen for storage events that might indicate job status changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "jobStatusChanged" || e.key === "newJobCreated") {
        console.log("Storage change detected, refreshing dashboard")
        refreshDashboard()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Also listen for custom events
    const handleCustomEvent = () => {
      console.log("Custom event detected, refreshing dashboard")
      refreshDashboard()
    }

    window.addEventListener("jobStatusChanged", handleCustomEvent)
    window.addEventListener("jobCreated", handleCustomEvent)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("jobStatusChanged", handleCustomEvent)
      window.removeEventListener("jobCreated", handleCustomEvent)
    }
  }, [])

  // Fetch upcoming events
  useEffect(() => {
    async function fetchEvents() {
      try {
        setEventsLoading(true)
        setEventsError(null)

        console.log("Fetching upcoming events...")
        const response = await fetch("/api/events/upcoming")

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Server responded with ${response.status}`)
        }

        const data = await response.json()
        console.log("Events data received:", data)

        if (!data.events) {
          throw new Error("Invalid response format")
        }

        // Filter events for today and tomorrow
        const events = data.events || []
        setTodayEvents(events.filter((event: Event) => isToday(parseISO(event.date))))
        setTomorrowEvents(events.filter((event: Event) => isTomorrow(parseISO(event.date))))
      } catch (error) {
        console.error("Error fetching upcoming events:", error)
        setEventsError(error instanceof Error ? error.message : "Failed to fetch events")
      } finally {
        setEventsLoading(false)
      }
    }

    fetchEvents()
  }, [lastRefresh]) // Refresh events when dashboard data refreshes

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "interview":
      case "interview_scheduled":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Interview</Badge>
      case "phone_call":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Phone Call</Badge>
        )
      case "email_sent":
      case "email_received":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">Email</Badge>
      case "note":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Note</Badge>
      case "meeting":
        return <Badge className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100">Meeting</Badge>
      case "status_change":
        return (
          <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100">Status Update</Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
            {type?.replace(/_/g, " ") || "Event"}
          </Badge>
        )
    }
  }

  // Function to manually refresh the dashboard
  const handleManualRefresh = () => {
    router.refresh() // Refresh the entire page
    refreshDashboard() // Also refresh just the dashboard data
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className={`overflow-hidden ${isLoading ? "opacity-70" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
            <FolderKanban className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : activeApplications > 0 ? activeApplications : "Track Your First Job"}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading
                ? "Calculating..."
                : activeApplications > 0
                  ? `${interviewCount > 0 ? interviewCount : "0"} in interview stage`
                  : "Start applying to jobs"}
            </p>
          </CardContent>
        </Card>

        <Card
          className={`overflow-hidden ${isLoading ? "opacity-70" : ""} relative group`}
          onClick={handleManualRefresh}
        >
          <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors cursor-pointer rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="text-xs font-medium">Click to refresh</span>
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Application Streak</CardTitle>
            <Trophy className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "Loading..." : `${applicationStreak} days`}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Calculating..." : applicationStreak > 0 ? "Keep it up!" : "Apply to start streak"}
            </p>
          </CardContent>
        </Card>

        <Card className={`overflow-hidden ${eventsLoading ? "opacity-70" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-6 bg-muted rounded"></div>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </div>
            ) : eventsError ? (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{eventsError}</AlertDescription>
              </Alert>
            ) : todayEvents.length > 0 ? (
              <div className="space-y-2 max-h-[120px] overflow-y-auto">
                {todayEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/jobs/${event.jobId}`}
                    className="block p-2 hover:bg-muted/50 rounded-md transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="truncate">
                        <div className="font-medium text-sm truncate">{event.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{event.company}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getEventTypeIcon(event.eventType)}
                        <div className="text-xs whitespace-nowrap">{format(parseISO(event.date), "h:mm a")}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2">
                <div className="text-lg font-medium">No events today</div>
                <p className="text-xs text-muted-foreground mt-1">Schedule interviews and follow-ups</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={`overflow-hidden ${eventsLoading ? "opacity-70" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tomorrow's Events</CardTitle>
            <Clock className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-6 bg-muted rounded"></div>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </div>
            ) : eventsError ? (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{eventsError}</AlertDescription>
              </Alert>
            ) : tomorrowEvents.length > 0 ? (
              <div className="space-y-2 max-h-[120px] overflow-y-auto">
                {tomorrowEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/jobs/${event.jobId}`}
                    className="block p-2 hover:bg-muted/50 rounded-md transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="truncate">
                        <div className="font-medium text-sm truncate">{event.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{event.company}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getEventTypeIcon(event.eventType)}
                        <div className="text-xs whitespace-nowrap">{format(parseISO(event.date), "h:mm a")}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2">
                <div className="text-lg font-medium">No events tomorrow</div>
                <p className="text-xs text-muted-foreground mt-1">Plan ahead for your job search</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="text-xs text-muted-foreground text-right">Last updated: {lastRefresh.toLocaleTimeString()}</div>
    </div>
  )
}
