"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Monitor, Smartphone, Tablet } from "lucide-react"
import { toast } from "sonner"

interface Session {
  id: string
  ip_address: string
  user_agent: string
  created_at: string
  last_active_at: string
  is_current: boolean
}

export function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const loadSessions = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/sessions")
      const data = await res.json()

      if (!data.success) {
        setError(data.error || "Failed to load sessions")
        return
      }

      setSessions(data.sessions)
    } catch (err) {
      setError("An error occurred while loading sessions")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  const handleTerminateSession = async (sessionId: string) => {
    setError("")
    setSuccess("")

    try {
      const res = await fetch("/api/admin/sessions/terminate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || "Failed to terminate session")
        return
      }

      setSuccess("Session terminated successfully")
      toast.success("Session terminated successfully")

      // Reload sessions
      loadSessions()
    } catch (err) {
      setError("An error occurred while terminating session")
      console.error(err)
    }
  }

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase()
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      return <Smartphone className="h-4 w-4" />
    } else if (ua.includes("tablet") || ua.includes("ipad")) {
      return <Tablet className="h-4 w-4" />
    }
    return <Monitor className="h-4 w-4" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getBrowserName = (userAgent: string) => {
    if (userAgent.includes("Chrome")) return "Chrome"
    if (userAgent.includes("Firefox")) return "Firefox"
    if (userAgent.includes("Safari")) return "Safari"
    if (userAgent.includes("Edge")) return "Edge"
    return "Unknown"
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Manager</CardTitle>
          <CardDescription>Loading active sessions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Manager</CardTitle>
        <CardDescription>
          Manage active user sessions. You can terminate suspicious or inactive sessions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">{success}</div>
        )}

        <div className="space-y-4">
          {sessions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No active sessions found</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`border rounded-lg p-4 ${
                  session.is_current ? "border-blue-200 bg-blue-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getDeviceIcon(session.user_agent)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{getBrowserName(session.user_agent)}</span>
                        {session.is_current && <Badge variant="secondary">Current Session</Badge>}
                      </div>
                      <div className="text-sm text-gray-500">IP: {session.ip_address}</div>
                      <div className="text-sm text-gray-500">Created: {formatDate(session.created_at)}</div>
                      <div className="text-sm text-gray-500">Last Active: {formatDate(session.last_active_at)}</div>
                    </div>
                  </div>

                  {!session.is_current && (
                    <Button variant="destructive" size="sm" onClick={() => handleTerminateSession(session.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Terminate
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 pt-4 border-t">
          <Button onClick={loadSessions} variant="outline">
            Refresh Sessions
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
