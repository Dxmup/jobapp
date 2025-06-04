"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type Event = {
  id: string
  title: string
  date: string
  formattedDate: string
}

export function UpcomingEventsCard() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUpcomingEvents() {
      try {
        const response = await fetch("/api/events/upcoming")
        if (!response.ok) throw new Error("Failed to fetch upcoming events")

        const data = await response.json()

        // Format the dates for display
        const formattedEvents = data.events.map((event: any) => ({
          ...event,
          formattedDate: formatEventDate(new Date(event.date)),
        }))

        setEvents(formattedEvents)
      } catch (error) {
        console.error("Error fetching upcoming events:", error)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchUpcomingEvents()
  }, [])

  // Helper function to format event dates
  function formatEventDate(date: Date): string {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Check if date is today
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    }

    // Check if date is tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    }

    // Check if date is within the next 7 days
    const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffInDays < 7) {
      const options: Intl.DateTimeFormatOptions = { weekday: "long" }
      return date.toLocaleDateString(undefined, options)
    }

    // Otherwise, return the full date
    return date.toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-blue-500" />
          Upcoming
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : events.length > 0 ? (
          <div className="text-sm">
            {events.slice(0, 3).map((event, index) => (
              <div
                key={event.id}
                className={`flex justify-between items-center py-1 ${index < events.length - 1 ? "border-b" : ""}`}
              >
                <span className="text-muted-foreground">{event.title}</span>
                <span className="text-xs">{event.formattedDate}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground py-2 text-center">No upcoming events</div>
        )}
      </CardContent>
    </Card>
  )
}
