"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function AdminUserRolesDisplay() {
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "admin":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "editor":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "support":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Roles</CardTitle>
        <CardDescription>Your current system roles and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : roles.length === 0 ? (
          <div className="text-gray-500">No roles assigned</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <Badge key={role} variant="outline" className={getRoleBadgeColor(role)}>
                {role}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
