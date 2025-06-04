"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Phone,
  User,
  Mail,
  Calendar,
  Loader2,
  Plus,
  Bug,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface JobEvent {
  id: string
  job_id: string
  event_type: string
  title: string
  description: string | null
  date: string
  contact_name?: string | null
  contact_email?: string | null
  created_at: string
  updated_at: string
}

interface DebugInfo {
  session: any
  jobDetails: any
  userDetails: any
  apiResponse: any
  requestUrl: string
  requestTime: string
  error?: any
}

interface JobTimelineProps {
  jobId: string
}

export function JobTimeline({ jobId }: JobTimelineProps) {
  const [events, setEvents] = useState<JobEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchEvents = async () => {
      const debugData: Partial<DebugInfo> = {
        requestUrl: `/api/timeline/${jobId}`,
        requestTime: new Date().toISOString(),
      }

      try {
        setIsLoading(true)

        // Fetch session info for debugging
        const sessionResponse = await fetch("/api/debug/session")
        const sessionData = await sessionResponse.json()
        debugData.session = sessionData

        // Fetch job details for debugging
        const jobDetailsResponse = await fetch(`/api/debug/job-details?id=${jobId}`)
        const jobDetailsData = await jobDetailsResponse.json()
        debugData.jobDetails = jobDetailsData

        // Fetch user details for debugging
        const userDetailsResponse = await fetch("/api/debug/user-jobs")
        const userDetailsData = await userDetailsResponse.json()
        debugData.userDetails = userDetailsData

        // Actual timeline data fetch
        const response = await fetch(`/api/timeline/${jobId}`)
        debugData.apiResponse = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        }

        if (!response.ok) {
          const errorData = await response.json()
          debugData.apiResponse.body = errorData
          throw new Error(errorData.error || "Failed to fetch events")
        }

        const data = await response.json()
        debugData.apiResponse.body = data
        setEvents(data.events || [])
      } catch (err) {
        console.error("Error fetching events:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to load timeline events"
        setError(errorMessage)
        debugData.error = {
          message: errorMessage,
          stack: err instanceof Error ? err.stack : undefined,
        }

        toast({
          title: "Error",
          description: "Failed to load timeline events. Please check debug info.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        setDebugInfo(debugData as DebugInfo)
      }
    }

    fetchEvents()
  }, [jobId, toast])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "application_submitted":
        return <FileText className="h-5 w-5" />
      case "email_received":
      case "email_sent":
        return <Mail className="h-5 w-5" />
      case "phone_call":
        return <Phone className="h-5 w-5" />
      case "interview_scheduled":
        return <Calendar className="h-5 w-5" />
      case "meeting":
        return <User className="h-5 w-5" />
      case "note":
      default:
        return <MessageSquare className="h-5 w-5" />
    }
  }

  const getEventTypeColor = (type: string) => {
    const colors = {
      application_submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      email_received: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
      email_sent: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100",
      phone_call: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      interview_scheduled: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      meeting: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100",
      note: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
  }

  const getEventTypeLabel = (type: string) => {
    const labels = {
      application_submitted: "Application",
      email_received: "Email Received",
      email_sent: "Email Sent",
      phone_call: "Phone Call",
      interview_scheduled: "Interview",
      meeting: "Meeting",
      note: "Note",
    }
    return labels[type as keyof typeof labels] || type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ")
  }

  const renderDebugInfo = () => {
    if (!debugInfo) return null

    return (
      <Card className="mt-8 border-red-300 dark:border-red-800">
        <CardHeader className="bg-red-50 dark:bg-red-900/20">
          <CardTitle className="text-red-800 dark:text-red-300 flex items-center">
            <Bug className="mr-2 h-5 w-5" />
            Timeline Debug Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4 text-sm overflow-auto max-h-[500px]">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="session">
              <AccordionTrigger className="font-medium">Session Information</AccordionTrigger>
              <AccordionContent>
                <pre className="bg-slate-100 dark:bg-slate-800 p-2 rounded overflow-auto">
                  {JSON.stringify(debugInfo.session, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="job">
              <AccordionTrigger className="font-medium">Job Details</AccordionTrigger>
              <AccordionContent>
                <pre className="bg-slate-100 dark:bg-slate-800 p-2 rounded overflow-auto">
                  {JSON.stringify(debugInfo.jobDetails, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="user">
              <AccordionTrigger className="font-medium">User Details</AccordionTrigger>
              <AccordionContent>
                <pre className="bg-slate-100 dark:bg-slate-800 p-2 rounded overflow-auto">
                  {JSON.stringify(debugInfo.userDetails, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="api">
              <AccordionTrigger className="font-medium">API Response</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p>
                    <strong>Request URL:</strong> {debugInfo.requestUrl}
                  </p>
                  <p>
                    <strong>Request Time:</strong> {debugInfo.requestTime}
                  </p>
                  <p>
                    <strong>Status:</strong> {debugInfo.apiResponse?.status} {debugInfo.apiResponse?.statusText}
                  </p>
                  <p>
                    <strong>Headers:</strong>
                  </p>
                  <pre className="bg-slate-100 dark:bg-slate-800 p-2 rounded overflow-auto">
                    {JSON.stringify(debugInfo.apiResponse?.headers, null, 2)}
                  </pre>
                  <p>
                    <strong>Body:</strong>
                  </p>
                  <pre className="bg-slate-100 dark:bg-slate-800 p-2 rounded overflow-auto">
                    {JSON.stringify(debugInfo.apiResponse?.body, null, 2)}
                  </pre>
                </div>
              </AccordionContent>
            </AccordionItem>

            {debugInfo.error && (
              <AccordionItem value="error">
                <AccordionTrigger className="font-medium text-red-600 dark:text-red-400">
                  Error Details
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-red-50 dark:bg-red-900/20 p-2 rounded overflow-auto text-red-800 dark:text-red-300">
                    {JSON.stringify(debugInfo.error, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          <div className="pt-2">
            <h4 className="font-medium mb-2">Quick Fixes</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                onClick={async () => {
                  try {
                    const response = await fetch("/api/debug/fix-job-ownership", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ jobId }),
                    })
                    const data = await response.json()
                    toast({
                      title: data.success ? "Success" : "Error",
                      description: data.message,
                      variant: data.success ? "default" : "destructive",
                    })
                    if (data.success) {
                      window.location.reload()
                    }
                  } catch (err) {
                    toast({
                      title: "Error",
                      description: "Failed to fix job ownership",
                      variant: "destructive",
                    })
                  }
                }}
              >
                Fix Job Ownership
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                onClick={async () => {
                  try {
                    const response = await fetch("/api/admin/create-job-events-table")
                    const data = await response.json()
                    toast({
                      title: data.success ? "Success" : "Error",
                      description: data.message || "Table creation attempted",
                      variant: data.success ? "default" : "destructive",
                    })
                    if (data.success) {
                      window.location.reload()
                    }
                  } catch (err) {
                    toast({
                      title: "Error",
                      description: "Failed to create events table",
                      variant: "destructive",
                    })
                  }
                }}
              >
                Create Events Table
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Loading timeline events...</h3>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center">
        <Button size="sm" asChild>
          <Link href={`/jobs/${jobId}/add-event`}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Link>
        </Button>
      </div>

      {error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-red-100 p-3 mb-4">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium">Error loading timeline</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-md">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No timeline events yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-md">
              Track your application progress by adding events to the timeline.
            </p>
            <Button asChild>
              <Link href={`/jobs/${jobId}/add-event`}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Event
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="relative pl-8 space-y-6 before:absolute before:inset-y-0 before:left-7 before:w-[1px] before:bg-border">
          {events.map((event) => (
            <div key={event.id} className="relative">
              <div className="absolute -left-8 flex items-center justify-center w-6 h-6 rounded-full bg-background border">
                {getEventIcon(event.event_type)}
              </div>
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{event.title}</h3>
                        <Badge className={getEventTypeColor(event.event_type)}>
                          {getEventTypeLabel(event.event_type)}
                        </Badge>
                      </div>
                      {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                      {event.contact_name && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <span className="font-medium">Contact:</span> {event.contact_name}
                          {event.contact_email && ` (${event.contact_email})`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatDate(event.date)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
          <div className="relative">
            <div className="absolute -left-8 flex items-center justify-center w-6 h-6 rounded-full bg-background border">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm font-medium pt-1">Current Status</p>
          </div>
        </div>
      )}
    </div>
  )
}
