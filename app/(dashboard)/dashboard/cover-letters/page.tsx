"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Download, FileEdit, Search, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRef, useEffect, useState } from "react"
import { getUserCoverLetters } from "@/app/actions/cover-letter-actions"
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
        const result = await getUserCoverLetters()

        debugLog += `Server action result: ${JSON.stringify(result)}
`

        if (result.success && result.coverLetters) {
          setCoverLetters(result.coverLetters)

          // Extract unique companies
          const uniqueCompanies = Array.from(
            new Set(result.coverLetters.filter((letter) => letter.jobs?.company).map((letter) => letter.jobs?.company)),
          )

          setCompanies(uniqueCompanies as string[])
          debugLog += `Found ${result.coverLetters.length} cover letters
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
      // Get the user ID
      const currentUserId = userId || (await getUserId())

      if (!currentUserId) {
        console.error("No user ID available")
        toast({
          title: "Authentication Error",
          description: "Could not determine your user ID",
          variant: "destructive",
        })
        setIsLoadingJobs(false)
        return
      }

      console.log("Using user ID for jobs:", currentUserId)

      // Try a simple query to check if we can access the jobs table
      const { data: testData, error: testError } = await supabase.from("jobs").select("count").limit(1)

      if (testError) {
        console.error("Error testing jobs table access:", testError)
        toast({
          title: "Database Error",
          description: "Could not access jobs table",
          variant: "destructive",
        })
        setIsLoadingJobs(false)
        return
      }

      console.log("Jobs table access test successful")

      // Now fetch the actual jobs for this user
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false })

      if (jobsError) {
        console.error("Error fetching jobs:", jobsError)
        toast({
          title: "Error",
          description: "Failed to load jobs",
          variant: "destructive",
        })
        setIsLoadingJobs(false)
        return
      }

      console.log(`Found ${jobsData?.length || 0} jobs for user ID ${currentUserId}:`, jobsData)
      setJobs(jobsData || [])
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      })
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
    <div className="space-y-6">
      <style jsx global>
        {pulseAnimationCSS}
      </style>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cover Letters</h1>
          <p className="text-muted-foreground">Generate and manage tailored cover letters for your job applications.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={fetchJobs}>
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
      <Separator />

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search cover letters..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
        </select>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <div className="text-sm text-muted-foreground">Showing {filteredCoverLetters.length} cover letters</div>
        </div>

        <TabsContent value="grid" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading && (
              <div className="col-span-full flex justify-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-muted-foreground">Loading cover letters...</p>
                </div>
              </div>
            )}
            {filteredCoverLetters.map((letter) => (
              <Card
                key={letter.id}
                ref={letter.id === newCoverLetterId ? newCoverLetterRef : null}
                className={letter.id === newCoverLetterId ? "border-blue-500 animate-pulse-border" : ""}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg truncate max-w-[70%]">{letter.name}</CardTitle>
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 text-xs whitespace-nowrap">
                      <Sparkles className="mr-1 h-3 w-3" />
                      AI
                    </Badge>
                  </div>
                  <CardDescription className="truncate">{letter.file_name || `${letter.name}.pdf`}</CardDescription>
                </CardHeader>
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
                <CardFooter className="flex flex-col space-y-2">
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Button variant="outline" className="w-full" onClick={() => handleDownloadPDF(letter)}>
                      <Download className="mr-1 h-4 w-4" />
                      PDF
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/dashboard/cover-letters/${letter.id}`}>View</Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Cover Letters</CardTitle>
              <CardDescription>A detailed list view of all your cover letters.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-6 p-4 font-medium border-b">
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
                    className={`grid grid-cols-6 p-4 border-b hover:bg-muted/50 ${letter.id === newCoverLetterId ? "border-blue-500 animate-pulse-border" : ""}`}
                  >
                    <div className="font-medium">{letter.name}</div>
                    <div>{letter.jobs?.title || "N/A"}</div>
                    <div>{letter.jobs?.company || "N/A"}</div>
                    <div>{letter.tone || "Professional"}</div>
                    <div>{formatDate(letter.created_at)}</div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadPDF(letter)}>
                        <Download className="h-4 w-4" />
                        <span className="sr-only">PDF</span>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
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
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <FileEdit className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No cover letters found</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Generate tailored cover letters for your job applications with AI.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Cover Letter
          </Button>
        </div>
      )}
    </div>
  )
}
