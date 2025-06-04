"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MessageSquare, Phone, User, Plus } from "lucide-react"
import Link from "next/link"
import type { JobEvent } from "@/lib/jobs"
import { format, isToday, isTomorrow, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"

interface UpcomingEventsProps {
  className?: string
  jobId?: string
}

export function UpcomingEvents({ className, jobId }: UpcomingEventsProps) {
  const [events, setEvents] = useState<(JobEvent & { jobTitle: string; company: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/events/upcoming")
        if (!response.ok) throw new Error("Failed to fetch events")
        const data = await response.json()
        setEvents(data.events)
      } catch (error) {
        console.error("Error fetching upcoming events:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const todayEvents = events.filter((event) => isToday(parseISO(event.date)))
  const tomorrowEvents = events.filter((event) => isTomorrow(parseISO(event.date)))
  const futureEvents = events
    .filter((event) => !isToday(parseISO(event.date)) && !isTomorrow(parseISO(event.date)))
    .slice(0, 3) // Limit to 3 future events

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "interview":
      case "interview_scheduled":
        return <User className="h-4 w-4" />
      case "phone_call":
        return <Phone className="h-4 w-4" />
      case "email_sent":
      case "email_received":
      case "note":
        return <MessageSquare className="h-4 w-4" />
      case "meeting":
        return <Calendar className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getEventTypeColor = (type: string) => {
    const colors = {
      interview: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      interview_scheduled: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      phone_call: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      email_sent: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
      email_received: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
      note: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      meeting: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 rounded-md bg-muted animate-pulse" />
            <div className="h-20 rounded-md bg-muted animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const noEventsContent = (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No upcoming events</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-md">
        Add events to your job applications to track important dates and deadlines.
      </p>
      {jobId && (
        <Link href={`/jobs/${jobId}/add-event`}>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Event
          </Button>
        </Link>
      )}
    </div>
  )

  if (todayEvents.length === 0 && tomorrowEvents.length === 0 && futureEvents.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>{noEventsContent}</CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Events</CardTitle>
        {jobId && (
          <Link href={`/jobs/${jobId}/add-event`}>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Event
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {todayEvents.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Today</h3>
              <div className="space-y-3">
                {todayEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/dashboard/jobs/${event.jobId}`}
                    className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{event.title}</span>
                          <Badge className={getEventTypeColor(event.eventType)}>
                            {event.eventType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {event.company} - {event.jobTitle}
                        </p>
                        {event.description && <p className="text-sm">{event.description}</p>}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                        <Clock className="mr-1 h-3 w-3" />
                        {format(parseISO(event.date), "h:mm a")}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {tomorrowEvents.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Tomorrow</h3>
              <div className="space-y-3">
                {tomorrowEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/dashboard/jobs/${event.jobId}`}
                    className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{event.title}</span>
                          <Badge className={getEventTypeColor(event.eventType)}>
                            {event.eventType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {event.company} - {event.jobTitle}
                        </p>
                        {event.description && <p className="text-sm">{event.description}</p>}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                        <Clock className="mr-1 h-3 w-3" />
                        {format(parseISO(event.date), "h:mm a")}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {futureEvents.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Upcoming</h3>
              <div className="space-y-3">
                {futureEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/dashboard/jobs/${event.jobId}`}
                    className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{event.title}</span>
                          <Badge className={getEventTypeColor(event.eventType)}>
                            {event.eventType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {event.company} - {event.jobTitle}
                        </p>
                        {event.description && <p className="text-sm">{event.description}</p>}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                        <Clock className="mr-1 h-3 w-3" />
                        {format(parseISO(event.date), "MMM d, h:mm a")}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
