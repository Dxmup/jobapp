"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { JobFolderList } from "@/components/dashboard/job-folder-list"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { pulseAnimationCSS, clearStoredItem, getStoredItem, applyTemporaryPulse } from "@/lib/animation-utils"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NewJobForm } from "@/components/jobs/new-job-form"
import { getDashboardStats } from "@/app/actions/dashboard-actions"

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")
  const { toast } = useToast()
  const [newJobId, setNewJobId] = useState<string | null>(null)
  const newJobRef = useRef<HTMLDivElement>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const lastFetchTimestampRef = useRef<number>(0)
  const [pulsedJobs, setPulsedJobs] = useState<Set<string>>(new Set())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [hasJobs, setHasJobs] = useState(true)
  const router = useRouter()
  // Add a ref to track if we're currently updating a status
  const isUpdatingStatusRef = useRef(false)

  const searchParams = useSearchParams()
  const highlightId = searchParams.get("highlight")

  // Function to fetch jobs - extracted for reuse
  const fetchJobs = useCallback(
    async (showLoadingState = true) => {
      // Don't fetch if we're currently updating a status
      if (isUpdatingStatusRef.current) {
        console.log("Skipping fetch because status update is in progress")
        return
      }

      try {
        if (showLoadingState) {
          setLoading(true)
        }

        // Add cache-busting parameter to prevent caching
        const timestamp = Date.now()
        lastFetchTimestampRef.current = timestamp

        const response = await fetch(`/api/jobs?t=${timestamp}`, {
          // Add cache control headers
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch jobs")
        }

        const data = await response.json()
        // Check if data is an array or if it has a data/jobs property
        const jobsArray = Array.isArray(data) ? data : data.data || data.jobs || []

        // Only update if this is still the latest fetch
        if (timestamp === lastFetchTimestampRef.current) {
          // Ensure we're setting an array to the state
          setJobs(Array.isArray(jobsArray) ? jobsArray : [])

          // Check if we need to highlight a job from URL parameter
          if (highlightId) {
            console.log("Highlighting job from URL parameter:", highlightId)
            setTimeout(() => {
              const element = document.getElementById(`job-card-${highlightId}`)
              if (element) {
                applyTemporaryPulse(element, "animate-pulse-border", 3000)
                element.scrollIntoView({ behavior: "smooth", block: "center" })
              }
            }, 500)
          }
        }
      } catch (err) {
        console.error("Error fetching jobs:", err)
        setError("Failed to load jobs. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to load jobs. Please try again later.",
          variant: "destructive",
        })
      } finally {
        if (showLoadingState) {
          setLoading(false)
        }
      }
    },
    [toast, highlightId],
  )

  // Fetch jobs from the API
  useEffect(() => {
    fetchJobs()
  }, [fetchJobs, refreshTrigger])

  // Check for newly created job
  const checkForNewJob = useCallback(() => {
    // First check localStorage
    const storedJobId = getStoredItem("newJobId") || getStoredItem("highlightJobId")
    const storedJobTitle = getStoredItem("newJobTitle")
    const timestamp = getStoredItem("newJobTimestamp")

    // If not in localStorage, check sessionStorage as backup
    const sessionJobId = sessionStorage.getItem("newJobId")
    const sessionJobTitle = sessionStorage.getItem("newJobTitle")
    const sessionTimestamp = sessionStorage.getItem("newJobTimestamp")

    const jobId = storedJobId || sessionJobId
    const jobTitle = storedJobTitle || sessionJobTitle || "New job application"

    if (jobId) {
      console.log("New job detected:", jobId)
      setNewJobId(jobId)

      // Add the new job ID to the set of pulsed jobs
      setPulsedJobs((prev) => new Set(prev).add(jobId))

      // Show success toast
      toast({
        title: "Job Application Created",
        description: `"${jobTitle}" has been created successfully.`,
      })

      // Clear the storage items
      clearStoredItem(["newJobId", "newJobTitle", "newJobTimestamp", "highlightJobId"])
      sessionStorage.removeItem("newJobId")
      sessionStorage.removeItem("newJobTitle")
      sessionStorage.removeItem("newJobTimestamp")

      // Fetch the latest jobs without showing loading state
      fetchJobs(false)

      // Scroll to the new job after a short delay
      setTimeout(() => {
        const element = document.getElementById(`job-card-${jobId}`)
        if (element) {
          applyTemporaryPulse(element, "animate-pulse-border", 3000)
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 500)
    }
  }, [toast, fetchJobs])

  // Check for new job on mount and when refreshTrigger changes
  useEffect(() => {
    checkForNewJob()
  }, [checkForNewJob])

  // Listen for the custom jobCreated event
  useEffect(() => {
    const handleJobCreated = (event: CustomEvent) => {
      console.log("Job created event received:", event.detail)
      // Increment the refresh trigger to force a re-fetch
      setRefreshTrigger((prev) => prev + 1)

      // Set the new job ID
      if (event.detail && event.detail.id) {
        setNewJobId(event.detail.id)
        setPulsedJobs((prev) => new Set(prev).add(event.detail.id))
      }
    }

    // Add event listener
    window.addEventListener("jobCreated", handleJobCreated as EventListener)

    // Clean up
    return () => {
      window.removeEventListener("jobCreated", handleJobCreated as EventListener)
    }
  }, [])

  // Listen for status change events
  useEffect(() => {
    const handleStatusChanged = (event: CustomEvent) => {
      console.log("Job status changed event received:", event.detail)

      const { jobId, newStatus } = event.detail

      // Update the job in our local state
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, status: newStatus, updated_at: new Date().toISOString() } : job,
        ),
      )
    }

    window.addEventListener("jobStatusChanged", handleStatusChanged as EventListener)

    return () => {
      window.removeEventListener("jobStatusChanged", handleStatusChanged as EventListener)
    }
  }, [])

  useEffect(() => {
    if (highlightId) {
      console.log("Highlighting job from URL parameter:", highlightId)
      // Apply pulse animation to the highlighted job
      setTimeout(() => {
        const element = document.getElementById(`job-card-${highlightId}`)
        if (element) {
          applyTemporaryPulse(element, "animate-pulse-border", 3000)
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 500)
    }
  }, [highlightId, jobs])

  useEffect(() => {
    async function checkForJobs() {
      try {
        const result = await getDashboardStats()
        if (result.success) {
          setHasJobs(result.stats.activeApplications > 0)
        }
      } catch (error) {
        console.error("Error checking for jobs:", error)
      }
    }

    checkForJobs()
  }, [])

  // Filter and sort jobs
  const filteredJobs = jobs
    .filter((job) => {
      if (statusFilter === "all") return true
      return job.status.toLowerCase() === statusFilter.toLowerCase()
    })
    .filter((job) => {
      if (!searchQuery) return true
      return (
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
    .sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortOrder === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sortOrder === "company-asc") return a.company.localeCompare(b.company)
      if (sortOrder === "company-desc") return b.company.localeCompare(a.company)
      return 0
    })

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  // Helper function to get status badge styling
  const getStatusBadgeClass = (status) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case "interviewing":
      case "interview":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
      case "applied":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "drafting":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "offer":
      case "offer received":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "saved":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  // Completely rewritten status update function
  const handleStatusClick = async (jobId: string, currentStatus: string, e: React.MouseEvent) => {
    // Prevent event bubbling
    e.preventDefault()
    e.stopPropagation()

    // Set the updating flag to prevent fetches during update
    isUpdatingStatusRef.current = true

    console.log("Status clicked for job:", jobId, "Current status:", currentStatus)

    // Define the status cycle with normalized values
    const statusCycle = ["saved", "drafting", "applied", "interviewing", "offer", "rejected"]

    // Normalize the current status
    let normalizedStatus = currentStatus.toLowerCase()
    if (normalizedStatus === "interview") normalizedStatus = "interviewing"
    if (normalizedStatus === "offer received") normalizedStatus = "offer"

    // Find the current status index
    let currentIndex = statusCycle.indexOf(normalizedStatus)
    if (currentIndex === -1) currentIndex = 0

    // Get the next status
    const nextIndex = (currentIndex + 1) % statusCycle.length
    const nextStatus = statusCycle[nextIndex]

    console.log(`Updating status from ${normalizedStatus} to ${nextStatus}`)

    try {
      // Update the local state immediately for better UX
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, status: nextStatus, updated_at: new Date().toISOString() } : job,
        ),
      )

      // Make the API call
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update job status: ${response.statusText}`)
      }

      // Get the response data to confirm the update
      const data = await response.json()
      console.log("Status update response:", data)

      // Format the next status for display
      const displayStatus =
        nextStatus === "interviewing"
          ? "Interview"
          : nextStatus === "offer"
            ? "Offer Received"
            : nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)

      // Show success toast
      toast({
        title: "Status Updated",
        description: `Job status changed to ${displayStatus}`,
      })

      // Dispatch a custom event to notify other components
      const event = new CustomEvent("jobStatusChanged", {
        detail: { jobId, newStatus: nextStatus },
      })
      window.dispatchEvent(event)
    } catch (error) {
      console.error("Error updating job status:", error)
      toast({
        title: "Error",
        description: `Failed to update job status: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })

      // Revert the local state change on error
      setJobs((prevJobs) => [...prevJobs])
    } finally {
      // Clear the updating flag after a short delay
      setTimeout(() => {
        isUpdatingStatusRef.current = false
      }, 1000)
    }
  }

  // Function to handle dialog close and refresh
  const handleJobCreationSuccess = () => {
    setIsDialogOpen(false)
    // Force refresh after a short delay
    setTimeout(() => {
      setRefreshTrigger((prev) => prev + 1)
    }, 500)
  }

  return (
    <div className="space-y-6">
      <style jsx global>
        {pulseAnimationCSS}
      </style>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Applications</h1>
          <p className="text-muted-foreground">Manage and track all your job applications in one place.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {hasJobs ? "Add a Job to Track" : "Let's add the job you're interested in!"}
          </Button>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add a Job to Track</DialogTitle>
            </DialogHeader>
            <NewJobForm onSuccess={handleJobCreationSuccess} />
          </DialogContent>
        </Dialog>
      </div>
      <Separator />

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search applications..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="saved">Saved</option>
          <option value="drafting">Drafting</option>
          <option value="applied">Applied</option>
          <option value="interviewing">Interviewing</option>
          <option value="offer">Offer Received</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="company-asc">Company (A-Z)</option>
          <option value="company-desc">Company (Z-A)</option>
        </select>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <div className="text-sm text-muted-foreground">
            Showing {filteredJobs.length} of {jobs.length} applications
          </div>
        </div>

        <TabsContent value="grid" className="mt-6">
          <JobFolderList
            jobs={filteredJobs}
            loading={loading}
            error={error}
            newJobId={newJobId}
            onStatusChange={(jobId, newStatus) => {
              // Update the job in our local state
              setJobs((prevJobs) =>
                prevJobs.map((job) =>
                  job.id === jobId ? { ...job, status: newStatus, updated_at: new Date().toISOString() } : job,
                ),
              )
            }}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
              <CardDescription>A detailed list view of all your job applications.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 p-4 font-medium border-b">
                  <div>Job Title</div>
                  <div>Company</div>
                  <div>Status</div>
                  <div>Created</div>
                  <div>Last Activity</div>
                </div>

                {loading ? (
                  // Loading skeleton
                  Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <div key={index} className="grid grid-cols-5 p-4 border-b">
                        <div>
                          <Skeleton className="h-5 w-32" />
                        </div>
                        <div>
                          <Skeleton className="h-5 w-24" />
                        </div>
                        <div>
                          <Skeleton className="h-5 w-20" />
                        </div>
                        <div>
                          <Skeleton className="h-5 w-20" />
                        </div>
                        <div>
                          <Skeleton className="h-5 w-20" />
                        </div>
                      </div>
                    ))
                ) : filteredJobs.length === 0 ? (
                  // Empty state
                  <div className="p-8 text-center text-muted-foreground">
                    No job applications found. Try adjusting your filters or create a new application.
                  </div>
                ) : (
                  // Job list
                  filteredJobs.map((job) => {
                    const isNewJob = job.id === newJobId
                    const shouldPulse = isNewJob && pulsedJobs.has(job.id)

                    // Normalize status for display
                    const statusLower = job.status.toLowerCase()
                    let displayStatus = job.status
                    if (statusLower === "interviewing" || statusLower === "interview") {
                      displayStatus = "Interview"
                    } else if (statusLower === "offer") {
                      displayStatus = "Offer Received"
                    } else {
                      displayStatus = statusLower.charAt(0).toUpperCase() + statusLower.slice(1)
                    }

                    return (
                      <div
                        id={`job-card-${job.id}`}
                        key={job.id}
                        className={`grid grid-cols-5 p-4 border-b hover:bg-muted/50 ${shouldPulse ? "animate-pulse-border border-blue-500" : ""}`}
                        ref={isNewJob ? newJobRef : null}
                        onAnimationEnd={() => {
                          // When animation ends, remove this job from the pulsed jobs set
                          if (shouldPulse) {
                            setPulsedJobs((prev) => {
                              const newSet = new Set(prev)
                              newSet.delete(job.id)
                              return newSet
                            })
                          }
                        }}
                      >
                        <div className="font-medium">{job.title}</div>
                        <div>{job.company}</div>
                        <div>
                          {/* Direct button instead of a component to eliminate any potential issues */}
                          <button
                            type="button"
                            onClick={(e) => handleStatusClick(job.id, job.status, e)}
                            className={`relative z-20 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity ${getStatusBadgeClass(job.status)}`}
                            style={{ pointerEvents: "auto" }}
                          >
                            {displayStatus}
                          </button>
                        </div>
                        <div>{formatDate(job.created_at)}</div>
                        <div>{formatDate(job.updated_at)}</div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
