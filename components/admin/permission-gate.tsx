"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface PermissionGateProps {
  permissionId: string
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGate({ permissionId, fallback, children }: PermissionGateProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const response = await fetch(`/api/auth/check-permission?permissionId=${permissionId}`)
        const data = await response.json()
        setHasAccess(data.hasPermission)
      } catch (error) {
        console.error("Permission check error:", error)
        setHasAccess(false)
      }
    }

    checkPermission()
  }, [permissionId])

  if (hasAccess === null) {
    // Loading state
    return null
  }

  if (!hasAccess) {
    return fallback || null
  }

  return <>{children}</>
}
