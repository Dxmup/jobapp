"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CalendarIcon, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { AddEventDialog } from "@/components/schedule/add-event-dialog"

interface CalendarEvent {
  id: string
  title: string
  start: string
  end?: string
  allDay?: boolean
  backgroundColor?: string
  extendedProps: {
    jobId: string
    jobTitle: string
    company: string
    eventType: string
    description?: string
  }
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function CalendarSchedule() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week">("month")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/calendar/events")
        if (!response.ok) throw new Error("Failed to fetch events")
        const data = await response.json()
        setEvents(data.events)
      } catch (error) {
        console.error("Error fetching calendar events:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return events.filter((event) => {
      const eventDate = new Date(event.start).toISOString().split("T")[0]
      return eventDate === dateStr
    })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getEventBadgeVariant = (eventType: string) => {
    switch (eventType) {
      case "interview":
      case "interview_scheduled":
        return "default" // Green-ish
      case "phone_call":
        return "secondary" // Yellow-ish
      case "email_sent":
      case "email_received":
        return "outline" // Purple-ish
      case "meeting":
        return "destructive" // Pink-ish
      case "application":
        return "secondary"
      default:
        return "default"
    }
  }

  const handleEventClick = (event: CalendarEvent) => {
    router.push(`/jobs/${event.extendedProps.jobId}`)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const handleAddEventSuccess = () => {
    // Refresh events after adding a new one
    fetch("/api/calendar/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events)
      })
      .catch((error) => {
        console.error("Error refreshing events:", error)
      })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-[600px] flex items-center justify-center">
          <div className="text-center">
            <CalendarIcon className="h-8 w-8 mx-auto mb-2 animate-pulse" />
            <p>Loading calendar...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const days = getDaysInMonth(currentDate)
  const today = new Date()

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setView(view === "month" ? "week" : "month")}>
                {view === "month" ? "Week" : "Month"} View
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === "month" ? (
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {DAYS.map((day) => (
                <div key={day} className="p-2 text-center font-medium text-sm text-muted-foreground">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="p-2 h-24" />
                }

                const dayEvents = getEventsForDate(day)
                const isToday = day.toDateString() === today.toDateString()

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "p-2 h-24 border border-border/50 overflow-hidden relative group",
                      isToday && "bg-primary/5 border-primary/20",
                    )}
                    onClick={() => handleDateClick(day)}
                  >
                    <div className={cn("text-sm font-medium mb-1", isToday && "text-primary")}>{day.getDate()}</div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: event.backgroundColor + "20" }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEventClick(event)
                          }}
                          title={`${event.title} - ${event.extendedProps.company}`}
                        >
                          <div className="truncate font-medium">{event.title}</div>
                          <div className="truncate text-muted-foreground">{event.extendedProps.company}</div>
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDateClick(day)
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          ) : (
            // Week view - simplified list view for now
            <div className="space-y-4">
              {events
                .filter((event) => {
                  const eventDate = new Date(event.start)
                  const weekStart = new Date(currentDate)
                  weekStart.setDate(currentDate.getDate() - currentDate.getDay())
                  const weekEnd = new Date(weekStart)
                  weekEnd.setDate(weekStart.getDate() + 6)
                  return eventDate >= weekStart && eventDate <= weekEnd
                })
                .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex-shrink-0">
                      <Badge variant={getEventBadgeVariant(event.extendedProps.eventType)}>
                        {event.extendedProps.eventType.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.extendedProps.company} • {event.extendedProps.jobTitle}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(event.start).toLocaleDateString()}
                      {!event.allDay &&
                        ` at ${new Date(event.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Event Dialog */}
      <AddEventDialog
        isOpen={selectedDate !== null}
        onClose={() => setSelectedDate(null)}
        selectedDate={selectedDate}
        onSuccess={handleAddEventSuccess}
      />
    </>
  )
}
