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
import { Loader2, FileText, Plus, RefreshCw, AlertCircle, Bug, Sparkles, TrendingUp, Clock, Target } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

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

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    recent: 0,
    aiGenerated: 0,
    jobSpecific: 0,
  })

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
   */
  const fetchResumes = async () => {
    setLoading(true)
    setError(null)
    let success = false
    let fetchedResumes: Resume[] = []
    const errorMessages: string[] = []

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
          setError(null)
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
            setError(null)
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
            setError(null)
          } else {
            errorMessages.push("List API returned no resumes")
          }
        } else {
          const errorData = await listResponse.json()
          errorMessages.push(`List API error: ${errorData.error || listResponse.statusText}`)
        }
      }

      // Calculate stats
      if (success && fetchedResumes.length > 0) {
        const total = fetchedResumes.length
        const recent = fetchedResumes.filter((resume) => {
          const createdDate = new Date(resume.created_at)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return createdDate > weekAgo
        }).length
        const aiGenerated = fetchedResumes.filter(
          (resume) => resume.name?.toLowerCase().includes("ai") || resume.name?.toLowerCase().includes("optimized"),
        ).length
        const jobSpecific = fetchedResumes.filter((resume) => resume.job_title || resume.company).length

        setStats({ total, recent, aiGenerated, jobSpecific })
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
        setError(null)
      } else if (fetchedResumes.length === 0) {
        setError(`Failed to fetch resumes. Tried multiple methods: ${errorMessages.join("; ")}`)
      } else {
        setResumes(fetchedResumes)
        setError(null)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border border-gray-200 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] text-gray-900 rounded-3xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">My Resumes</h1>
                </div>
                <p className="text-lg text-gray-900/90 max-w-2xl">
                  Create, customize, and manage your professional resumes. AI-powered optimization for every job
                  application.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 text-gray-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-gray-900/80" />
                    <span className="text-sm text-gray-900/80">Total</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </div>
                <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 text-gray-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-900/80" />
                    <span className="text-sm text-gray-900/80">Recent</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.recent}</div>
                </div>
                <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 text-gray-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-gray-900/80" />
                    <span className="text-sm text-gray-900/80">AI-Generated</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.aiGenerated}</div>
                </div>
                <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 text-gray-900">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-gray-900/80" />
                    <span className="text-sm text-gray-900/80">Job-Specific</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.jobSpecific}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 rounded-2xl">
        {/* Action Bar */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    asChild
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
                  >
                    <Link href="/dashboard/build-resume">
                      <Plus className="mr-2 h-4 w-4" />
                      New Resume
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={fetchResumes}
                    disabled={loading}
                    className="bg-white/50 border-white/20"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Refresh
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  <Badge variant="outline" className="bg-white/50">
                    {resumes.length} resumes
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-8">
            <Alert variant="destructive" className="bg-red-50/80 backdrop-blur-sm border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Resumes</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Retrying...",
                      description: "Attempting to fetch resumes again",
                    })
                    fetchResumes()
                  }}
                  className="bg-white/50"
                >
                  Try Again
                </Button>
              </div>
            </Alert>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
              <span className="text-lg text-gray-600">Loading resumes...</span>
            </div>
          </div>
        ) : resumes.length === 0 ? (
          // Empty state
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/20 max-w-md mx-auto">
              <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-6">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">No resumes found</h2>
              <p className="text-gray-600 mb-6">
                You haven&apos;t created any resumes yet. Get started by creating your first resume.
              </p>
              <Button
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
                asChild
              >
                <Link href="/dashboard/build-resume">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Resume
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          // Resume list with tabs
          <Tabs defaultValue="all" className="w-full">
            <div className="mb-6">
              <TabsList className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
                >
                  All Resumes
                </TabsTrigger>
                <TabsTrigger
                  value="recent"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
                >
                  Recently Updated
                </TabsTrigger>
              </TabsList>
            </div>

            {/* All resumes tab */}
            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume) => (
                  <Card
                    key={resume.id}
                    className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group rounded-2xl"
                  >
                    <div className="relative">
                      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
                      <CardHeader className="pb-3 pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="truncate text-lg group-hover:text-purple-600 transition-colors">
                              {resume.name}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {new Date(resume.updated_at).toLocaleDateString()}
                              {resume.job_title && ` • ${resume.job_title}`}
                              {resume.company && ` at ${resume.company}`}
                            </CardDescription>
                          </div>
                          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full p-2">
                            <FileText className="h-4 w-4 text-purple-600" />
                          </div>
                        </div>
                      </CardHeader>
                    </div>
                    <CardContent className="h-32 overflow-hidden text-sm opacity-70 px-6">
                      <div className="line-clamp-6">{resume.content}</div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-3 px-6 pb-6 bg-gradient-to-r from-gray-50/50 to-purple-50/50">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="bg-white/50 border-white/20 hover:bg-white/80"
                      >
                        <Link href={`/dashboard/resumes/view/${resume.id}`}>View</Link>
                      </Button>
                      <Button
                        size="sm"
                        asChild
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                      >
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
                    <Card
                      key={resume.id}
                      className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group rounded-2xl"
                    >
                      <div className="relative">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
                        <CardHeader className="pb-3 pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="truncate text-lg group-hover:text-purple-600 transition-colors">
                                {resume.name}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {new Date(resume.updated_at).toLocaleDateString()}
                                {resume.job_title && ` • ${resume.job_title}`}
                                {resume.company && ` at ${resume.company}`}
                              </CardDescription>
                            </div>
                            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full p-2">
                              <FileText className="h-4 w-4 text-purple-600" />
                            </div>
                          </div>
                        </CardHeader>
                      </div>
                      <CardContent className="h-32 overflow-hidden text-sm opacity-70 px-6">
                        <div className="line-clamp-6">{resume.content}</div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-3 px-6 pb-6 bg-gradient-to-r from-gray-50/50 to-purple-50/50">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="bg-white/50 border-white/20 hover:bg-white/80"
                        >
                          <Link href={`/dashboard/resumes/view/${resume.id}`}>View</Link>
                        </Button>
                        <Button
                          size="sm"
                          asChild
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                        >
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
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <CardTitle>Resume Debug Info</CardTitle>
                  <CardDescription>Diagnostic information about your resumes</CardDescription>
                </CardHeader>
                <CardContent className="max-h-96 overflow-auto">
                  <pre className="text-xs whitespace-pre-wrap bg-gray-50/50 p-4 rounded-md">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={fetchResumes} className="w-full bg-white/50">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Debug Info
                  </Button>
                </CardFooter>
              </Card>

              {/* Users with resumes card */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <CardTitle>Users with Resumes</CardTitle>
                  <CardDescription>Transfer resumes from other users to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {usersWithResumes.length > 0 ? (
                      usersWithResumes.map((user: any) => (
                        <div
                          key={user.user_id}
                          className="flex justify-between items-center p-3 bg-gray-50/50 rounded-md"
                        >
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
                            className="bg-white/50"
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
                    className="w-full bg-white/50"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Users
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Resume transfer card */}
            {debugInfo && debugInfo.resumes && debugInfo.resumes.length > 0 && (
              <Card className="mt-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <CardTitle>Resume Transfer</CardTitle>
                  <CardDescription>Transfer resumes to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-auto">
                    {debugInfo.resumes.map((resume: any) => (
                      <div key={resume.id} className="flex justify-between items-center p-3 bg-gray-50/50 rounded-md">
                        <div>
                          <p className="font-medium">{resume.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {resume.id}</p>
                          <p className="text-sm text-muted-foreground">User: {resume.user_id}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTransferResume(resume.id)}
                          className="bg-white/50"
                        >
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
    </div>
  )
}
