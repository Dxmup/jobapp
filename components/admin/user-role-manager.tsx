"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { assignRoleToUser, removeRoleFromUser, getUserRolesWithDetails } from "@/app/actions/role-actions"
import type { Role } from "@/types/auth"

interface UserRoleManagerProps {
  userId: string
  userName: string
}

interface RoleWithDetails {
  id: number
  name: string
  description: string
}

export function UserRoleManager({ userId, userName }: UserRoleManagerProps) {
  const [userRoles, setUserRoles] = useState<RoleWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const availableRoles: Role[] = ["user", "support", "editor", "admin", "super_admin"]

  useEffect(() => {
    const loadUserRoles = async () => {
      setIsLoading(true)
      const result = await getUserRolesWithDetails(userId)

      if (result.success) {
        setUserRoles(result.roles)
        setError("")
      } else {
        setError(result.error || "Failed to load user roles")
      }

      setIsLoading(false)
    }

    loadUserRoles()
  }, [userId])

  const handleAssignRole = async (role: Role) => {
    setMessage("")
    setError("")

    const result = await assignRoleToUser(userId, role)

    if (result.success) {
      setMessage(result.message || `Role ${role} assigned successfully`)
      // Refresh roles
      const updatedRoles = await getUserRolesWithDetails(userId)
      if (updatedRoles.success) {
        setUserRoles(updatedRoles.roles)
      }
    } else {
      setError(result.error || `Failed to assign role ${role}`)
    }
  }

  const handleRemoveRole = async (role: Role) => {
    setMessage("")
    setError("")

    const result = await removeRoleFromUser(userId, role)

    if (result.success) {
      setMessage(result.message || `Role ${role} removed successfully`)
      // Refresh roles
      const updatedRoles = await getUserRolesWithDetails(userId)
      if (updatedRoles.success) {
        setUserRoles(updatedRoles.roles)
      }
    } else {
      setError(result.error || `Failed to remove role ${role}`)
    }
  }

  const hasRole = (role: Role) => {
    return userRoles.some((r) => r.name === role)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Roles for {userName}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center">Loading roles...</div>
        ) : (
          <>
            {message && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{message}</div>}
            {error && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>}

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Current Roles:</h3>
                {userRoles.length === 0 ? (
                  <p className="text-sm text-gray-500">No roles assigned</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userRoles.map((role) => (
                      <div key={role.id} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                        <span>{role.name}</span>
                        <button
                          onClick={() => handleRemoveRole(role.name as Role)}
                          className="text-red-500 hover:text-red-700"
                          aria-label={`Remove ${role.name} role`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Available Roles:</h3>
                <div className="flex flex-wrap gap-2">
                  {availableRoles.map((role) => (
                    <Button
                      key={role}
                      variant={hasRole(role) ? "outline" : "default"}
                      size="sm"
                      onClick={() => (hasRole(role) ? handleRemoveRole(role) : handleAssignRole(role))}
                      disabled={hasRole(role) && userRoles.length === 1} // Prevent removing the last role
                    >
                      {hasRole(role) ? `Remove ${role}` : `Add ${role}`}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
