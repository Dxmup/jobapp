"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRoles, checkPermission } from "@/lib/jwt-utils-client"

interface PermissionGateProps {
  permissionId?: string
  role?: string
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGate({ permissionId, role, fallback, children }: PermissionGateProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const { roles, loading } = useRoles()

  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (role) {
          // Check role from client-side hook
          setHasAccess(roles.includes(role))
        } else if (permissionId) {
          // Check permission from API
          const hasPermission = await checkPermission(permissionId)
          setHasAccess(hasPermission)
        } else {
          // No role or permission specified, deny access
          setHasAccess(false)
        }
      } catch (error) {
        console.error("Permission check error:", error)
        setHasAccess(false)
      }
    }

    if (!loading) {
      checkAccess()
    }
  }, [permissionId, role, roles, loading])

  if (hasAccess === null) {
    // Loading state
    return null
  }

  if (!hasAccess) {
    return fallback || null
  }

  return <>{children}</>
}
