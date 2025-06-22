"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JobFolderList } from "@/components/dashboard/job-folder-list"
import { Input } from "@/components/ui/input"
import { Search, Plus, Briefcase, TrendingUp, Clock, Target, Sparkles, Zap, Star, Rocket } from "lucide-react"
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
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg"
      case "applied":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg"
      case "drafting":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg"
      case "offer":
      case "offer received":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg"
      case "rejected":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg"
      case "saved":
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-white border-0 shadow-lg"
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-white border-0 shadow-lg"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 relative overflow-hidden">
      <style jsx global>
        {pulseAnimationCSS}
      </style>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-300/10 to-purple-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-white bg-[linear-gradient(to_right,#8b5cf6_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf6_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute inset-0 bg-white"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>

        <div className="relative px-6 py-16 rounded-3xl">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-white/20">
                <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                <span className="text-gray-700 font-medium">Your Dream Job Awaits</span>
                <Rocket className="h-5 w-5 text-cyan-300 animate-bounce" />
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
                  Job Applications
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Manage and track all your job applications in one place.
                <span className="text-cyan-600 font-semibold"> Stay organized</span> and
                <span className="text-pink-600 font-semibold"> never miss an opportunity</span>.
              </p>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[
                { icon: Target, label: "Total", value: stats.total, color: "from-purple-500 to-pink-500" },
                { icon: TrendingUp, label: "Active", value: stats.active, color: "from-cyan-500 to-blue-500" },
                { icon: Clock, label: "Interviews", value: stats.interviewing, color: "from-green-500 to-emerald-500" },
                { icon: Star, label: "Offers", value: stats.offers, color: "from-yellow-500 to-orange-500" },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="group relative bg-gray-50 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-cyan-500/5"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                        <stat.icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-gray-600 font-medium">{stat.label}</span>
                    </div>
                    <div className="text-3xl lg:text-4xl font-bold text-gray-800 group-hover:scale-110 transition-transform duration-300">
                      {stat.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-12 rounded-3xl">
        {/* Enhanced Action Bar */}
        <div className="mb-12">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-cyan-500/5"></div>
            <CardContent className="relative p-8">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-500" />
                  <Input
                    type="search"
                    placeholder="Search your dream opportunities..."
                    className="pl-12 h-12 bg-white/70 border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-4">
                  <select
                    className="h-12 rounded-xl border-purple-200 bg-white/70 px-4 py-2 text-gray-700 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
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
                    className="h-12 rounded-xl border-purple-200 bg-white/70 px-4 py-2 text-gray-700 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
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
                      className="h-12 px-8 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-xl font-semibold"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      <Zap className="mr-2 h-4 w-4" />
                      {hasJobs ? "Add New Opportunity" : "Start Your Journey!"}
                    </Button>
                    <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-xl border-purple-200">
                      <DialogHeader>
                        <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          Add Your Next Opportunity
                        </DialogTitle>
                      </DialogHeader>
                      <NewJobForm onSuccess={handleJobCreationSuccess} />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">
                  Showing <span className="text-purple-600 font-bold">{filteredJobs.length}</span> of{" "}
                  <span className="text-purple-600 font-bold">{jobs.length}</span> applications
                </span>
                <Badge
                  variant="outline"
                  className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 font-semibold"
                >
                  {filteredJobs.length} results
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Content Tabs */}
        <Tabs defaultValue="grid" className="w-full">
          <div className="mb-8">
            <TabsList className="bg-white/80 backdrop-blur-xl border border-purple-200 shadow-xl rounded-2xl p-2">
              <TabsTrigger
                value="grid"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-xl font-semibold px-8 py-3 transition-all duration-300"
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Grid View
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-xl font-semibold px-8 py-3 transition-all duration-300"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                List View
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="grid" className="mt-8">
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

          <TabsContent value="list" className="mt-8">
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-cyan-500/5"></div>
              <CardHeader className="relative bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Briefcase className="h-6 w-6 text-purple-600" />
                  Your Job Applications
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  A detailed overview of all your career opportunities.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative p-0">
                <div className="overflow-hidden">
                  <div className="grid grid-cols-5 p-6 font-semibold border-b bg-gradient-to-r from-purple-50/50 to-pink-50/50 text-gray-700">
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
                        <div key={index} className="grid grid-cols-5 p-6 border-b border-purple-100">
                          <div>
                            <Skeleton className="h-5 w-32 bg-purple-100" />
                          </div>
                          <div>
                            <Skeleton className="h-5 w-24 bg-purple-100" />
                          </div>
                          <div>
                            <Skeleton className="h-5 w-20 bg-purple-100" />
                          </div>
                          <div>
                            <Skeleton className="h-5 w-20 bg-purple-100" />
                          </div>
                          <div>
                            <Skeleton className="h-5 w-20 bg-purple-100" />
                          </div>
                        </div>
                      ))
                  ) : filteredJobs.length === 0 ? (
                    <div className="p-16 text-center">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                        <Briefcase className="h-12 w-12 text-purple-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">No Applications Yet</h3>
                      <p className="text-gray-600 mb-6">Ready to start your job search journey?</p>
                      <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Job
                      </Button>
                    </div>
                  ) : (
                    filteredJobs.map((job, index) => {
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
                          className={`grid grid-cols-5 p-6 border-b border-purple-50 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-300 hover:shadow-lg ${shouldPulse ? "animate-pulse-border border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50" : ""}`}
                          ref={isNewJob ? newJobRef : null}
                          style={{ animationDelay: `${index * 50}ms` }}
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
                          <div className="font-semibold text-gray-900 hover:text-purple-600 transition-colors">
                            {job.title}
                          </div>
                          <div className="text-gray-700 font-medium">{job.company}</div>
                          <div>
                            <button
                              type="button"
                              onClick={(e) => handleStatusClick(job.id, job.status, e)}
                              className={`relative z-20 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold cursor-pointer hover:scale-105 transition-all duration-200 ${getStatusBadgeClass(job.status)}`}
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
