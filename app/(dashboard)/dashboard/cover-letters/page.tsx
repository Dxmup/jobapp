"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Download, FileEdit, Search, Sparkles, TrendingUp, Clock, Target } from "lucide-react"
import Link from "next/link"
import { useRef, useEffect, useState } from "react"
import { getCoverLetters } from "@/app/actions/cover-letter-actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/types/database"
import { pulseAnimationCSS, scrollToElement, clearStoredItem, getStoredItem } from "@/lib/animation-utils"

const supabase = createClientComponentClient<Database>()

export default function CoverLettersPage() {
  const { toast } = useToast()

  const [coverLetters, setCoverLetters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [companies, setCompanies] = useState<string[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<string>("newest")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [debugInfo, setDebugInfo] = useState<string>("")

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [newCoverLetterId, setNewCoverLetterId] = useState<string | null>(null)
  const newCoverLetterRef = useRef<HTMLDivElement>(null)

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    recent: 0,
    aiGenerated: 0,
    jobSpecific: 0,
  })

  // Function to get the actual user ID
  const getUserId = async () => {
    try {
      // First try to get from cookie
      const cookieUserId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user_id="))
        ?.split("=")[1]

      if (cookieUserId) {
        console.log("Got user ID from cookie:", cookieUserId)
        return cookieUserId
      }

      // If not in cookie, try to get from the users table
      const { data: authData, error: authError } = await supabase.auth.getUser()

      if (authError || !authData.user) {
        console.error("Error getting auth user:", authError)
        return null
      }

      const authId = authData.user.id
      console.log("Got auth ID:", authId)

      // Query the users table to get the actual user ID
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", authId)
        .single()

      if (userError) {
        console.error("Error getting user from auth_id:", userError)

        // Fallback to known user ID for development
        if (process.env.NODE_ENV === "development") {
          console.log("Using fallback user ID for development")
          return "9672f6ae-68ef-440f-9253-7bbbb930e87e"
        }

        return null
      }

      console.log("Got user ID from database:", userData.id)
      return userData.id
    } catch (error) {
      console.error("Error in getUserId:", error)

      // Fallback to known user ID for development
      if (process.env.NODE_ENV === "development") {
        console.log("Using fallback user ID for development")
        return "9672f6ae-68ef-440f-9253-7bbbb930e87e"
      }

      return null
    }
  }

  useEffect(() => {
    // Get and store the user ID when the component mounts
    const initUserId = async () => {
      const id = await getUserId()
      setUserId(id)
    }

    initUserId()
  }, [])

  useEffect(() => {
    const fetchCoverLetters = async () => {
      setIsLoading(true)
      let debugLog = ""

      try {
        // Get user cover letters using the server action
        const result = await getCoverLetters()

        debugLog += `Server action result: ${JSON.stringify(result)}
`

        if (result.success && result.data) {
          setCoverLetters(result.data)

          // Calculate stats
          const total = result.data.length
          const recent = result.data.filter((letter) => {
            const createdDate = new Date(letter.created_at)
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            return createdDate > weekAgo
          }).length
          const aiGenerated = result.data.filter(
            (letter) => letter.name?.toLowerCase().includes("ai") || letter.name?.toLowerCase().includes("generated"),
          ).length
          const jobSpecific = result.data.filter((letter) => letter.jobs?.title || letter.jobs?.company).length

          setStats({ total, recent, aiGenerated, jobSpecific })

          // Extract unique companies
          const uniqueCompanies = Array.from(
            new Set(result.data.filter((letter) => letter.jobs?.company).map((letter) => letter.jobs?.company)),
          )

          setCompanies(uniqueCompanies as string[])
          debugLog += `Found ${result.data.length} cover letters
`
        } else {
          debugLog += `Error: ${result.error || "Unknown error"}
`
          if (result.error) {
            toast({
              title: "Error",
              description: result.error,
              variant: "destructive",
            })
          }
        }
      } catch (error) {
        debugLog += `Error in fetchCoverLetters: ${error instanceof Error ? error.message : String(error)}
`
        console.error("Error fetching cover letters:", error)
        toast({
          title: "Error",
          description: "Failed to load cover letters",
          variant: "destructive",
        })
      } finally {
        setDebugInfo(debugLog)
        setIsLoading(false)
      }
    }

    fetchCoverLetters()
  }, [toast])

  const fetchJobs = async () => {
    setIsLoadingJobs(true)
    try {
      // Use our working API endpoint instead of direct Supabase query
      const response = await fetch("/api/jobs/list-for-user")

      if (!response.ok) {
        throw new Error("Failed to fetch jobs")
      }

      const data = await response.json()

      if (data.success && data.jobs) {
        setJobs(data.jobs)
        console.log(`Found ${data.jobs.length} jobs:`, data.jobs)
      } else {
        throw new Error(data.error || "Failed to load jobs")
        setJobs([])
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      })
      setJobs([])
    } finally {
      setIsLoadingJobs(false)
    }
  }

  const handleGenerateCoverLetter = () => {
    if (!selectedJobId) {
      toast({
        title: "Missing job",
        description: "Please select a job to continue",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Simply redirect to the job's generate-cover-letter page
      window.location.href = `/jobs/${selectedJobId}/generate-cover-letter`
    } catch (error) {
      console.error("Error navigating to cover letter page:", error)
      toast({
        title: "Navigation failed",
        description: "There was a problem navigating to the cover letter generation page. Please try again.",
        variant: "destructive",
      })
      setIsGenerating(false)
    }
  }

  // Fetch jobs when the component mounts or when userId changes
  useEffect(() => {
    if (userId) {
      fetchJobs()
    }
  }, [userId])

  // Filter and sort the cover letters
  const filteredCoverLetters = coverLetters
    .filter((letter) => {
      // Filter by company if a specific company is selected
      if (selectedCompany !== "all" && letter.jobs?.company !== selectedCompany) {
        return false
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          letter.name?.toLowerCase().includes(query) ||
          letter.jobs?.title?.toLowerCase().includes(query) ||
          letter.jobs?.company?.toLowerCase().includes(query)
        )
      }

      return true
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "name-asc":
          return (a.name || "").localeCompare(b.name || "")
        case "name-desc":
          return (b.name || "").localeCompare(a.name || "")
        default:
          return 0
      }
    })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const handleDownload = (fileName: string) => {
    toast({
      title: "Download started",
      description: `Downloading ${fileName}...`,
    })
  }

  const handleDownloadPDF = async (letter: any) => {
    try {
      // Import jspdf dynamically
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF()

      // Set font size to 12pt
      doc.setFontSize(12)

      // Add content to PDF with proper margins
      const margins = {
        top: 20,
        left: 20,
        right: 20,
        bottom: 20,
      }

      // Add cover letter name as title
      doc.setFontSize(16)
      doc.text(letter.name, margins.left, margins.top)
      doc.setFontSize(12)

      // Calculate available width for text
      const textWidth = doc.internal.pageSize.width - margins.left - margins.right

      // Split text to fit within margins
      const splitText = doc.splitTextToSize(letter.content, textWidth)

      // Add text to document (starting below the title)
      doc.text(splitText, margins.left, margins.top + 10)

      // Save the PDF
      doc.save(`${letter.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  useEffect(() => {
    // Check if there's a newly created cover letter ID in localStorage
    const storedCoverLetterId = getStoredItem("newCoverLetterId")
    const storedCoverLetterName = getStoredItem("newCoverLetterName")

    if (storedCoverLetterId) {
      setNewCoverLetterId(storedCoverLetterId)

      // Show success toast
      toast({
        title: "Cover Letter Created",
        description: `"${storedCoverLetterName || "New cover letter"}" has been created successfully.`,
      })

      // Clear the localStorage items
      clearStoredItem(["newCoverLetterId", "newCoverLetterName"])

      // Scroll to the new cover letter after a short delay
      setTimeout(() => {
        scrollToElement(newCoverLetterRef)
      }, 500)
    }
  }, [toast])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <style jsx global>
        {pulseAnimationCSS}
      </style>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border border-gray-200 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] text-gray-900 rounded-3xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <FileEdit className="h-6 w-6" />
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Cover Letters</h1>
                </div>
                <p className="text-lg text-gray-900/90 max-w-2xl">
                  Generate and manage tailored cover letters for your job applications with AI-powered customization.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200 text-gray-900 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-gray-900/80" />
                    <span className="text-sm text-gray-900/80">Total</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </div>
                <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200 text-gray-900 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-900/80" />
                    <span className="text-sm text-gray-900/80">Recent</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.recent}</div>
                </div>
                <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200 text-gray-900 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-gray-900/80" />
                    <span className="text-sm text-gray-900/80">AI-Generated</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.aiGenerated}</div>
                </div>
                <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200 text-gray-900 p-4">
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
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search cover letters..."
                    className="pl-10 bg-white/50 border-white/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <select
                    className="h-10 rounded-lg border border-white/20 bg-white/50 px-3 py-2 text-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                  >
                    <option value="all">All Companies</option>
                    {companies.map((company) => (
                      <option key={company} value={company}>
                        {company}
                      </option>
                    ))}
                  </select>

                  <select
                    className="h-10 rounded-lg border border-white/20 bg-white/50 px-3 py-2 text-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                  </select>

                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={fetchJobs}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate New Cover Letter
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Generate New Cover Letter</DialogTitle>
                        <DialogDescription>Select a job to generate a tailored cover letter.</DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="job">Select Job</Label>
                          <select
                            id="job"
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={selectedJobId}
                            onChange={(e) => setSelectedJobId(e.target.value)}
                            disabled={isLoadingJobs}
                          >
                            <option value="" disabled>
                              {isLoadingJobs ? "Loading jobs..." : jobs.length === 0 ? "No jobs found" : "Select a job"}
                            </option>
                            {jobs.map((job) => (
                              <option key={job.id} value={job.id}>
                                {job.title} - {job.company}
                              </option>
                            ))}
                          </select>
                          {jobs.length === 0 && !isLoadingJobs && (
                            <p className="text-sm text-amber-600">No jobs found. Please add a job first.</p>
                          )}
                          {isLoadingJobs && (
                            <div className="flex items-center mt-2 text-sm text-muted-foreground">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading jobs...
                            </div>
                          )}
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleGenerateCoverLetter} disabled={isGenerating || !selectedJobId}>
                          {isGenerating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Navigating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Continue
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>Showing {filteredCoverLetters.length} cover letters</span>
                <Badge variant="outline" className="bg-white/50">
                  {filteredCoverLetters.length} results
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="grid" className="w-full">
          <div className="mb-6">
            <TabsList className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
              <TabsTrigger
                value="grid"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                Grid View
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                List View
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="grid" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {isLoading && (
                <div className="col-span-full flex justify-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
                    <p className="text-sm text-muted-foreground">Loading cover letters...</p>
                  </div>
                </div>
              )}
              {filteredCoverLetters.map((letter) => (
                <Card
                  key={letter.id}
                  ref={letter.id === newCoverLetterId ? newCoverLetterRef : null}
                  className={`border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group ${letter.id === newCoverLetterId ? "border-purple-500 animate-pulse-border" : ""} rounded-2xl`}
                >
                  <div className="relative">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
                    <CardHeader className="pb-2 pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg truncate max-w-[70%] group-hover:text-purple-600 transition-colors">
                            {letter.name}
                          </CardTitle>
                          <CardDescription className="truncate">
                            {letter.file_name || `${letter.name}.pdf`}
                          </CardDescription>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 text-xs whitespace-nowrap">
                          <Sparkles className="mr-1 h-3 w-3" />
                          AI
                        </Badge>
                      </div>
                    </CardHeader>
                  </div>
                  <CardContent className="pb-2">
                    <div className="space-y-1 text-sm">
                      <div className="overflow-hidden">
                        <span className="font-medium">Job Title:</span>{" "}
                        <span className="truncate">{letter.jobs?.title || "N/A"}</span>
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-medium">Company:</span>{" "}
                        <span className="truncate">{letter.jobs?.company || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-medium">Created:</span> {formatDate(letter.created_at)}
                      </div>
                      <div>
                        <span className="font-medium">Expires:</span>{" "}
                        {letter.expires_at ? formatDate(letter.expires_at) : "N/A"}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-2 bg-gradient-to-r from-gray-50/50 to-purple-50/50">
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <Button
                        variant="outline"
                        className="w-full bg-white/50 border-white/20 hover:bg-white/80"
                        onClick={() => handleDownloadPDF(letter)}
                      >
                        <Download className="mr-1 h-4 w-4" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full bg-white/50 border-white/20 hover:bg-white/80"
                        asChild
                      >
                        <Link href={`/dashboard/cover-letters/${letter.id}`}>View</Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-white/20">
                <CardTitle>All Cover Letters</CardTitle>
                <CardDescription>A detailed list view of all your cover letters.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-hidden">
                  <div className="grid grid-cols-6 p-4 font-medium border-b bg-gray-50/50 text-gray-700">
                    <div>Name</div>
                    <div>Job Title</div>
                    <div>Company</div>
                    <div>Tone</div>
                    <div>Created</div>
                    <div>Actions</div>
                  </div>

                  {filteredCoverLetters.map((letter) => (
                    <div
                      key={letter.id}
                      ref={letter.id === newCoverLetterId ? newCoverLetterRef : null}
                      className={`grid grid-cols-6 p-4 border-b hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-indigo-50/50 transition-all duration-200 ${letter.id === newCoverLetterId ? "border-purple-500 animate-pulse-border" : ""}`}
                    >
                      <div className="font-medium text-gray-900">{letter.name}</div>
                      <div className="text-gray-700">{letter.jobs?.title || "N/A"}</div>
                      <div className="text-gray-700">{letter.jobs?.company || "N/A"}</div>
                      <div className="text-gray-600">{letter.tone || "Professional"}</div>
                      <div className="text-gray-600">{formatDate(letter.created_at)}</div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPDF(letter)}
                          className="hover:bg-purple-50"
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">PDF</span>
                        </Button>
                        <Button variant="ghost" size="sm" asChild className="hover:bg-purple-50">
                          <Link href={`/dashboard/cover-letters/${letter.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {!isLoading && filteredCoverLetters.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/20 max-w-md mx-auto">
              <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-6">
                <FileEdit className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No cover letters found</h3>
              <p className="text-gray-600 mb-6">Generate tailored cover letters for your job applications with AI.</p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Cover Letter
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
