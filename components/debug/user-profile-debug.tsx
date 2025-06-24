"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, User, Database, Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface DebugData {
  userId: string | null
  userProfilesData: any
  authUserData: any
  resolvedName: string
  nameSource: string
  errors: string[]
  warnings: string[]
  timestamp: string
}

export const UserProfileDebug: React.FC = () => {
  const [debugData, setDebugData] = useState<DebugData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchDebugData = async () => {
    setIsLoading(true)
    const timestamp = new Date().toISOString()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      console.log("🔍 TRACE: UserProfileDebug - Starting comprehensive debug fetch")

      // 1. Get current user ID from auth cookie
      let userId: string | null = null
      try {
        const authResponse = await fetch("/api/auth/check-session")
        if (authResponse.ok) {
          const authData = await authResponse.json()
          userId = authData.userId || authData.user?.id || null
          console.log("🔍 TRACE: Auth session check result:", authData)
        } else {
          errors.push(`Auth session check failed: ${authResponse.status}`)
        }
      } catch (error) {
        errors.push(`Auth session error: ${error}`)
      }

      // 2. Get user profiles data
      let userProfilesData: any = null
      if (userId) {
        try {
          const profileResponse = await fetch("/api/user/profile")
          if (profileResponse.ok) {
            userProfilesData = await profileResponse.json()
            console.log("🔍 TRACE: User profile API result:", userProfilesData)
          } else {
            errors.push(`User profile API failed: ${profileResponse.status}`)
          }
        } catch (error) {
          errors.push(`User profile API error: ${error}`)
        }
      } else {
        warnings.push("No userId available, skipping profile fetch")
      }

      // 3. Get auth user data directly
      let authUserData: any = null
      try {
        const directAuthResponse = await fetch("/api/debug/session")
        if (directAuthResponse.ok) {
          authUserData = await directAuthResponse.json()
          console.log("🔍 TRACE: Direct auth session result:", authUserData)
        } else {
          errors.push(`Direct auth session failed: ${directAuthResponse.status}`)
        }
      } catch (error) {
        errors.push(`Direct auth session error: ${error}`)
      }

      // 4. Resolve name using the same logic as the interview prep code
      let resolvedName = "the candidate"
      let nameSource = "default fallback"

      // Try user profiles first
      if (userProfilesData?.profile) {
        const profile = userProfilesData.profile
        if (profile.firstName && profile.firstName !== "the candidate") {
          resolvedName = profile.firstName
          nameSource = "user_profiles.first_name"
        } else if (profile.fullName && profile.fullName !== "the candidate") {
          const firstName = profile.fullName.split(" ")[0]
          if (firstName && firstName !== "the") {
            resolvedName = firstName
            nameSource = "user_profiles.full_name (first part)"
          }
        }
      }

      // Try auth user metadata if still using fallback
      if (resolvedName === "the candidate" && authUserData?.user) {
        const user = authUserData.user
        if (user.user_metadata?.first_name) {
          resolvedName = user.user_metadata.first_name
          nameSource = "auth.user_metadata.first_name"
        } else if (user.user_metadata?.full_name) {
          const firstName = user.user_metadata.full_name.split(" ")[0]
          if (firstName && firstName !== "the") {
            resolvedName = firstName
            nameSource = "auth.user_metadata.full_name (first part)"
          }
        } else if (user.user_metadata?.name) {
          const firstName = user.user_metadata.name.split(" ")[0]
          if (firstName && firstName !== "the") {
            resolvedName = firstName
            nameSource = "auth.user_metadata.name (first part)"
          }
        } else if (user.email) {
          const emailName = user.email.split("@")[0]
          if (emailName && emailName !== "the") {
            resolvedName = emailName
            nameSource = "auth.email (before @)"
          }
        }
      }

      // Add warnings for common issues
      if (resolvedName === "the candidate") {
        warnings.push("Name resolution failed - using default fallback")
      }

      if (!userId) {
        warnings.push("No user ID found - user may not be authenticated")
      }

      if (!userProfilesData?.profile && userId) {
        warnings.push("No user profile data found in database")
      }

      if (!authUserData?.user && userId) {
        warnings.push("No auth user data found")
      }

      setDebugData({
        userId,
        userProfilesData,
        authUserData,
        resolvedName,
        nameSource,
        errors,
        warnings,
        timestamp,
      })

      console.log("🔍 TRACE: UserProfileDebug - Complete debug data:", {
        userId,
        userProfilesData,
        authUserData,
        resolvedName,
        nameSource,
        errors,
        warnings,
      })
    } catch (error) {
      console.error("🔍 TRACE: UserProfileDebug - Fatal error:", error)
      errors.push(`Fatal debug error: ${error}`)
      setDebugData({
        userId: null,
        userProfilesData: null,
        authUserData: null,
        resolvedName: "the candidate",
        nameSource: "error fallback",
        errors,
        warnings,
        timestamp,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugData()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(fetchDebugData, 5000) // Refresh every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusIcon = (condition: boolean) => {
    return condition ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  const getNameQualityBadge = (name: string, source: string) => {
    if (name === "the candidate") {
      return <Badge variant="destructive">Failed</Badge>
    }
    if (source.includes("user_profiles")) {
      return <Badge variant="default">Excellent</Badge>
    }
    if (source.includes("auth.user_metadata")) {
      return <Badge variant="secondary">Good</Badge>
    }
    if (source.includes("email")) {
      return <Badge variant="outline">Poor</Badge>
    }
    return <Badge variant="destructive">Unknown</Badge>
  }

  if (!debugData) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile Debug
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading debug data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Profile Debug Panel
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "bg-green-50" : ""}
              >
                {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
              </Button>
              <Button variant="outline" size="sm" onClick={fetchDebugData} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date(debugData.timestamp).toLocaleString()}
          </p>
        </CardHeader>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(!!debugData.userId)}
              <span className="font-medium">User ID:</span>
              <code className="text-sm bg-muted px-2 py-1 rounded">{debugData.userId || "Not found"}</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Resolved Name:</span>
              <code className="text-sm bg-muted px-2 py-1 rounded">{debugData.resolvedName}</code>
              {getNameQualityBadge(debugData.resolvedName, debugData.nameSource)}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Name Source:</span>
              <code className="text-sm bg-muted px-2 py-1 rounded text-xs">{debugData.nameSource}</code>
            </div>
          </div>

          {/* Errors */}
          {debugData.errors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Errors ({debugData.errors.length})</span>
              </div>
              <div className="space-y-1">
                {debugData.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {debugData.warnings.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Warnings ({debugData.warnings.length})</span>
              </div>
              <div className="space-y-1">
                {debugData.warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                    {warning}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User Profiles Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4" />
              User Profiles Table Data
              {getStatusIcon(!!debugData.userProfilesData?.profile)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-64">
              {JSON.stringify(debugData.userProfilesData, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Auth User Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" />
              Auth User Data
              {getStatusIcon(!!debugData.authUserData?.user)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-64">
              {JSON.stringify(debugData.authUserData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* Name Resolution Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Name Resolution Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              The system tries to resolve the user's name in this order:
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span className="text-sm">user_profiles.first_name</span>
                {getStatusIcon(
                  debugData.userProfilesData?.profile?.firstName &&
                    debugData.userProfilesData.profile.firstName !== "the candidate",
                )}
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {debugData.userProfilesData?.profile?.firstName || "null"}
                </code>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span className="text-sm">user_profiles.full_name (first part)</span>
                {getStatusIcon(
                  debugData.userProfilesData?.profile?.fullName &&
                    debugData.userProfilesData.profile.fullName !== "the candidate",
                )}
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {debugData.userProfilesData?.profile?.fullName || "null"}
                </code>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span className="text-sm">auth.user_metadata.first_name</span>
                {getStatusIcon(!!debugData.authUserData?.user?.user_metadata?.first_name)}
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {debugData.authUserData?.user?.user_metadata?.first_name || "null"}
                </code>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <span className="text-sm">auth.user_metadata.full_name (first part)</span>
                {getStatusIcon(!!debugData.authUserData?.user?.user_metadata?.full_name)}
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {debugData.authUserData?.user?.user_metadata?.full_name || "null"}
                </code>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  5
                </span>
                <span className="text-sm">auth.email (before @)</span>
                {getStatusIcon(!!debugData.authUserData?.user?.email)}
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {debugData.authUserData?.user?.email || "null"}
                </code>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                  6
                </span>
                <span className="text-sm">Fallback: "the candidate"</span>
                <XCircle className="h-4 w-4 text-red-500" />
              </div>
            </div>

            <Separator />

            <div className="bg-green-50 p-3 rounded">
              <div className="font-medium text-green-800">Final Result:</div>
              <div className="text-sm text-green-700">
                Name: <code className="bg-green-100 px-2 py-1 rounded">{debugData.resolvedName}</code>
              </div>
              <div className="text-sm text-green-700">
                Source: <code className="bg-green-100 px-2 py-1 rounded">{debugData.nameSource}</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How to Fix Name Issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p>
              <strong>If name is "the candidate":</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Check if user has a profile in the user_profiles table</li>
              <li>Verify the user's auth metadata contains name information</li>
              <li>Ensure the user is properly authenticated</li>
            </ul>

            <p>
              <strong>Best practices:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li>Populate user_profiles.first_name during onboarding</li>
              <li>Ensure auth providers return user metadata</li>
              <li>Add fallback logic for edge cases</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UserProfileDebug
