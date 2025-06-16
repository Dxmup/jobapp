/**
 * Resumes Page Component
 *
 * This page displays all resumes for the authenticated user and provides
 * functionality to view, edit, and manage resumes. It includes a robust
 * resume fetching mechanism with multiple fallback methods to ensure
 * reliability, as well as debug tools for development.
 *
 * @module ResumesPage
 */

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, FileText, Plus, RefreshCw, AlertCircle, Bug } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

/**
 * Resume interface representing the structure of a resume object
 * from the database.
 */
interface Resume {
  id: string
  name: string
  content: string
  created_at: string
  updated_at: string
  file_name: string
  job_title?: string
  company?: string
}

/**
 * ResumesPage component that displays and manages user resumes.
 *
 * @returns JSX.Element - The rendered component
 */
export default function ResumesPage() {
  // State for resume data and UI state
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debug state
  const [showDebug, setShowDebug] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [usersWithResumes, setUsersWithResumes] = useState<any[]>([])

  // Toast notifications
  const { toast } = useToast()

  /**
   * Determines if the application is running in development mode
   * and enables debug features accordingly.
   */
  useEffect(() => {
    setShowDebug(process.env.NODE_ENV === "development" || window.location.hostname === "localhost")
  }, [])

  /**
   * Fetches resumes using multiple fallback methods to ensure reliability.
   *
   * This function tries several API endpoints in sequence:
   * 1. Direct API (most reliable, bypasses RLS)
   * 2. Original API endpoint
   * 3. List API endpoint
   * 4. Direct SQL query (last resort, debug mode only)
   *
   * If all methods fail, it sets an error state with detailed information.
   */
  const fetchResumes = async () => {
    setLoading(true)
    setError(null)
    let success = false
    let fetchedResumes: Resume[] = []
    const errorMessages: string[] = []

    // First, check if we have a valid session and try to refresh if needed
    try {
      console.log("Checking session status...")
      const sessionResponse = await fetch("/api/debug/session")

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json()

        if (!sessionData.authenticated) {
          console.log("Session check failed, attempting to refresh session...")

          const refreshResponse = await fetch("/api/auth/refresh-session")
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json()
            console.log("Session refreshed successfully:", refreshData.message)
            toast({
              title: "Session refreshed",
              description: "Authentication restored, retrying...",
            })
          } else {
            const refreshError = await refreshResponse.json()
            console.error("Failed to refresh session:", refreshError)
            toast({
              variant: "destructive",
              title: "Authentication issue",
              description: "Please try logging out and back in if problems persist.",
            })
          }
        } else {
          console.log("Session is valid")
        }
      } else {
        console.log("Session check endpoint failed, continuing anyway...")
      }
    } catch (sessionError) {
      console.error("Error checking session:", sessionError)
      // Don't fail the whole operation for session check errors
    }

    // Rest of the function remains the same...
    try {
      // Method 1: Try the direct API first (most reliable)
      console.log("Trying direct API...")
      const directResponse = await fetch("/api/direct-resumes")

      if (directResponse.ok) {
        const data = await directResponse.json()
        if (data.success && data.resumes && data.resumes.length > 0) {
          console.log(`Direct API success: Found ${data.resumes.length} resumes`)
          fetchedResumes = data.resumes
          success = true
        } else {
          errorMessages.push("Direct API returned no resumes")
        }
      } else {
        const errorData = await directResponse.json()
        errorMessages.push(`Direct API error: ${errorData.error || directResponse.statusText}`)
      }

      // Method 2: If direct API failed, try the original endpoint
      if (!success) {
        console.log("Trying original API...")
        const originalResponse = await fetch("/api/resumes")

        if (originalResponse.ok) {
          const data = await originalResponse.json()
          if (data.resumes && data.resumes.length > 0) {
            console.log(`Original API success: Found ${data.resumes.length} resumes`)
            fetchedResumes = data.resumes
            success = true
          } else {
            errorMessages.push("Original API returned no resumes")
          }
        } else {
          const errorData = await originalResponse.json()
          errorMessages.push(`Original API error: ${errorData.error || originalResponse.statusText}`)
        }
      }

      // Method 3: If both APIs failed, try the list endpoint
      if (!success) {
        console.log("Trying list API...")
        const listResponse = await fetch("/api/resumes/list")

        if (listResponse.ok) {
          const data = await listResponse.json()
          if (data.resumes && data.resumes.length > 0) {
            console.log(`List API success: Found ${data.resumes.length} resumes`)
            fetchedResumes = data.resumes
            success = true
          } else {
            errorMessages.push("List API returned no resumes")
          }
        } else {
          const errorData = await listResponse.json()
          errorMessages.push(`List API error: ${errorData.error || listResponse.statusText}`)
        }
      }

      // Method 4: If all APIs failed and we're in debug mode, try a direct SQL query as last resort
      if (!success && showDebug) {
        console.log("Trying direct SQL query...")
        // Get user ID from cookie
        const userId = document.cookie
          .split("; ")
          .find((row) => row.startsWith("user_id="))
          ?.split("=")[1]

        if (userId) {
          const queryResponse = await fetch("/api/debug/direct-query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `SELECT * FROM resumes WHERE user_id = '${userId}' ORDER BY created_at DESC`,
            }),
          })

          if (queryResponse.ok) {
            const data = await queryResponse.json()
            if (data.data && data.data.length > 0) {
              console.log(`SQL query success: Found ${data.data.length} resumes`)
              fetchedResumes = data.data
              success = true
            } else {
              errorMessages.push("SQL query returned no resumes")
            }
          } else {
            const errorData = await queryResponse.json()
            errorMessages.push(`SQL query error: ${errorData.error || queryResponse.statusText}`)
          }
        } else {
          errorMessages.push("No user ID found in cookies for SQL query")
        }
      }

      // If we're in debug mode, fetch additional debug info
      if (showDebug) {
        try {
          const debugResponse = await fetch("/api/debug/all-resumes")
          if (debugResponse.ok) {
            const debugData = await debugResponse.json()
            setDebugInfo(debugData)
            setUsersWithResumes(debugData.usersWithResumes || [])
          }
        } catch (debugError) {
          console.error("Error fetching debug info:", debugError)
        }
      }

      // Set the resumes or error state
      if (success) {
        setResumes(fetchedResumes)
      } else {
        setError(`Failed to fetch resumes. Tried multiple methods: ${errorMessages.join("; ")}`)
      }
    } catch (error) {
      console.error("Error fetching resumes:", error)
      setError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch resumes when the component mounts or when debug mode changes.
   */
  useEffect(() => {
    fetchResumes()
  }, [showDebug])

  /**
   * Transfers ownership of a resume to the current user.
   *
   * This function is used in debug mode to fix resume ownership issues.
   *
   * @param resumeId - The ID of the resume to transfer
   */
  const handleTransferResume = async (resumeId: string) => {
    try {
      const response = await fetch("/api/debug/fix-resume-ownership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      })

      if (response.ok) {
        toast({
          title: "Resume transferred successfully",
          description: "The resume has been transferred to your account.",
        })
        fetchResumes()
      } else {
        const errorData = await response.json()
        toast({
          variant: "destructive",
          title: "Transfer failed",
          description: errorData.error || "Failed to transfer resume",
        })
      }
    } catch (error) {
      console.error("Error transferring resume:", error)
      toast({
        variant: "destructive",
        title: "Transfer failed",
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with title and actions */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Resumes</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/build-resume">
              <Plus className="mr-2 h-4 w-4" />
              New Resume
            </Link>
          </Button>
          <Button variant="outline" onClick={fetchResumes} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  toast({
                    title: "Refreshing session...",
                    description: "Attempting to restore authentication",
                  })

                  const refreshResponse = await fetch("/api/auth/refresh-session")
                  const refreshData = await refreshResponse.json()

                  if (refreshResponse.ok && refreshData.success) {
                    toast({
                      title: "Session refreshed",
                      description: "Attempting to fetch resumes again...",
                    })
                    // Wait a moment for cookies to be set
                    setTimeout(() => {
                      fetchResumes()
                    }, 1000)
                  } else {
                    toast({
                      variant: "destructive",
                      title: "Session refresh failed",
                      description: refreshData.message || "Please try logging out and back in.",
                    })
                  }
                } catch (error) {
                  console.error("Error refreshing session:", error)
                  toast({
                    variant: "destructive",
                    title: "Refresh failed",
                    description: "Please try logging out and back in.",
                  })
                }
              }}
            >
              Refresh Session & Try Again
            </Button>
          </div>
        </Alert>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading resumes...</span>
        </div>
      ) : resumes.length === 0 ? (
        // Empty state
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No resumes found</h2>
          <p className="mt-2 text-muted-foreground">
            You haven&apos;t created any resumes yet. Get started by creating your first resume.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/build-resume">
              <Plus className="mr-2 h-4 w-4" />
              Create Resume
            </Link>
          </Button>
        </div>
      ) : (
        // Resume list with tabs
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Resumes</TabsTrigger>
            <TabsTrigger value="recent">Recently Updated</TabsTrigger>
          </TabsList>

          {/* All resumes tab */}
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <Card key={resume.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="truncate">{resume.name}</CardTitle>
                    <CardDescription>
                      {new Date(resume.updated_at).toLocaleDateString()}
                      {resume.job_title && ` • ${resume.job_title}`}
                      {resume.company && ` at ${resume.company}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-32 overflow-hidden text-sm opacity-70">
                    <div className="line-clamp-6">{resume.content}</div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-3">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/resumes/${resume.id}`}>View</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/resumes/customize?resumeId=${resume.id}`}>Customize</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Recently updated tab */}
          <TabsContent value="recent" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...resumes]
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                .slice(0, 6)
                .map((resume) => (
                  <Card key={resume.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="truncate">{resume.name}</CardTitle>
                      <CardDescription>
                        {new Date(resume.updated_at).toLocaleDateString()}
                        {resume.job_title && ` • ${resume.job_title}`}
                        {resume.company && ` at ${resume.company}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-32 overflow-hidden text-sm opacity-70">
                      <div className="line-clamp-6">{resume.content}</div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-3">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/resumes/${resume.id}`}>View</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/resumes/customize?resumeId=${resume.id}`}>Customize</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Debug UI - Only shown in development mode */}
      {showDebug && (
        <div className="mt-12 border-t pt-6">
          <div className="flex items-center mb-4">
            <Bug className="mr-2 h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-bold">Debug Tools</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Debug info card */}
            <Card>
              <CardHeader>
                <CardTitle>Resume Debug Info</CardTitle>
                <CardDescription>Diagnostic information about your resumes</CardDescription>
              </CardHeader>
              <CardContent className="max-h-96 overflow-auto">
                <pre className="text-xs whitespace-pre-wrap bg-muted p-4 rounded-md">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={fetchResumes} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Debug Info
                </Button>
              </CardFooter>
            </Card>

            {/* Users with resumes card */}
            <Card>
              <CardHeader>
                <CardTitle>Users with Resumes</CardTitle>
                <CardDescription>Transfer resumes from other users to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usersWithResumes.length > 0 ? (
                    usersWithResumes.map((user: any) => (
                      <div key={user.user_id} className="flex justify-between items-center p-3 bg-muted rounded-md">
                        <div>
                          <p className="font-medium">{user.user_id}</p>
                          <p className="text-sm text-muted-foreground">{user.resume_count} resumes</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Fetching resumes",
                              description: `Fetching resumes for user ${user.user_id}...`,
                            })
                            // Fetch resumes for this user
                            fetch(`/api/debug/user-resumes?userId=${user.user_id}`)
                              .then((res) => res.json())
                              .then((data) => {
                                setDebugInfo(data)
                                toast({
                                  title: "Resumes fetched",
                                  description: `Found ${data.resumeCount} resumes for user ${user.user_id}`,
                                })
                              })
                          }}
                        >
                          View Resumes
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No other users with resumes found</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    fetch("/api/debug/all-resumes")
                      .then((res) => res.json())
                      .then((data) => {
                        setUsersWithResumes(data.usersWithResumes || [])
                        toast({
                          title: "Users refreshed",
                          description: `Found ${data.usersWithResumes?.length || 0} users with resumes`,
                        })
                      })
                  }}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Users
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Resume transfer card - Only shown when debug info includes resumes */}
          {debugInfo && debugInfo.resumes && debugInfo.resumes.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Resume Transfer</CardTitle>
                <CardDescription>Transfer resumes to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-auto">
                  {debugInfo.resumes.map((resume: any) => (
                    <div key={resume.id} className="flex justify-between items-center p-3 bg-muted rounded-md">
                      <div>
                        <p className="font-medium">{resume.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {resume.id}</p>
                        <p className="text-sm text-muted-foreground">User: {resume.user_id}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleTransferResume(resume.id)}>
                        Transfer to Me
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
