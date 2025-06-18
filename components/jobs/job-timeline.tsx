"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Trash2, Plus } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface TimelineEvent {
  id: string
  title: string
  description?: string
  event_type: "application" | "interview" | "follow_up" | "offer" | "rejection" | "other"
  event_date: string
  location?: string
  notes?: string
  created_at: string
}

interface JobTimelineProps {
  jobId: string
}

export function JobTimeline({ jobId }: JobTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [jobId])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/timeline/${jobId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch events")
      }
      const data = await response.json()
      setEvents(data.events || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load timeline")
    } finally {
      setLoading(false)
    }
  }

  const deleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/timeline/${jobId}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      })

      if (response.ok) {
        setEvents(events.filter((event) => event.id !== eventId))
      }
    } catch (err) {
      console.error("Failed to delete event:", err)
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "application":
        return "bg-blue-500"
      case "interview":
        return "bg-green-500"
      case "follow_up":
        return "bg-yellow-500"
      case "offer":
        return "bg-emerald-500"
      case "rejection":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "application":
        return "Application"
      case "interview":
        return "Interview"
      case "follow_up":
        return "Follow Up"
      case "offer":
        return "Offer"
      case "rejection":
        return "Rejection"
      default:
        return "Other"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
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
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={fetchEvents} className="mt-2">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Timeline</CardTitle>
        <Button asChild size="sm">
          <Link href={`/jobs/${jobId}/add-event`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-500 mb-4">Start tracking your application progress by adding events.</p>
            <Button asChild>
              <Link href={`/jobs/${jobId}/add-event`}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Event
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {events
                .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
                .map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-8 pb-4 border-l-2 border-gray-200 last:border-l-0"
                  >
                    <div
                      className={`absolute left-[-6px] top-2 w-3 h-3 rounded-full ${getEventTypeColor(event.event_type)}`}
                    />

                    <div className="flex items-start justify-between">
                      {/* Wrap the event details in a Link */}
                      <Link href={`/jobs/${jobId}/events/${event.id}/edit`} className="flex-1 block group">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium group-hover:underline">{event.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {getEventTypeLabel(event.event_type)}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(event.event_date).toLocaleDateString()}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                          )}
                        </div>

                        {event.description && <p className="text-sm text-gray-600 mb-2">{event.description}</p>}

                        {event.notes && <p className="text-xs text-gray-500">{event.notes}</p>}
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEvent(event.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
