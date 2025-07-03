"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, RefreshCw, Clock, User, Monitor } from "lucide-react"
import { toast } from "sonner"

interface Session {
  id: string
  user_id: string
  user_email: string
  created_at: string
  last_activity: string
  ip_address: string
  user_agent: string
  is_active: boolean
}

export function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/admin/sessions")
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      } else {
        toast.error("Failed to fetch sessions")
      }
    } catch (error) {
      console.error("Error fetching sessions:", error)
      toast.error("Error fetching sessions")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const revokeSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSessions(sessions.filter((session) => session.id !== sessionId))
        toast.success("Session revoked successfully")
      } else {
        toast.error("Failed to revoke session")
      }
    } catch (error) {
      console.error("Error revoking session:", error)
      toast.error("Error revoking session")
    }
  }

  const refreshSessions = () => {
    setRefreshing(true)
    fetchSessions()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getDeviceInfo = (userAgent: string) => {
    if (userAgent.includes("Mobile")) return "Mobile"
    if (userAgent.includes("Tablet")) return "Tablet"
    return "Desktop"
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Manager</CardTitle>
          <CardDescription>Loading active sessions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Session Manager</CardTitle>
          <CardDescription>Manage active user sessions ({sessions.length} total)</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={refreshSessions} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No active sessions found</div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{session.user_email}</span>
                    <Badge variant={session.is_active ? "default" : "secondary"}>
                      {session.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Created: {formatDate(session.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" />
                      Last activity: {formatDate(session.last_activity)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Monitor className="h-3 w-3" />
                      {getDeviceInfo(session.user_agent)}
                    </div>
                    <span>IP: {session.ip_address}</span>
                  </div>
                </div>

                <Button variant="destructive" size="sm" onClick={() => revokeSession(session.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
