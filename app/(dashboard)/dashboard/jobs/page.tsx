"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JobFolderList } from "@/components/dashboard/job-folder-list"
import { Input } from "@/components/ui/input"
import { Search, Plus, Briefcase, TrendingUp, Clock, Target } from "lucide-react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { pulseAnimationCSS, clearStoredItem, getStoredItem, applyTemporaryPulse } from "@/lib/animation-utils"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NewJobForm } from "@/components/jobs/new-job-form"
import { Badge } from "@/components/ui/badge"

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
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    interviewing: 0,
    offers: 0,
  })
  const router = useRouter()
  const isUpdatingStatusRef = useRef(false)

  const searchParams = useSearchParams()
  const highlightId = searchParams.get("highlight")

  // Function to fetch jobs - extracted for reuse
  const fetchJobs = useCallback(
    async (showLoadingState = true) => {
      if (isUpdatingStatusRef.current) {
        console.log("Skipping fetch because status update is in progress")
        return
      }

      try {
        if (showLoadingState) {
          setLoading(true)
        }

        const timestamp = Date.now()
        lastFetchTimestampRef.current = timestamp

        const response = await fetch(`/api/jobs?t=${timestamp}`, {
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
        const jobsArray = Array.isArray(data) ? data : data.data || data.jobs || []

        if (timestamp === lastFetchTimestampRef.current) {
          setJobs(Array.isArray(jobsArray) ? jobsArray : [])

          // Calculate stats
          const total = jobsArray.length
          const active = jobsArray.filter((job) =>
            ["applied", "interviewing", "offer"].includes(job.status?.toLowerCase()),
          ).length
          const interviewing = jobsArray.filter((job) => job.status?.toLowerCase() === "interviewing").length
          const offers = jobsArray.filter((job) => job.status?.toLowerCase() === "offer").length

          setStats({ total, active, interviewing, offers })

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
    const storedJobId = getStoredItem("newJobId") || getStoredItem("highlightJobId")
    const storedJobTitle = getStoredItem("newJobTitle")

    const sessionJobId = sessionStorage.getItem("newJobId")
    const sessionJobTitle = sessionStorage.getItem("newJobTitle")

    const jobId = storedJobId || sessionJobId
    const jobTitle = storedJobTitle || sessionJobTitle || "New job application"

    if (jobId) {
      console.log("New job detected:", jobId)
      setNewJobId(jobId)

      setPulsedJobs((prev) => new Set(prev).add(jobId))

      toast({
        title: "Job Application Created",
        description: `"${jobTitle}" has been created successfully.`,
      })

      clearStoredItem(["newJobId", "newJobTitle", "newJobTimestamp", "highlightJobId"])
      sessionStorage.removeItem("newJobId")
      sessionStorage.removeItem("newJobTitle")
      sessionStorage.removeItem("newJobTimestamp")

      fetchJobs(false)

      setTimeout(() => {
        const element = document.getElementById(`job-card-${jobId}`)
        if (element) {
          applyTemporaryPulse(element, "animate-pulse-border", 3000)
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 500)
    }
  }, [toast, fetchJobs])

  useEffect(() => {
    checkForNewJob()
  }, [checkForNewJob])

  useEffect(() => {
    const handleJobCreated = (event: CustomEvent) => {
      console.log("Job created event received:", event.detail)
      setRefreshTrigger((prev) => prev + 1)

      if (event.detail && event.detail.id) {
        setNewJobId(event.detail.id)
        setPulsedJobs((prev) => new Set(prev).add(event.detail.id))
      }
    }

    window.addEventListener("jobCreated", handleJobCreated as EventListener)

    return () => {
      window.removeEventListener("jobCreated", handleJobCreated as EventListener)
    }
  }, [])

  useEffect(() => {
    const handleStatusChanged = (event: CustomEvent) => {
      console.log("Job status changed event received:", event.detail)

      const { jobId, newStatus } = event.detail

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
      setTimeout(() => {
        const element = document.getElementById(`job-card-${highlightId}`)
        if (element) {
          applyTemporaryPulse(element, "animate-pulse-border", 3000)
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 500)
    }
  }, [highlightId, jobs])

  // Check for jobs via API call instead of server action
  useEffect(() => {
    async function checkForJobs() {
      try {
        const response = await fetch("/api/dashboard/stats")
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setHasJobs(result.stats.activeApplications > 0)
          }
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

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

  const handleStatusClick = async (jobId: string, currentStatus: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    isUpdatingStatusRef.current = true

    console.log("Status clicked for job:", jobId, "Current status:", currentStatus)

    const statusCycle = ["saved", "drafting", "applied", "interviewing", "offer", "rejected"]

    let normalizedStatus = currentStatus.toLowerCase()
    if (normalizedStatus === "interview") normalizedStatus = "interviewing"
    if (normalizedStatus === "offer received") normalizedStatus = "offer"

    let currentIndex = statusCycle.indexOf(normalizedStatus)
    if (currentIndex === -1) currentIndex = 0

    const nextIndex = (currentIndex + 1) % statusCycle.length
    const nextStatus = statusCycle[nextIndex]

    console.log(`Updating status from ${normalizedStatus} to ${nextStatus}`)

    try {
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, status: nextStatus, updated_at: new Date().toISOString() } : job,
        ),
      )

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

      const data = await response.json()
      console.log("Status update response:", data)

      const displayStatus =
        nextStatus === "interviewing"
          ? "Interview"
          : nextStatus === "offer"
            ? "Offer Received"
            : nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)

      toast({
        title: "Status Updated",
        description: `Job status changed to ${displayStatus}`,
      })

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

      setJobs((prevJobs) => [...prevJobs])
    } finally {
      setTimeout(() => {
        isUpdatingStatusRef.current = false
      }, 1000)
    }
  }

  const handleJobCreationSuccess = () => {
    setIsDialogOpen(false)
    setTimeout(() => {
      setRefreshTrigger((prev) => prev + 1)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <style jsx global>
        {pulseAnimationCSS}
      </style>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Job Applications</h1>
                </div>
                <p className="text-lg text-white/90 max-w-2xl">
                  Manage and track all your job applications in one place. Stay organized and never miss an opportunity.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-white/80" />
                    <span className="text-sm text-white/80">Total</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-white/80" />
                    <span className="text-sm text-white/80">Active</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.active}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-white/80" />
                    <span className="text-sm text-white/80">Interviews</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.interviewing}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-white/80" />
                    <span className="text-sm text-white/80">Offers</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.offers}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Action Bar */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search applications..."
                    className="pl-10 bg-white/50 border-white/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <select
                    className="h-10 rounded-lg border border-white/20 bg-white/50 px-3 py-2 text-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="h-10 rounded-lg border border-white/20 bg-white/50 px-3 py-2 text-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="company-asc">Company (A-Z)</option>
                    <option value="company-desc">Company (Z-A)</option>
                  </select>

                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
                    >
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
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {filteredJobs.length} of {jobs.length} applications
                </span>
                <Badge variant="outline" className="bg-white/50">
                  {filteredJobs.length} results
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
            <JobFolderList
              jobs={filteredJobs}
              loading={loading}
              error={error}
              newJobId={newJobId}
              onStatusChange={(jobId, newStatus) => {
                setJobs((prevJobs) =>
                  prevJobs.map((job) =>
                    job.id === jobId ? { ...job, status: newStatus, updated_at: new Date().toISOString() } : job,
                  ),
                )
              }}
            />
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-white/20">
                <CardTitle className="text-xl text-gray-800">Job Applications</CardTitle>
                <CardDescription className="text-gray-600">
                  A detailed list view of all your job applications.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-hidden">
                  <div className="grid grid-cols-5 p-4 font-medium border-b bg-gray-50/50 text-gray-700">
                    <div>Job Title</div>
                    <div>Company</div>
                    <div>Status</div>
                    <div>Created</div>
                    <div>Last Activity</div>
                  </div>

                  {loading ? (
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
                    <div className="p-12 text-center text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">No job applications found</h3>
                      <p className="text-sm">Try adjusting your filters or create a new application.</p>
                    </div>
                  ) : (
                    filteredJobs.map((job) => {
                      const isNewJob = job.id === newJobId
                      const shouldPulse = isNewJob && pulsedJobs.has(job.id)

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
                          className={`grid grid-cols-5 p-4 border-b hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-indigo-50/50 transition-all duration-200 ${shouldPulse ? "animate-pulse-border border-purple-500" : ""}`}
                          ref={isNewJob ? newJobRef : null}
                          onAnimationEnd={() => {
                            if (shouldPulse) {
                              setPulsedJobs((prev) => {
                                const newSet = new Set(prev)
                                newSet.delete(job.id)
                                return newSet
                              })
                            }
                          }}
                        >
                          <div className="font-medium text-gray-900">{job.title}</div>
                          <div className="text-gray-700">{job.company}</div>
                          <div>
                            <button
                              type="button"
                              onClick={(e) => handleStatusClick(job.id, job.status, e)}
                              className={`relative z-20 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold cursor-pointer hover:opacity-80 transition-all duration-200 ${getStatusBadgeClass(job.status)}`}
                              style={{ pointerEvents: "auto" }}
                            >
                              {displayStatus}
                            </button>
                          </div>
                          <div className="text-gray-600">{formatDate(job.created_at)}</div>
                          <div className="text-gray-600">{formatDate(job.updated_at)}</div>
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
    </div>
  )
}
