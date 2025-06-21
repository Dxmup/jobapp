"use client"

import { useState, useEffect } from "react"

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
      \
      setSuccess("Session terminate
