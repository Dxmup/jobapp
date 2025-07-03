"use client"

import { useState, useEffect } from "react"

export function useAdminRoles() {
  const [roles, setRoles] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/auth/roles")

        if (!response.ok) {
          throw new Error("Failed to fetch roles")
        }

        const data = await response.json()
        setRoles(data.roles || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load roles")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoles()
  }, [])

  const hasRole = (role: string) => roles.includes(role)

  return { roles, isLoading, error, hasRole }
}
