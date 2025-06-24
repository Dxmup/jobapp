"use client"

import { useState, useEffect } from "react"

// Client-side role checking
export function useRoles() {
  const [roles, setRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRoles() {
      try {
        const response = await fetch("/api/auth/roles")
        if (!response.ok) {
          throw new Error("Failed to fetch roles")
        }
        const data = await response.json()
        setRoles(data.roles || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchRoles()
  }, [])

  return { roles, loading, error, hasRole: (role: string) => roles.includes(role) }
}

// Client-side permission checking
export async function checkPermission(permissionId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/auth/check-permission?permissionId=${permissionId}`)
    if (!response.ok) {
      return false
    }
    const data = await response.json()
    return data.hasPermission || false
  } catch (error) {
    console.error("Permission check error:", error)
    return false
  }
}
