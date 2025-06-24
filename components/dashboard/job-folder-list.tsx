"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Building, Calendar, MapPin, Sparkles, Zap, TrendingUp } from "lucide-react"
import Link from "next/link"

interface JobFolderListProps {
  jobs: any[]
  loading: boolean
  error: string | null
  newJobId: string | null
  onStatusChange?: (jobId: string, newStatus: string) => void
}

export function JobFolderList({ jobs, loading, error, newJobId, onStatusChange }: JobFolderListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [localJobs, setLocalJobs] = useState(jobs)
  const isUpdatingStatusRef = useRef(false)

  useEffect(() => {
    if (!isUpdatingStatusRef.current) {
      setLocalJobs(jobs)
    }
  }, [jobs])

  useEffect(() => {
    const handleStatusChanged = (event: CustomEvent) => {
      console.log("JobFolderList: Job status changed event received:", event.detail)

      const { jobId, newStatus } = event.detail

      setLocalJobs((prevJobs) =>
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

  const getCardGradient = (status) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case "interviewing":
      case "interview":
        return "from-purple-50 to-pink-50 border-purple-200"
      case "applied":
        return "from-blue-50 to-cyan-50 border-blue-200"
      case "drafting":
        return "from-yellow-50 to-orange-50 border-yellow-200"
      case "offer":
      case "offer received":
        return "from-green-50 to-emerald-50 border-green-200"
      case "rejected":
        return "from-red-50 to-pink-50 border-red-200"
      case "saved":
        return "from-gray-50 to-slate-50 border-gray-200"
      default:
        return "from-gray-50 to-slate-50 border-gray-200"
    }
  }

  const handleStatusClick = async (jobId: string, currentStatus: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    isUpdatingStatusRef.current = true

    console.log("JobFolderList: Status clicked for job:", jobId, "Current status:", currentStatus)

    const statusCycle = ["saved", "drafting", "applied", "interviewing", "offer", "rejected"]

    let normalizedStatus = currentStatus.toLowerCase()
    if (normalizedStatus === "interview") normalizedStatus = "interviewing"
    if (normalizedStatus === "offer received") normalizedStatus = "offer"

    let currentIndex = statusCycle.indexOf(normalizedStatus)
    if (currentIndex === -1) currentIndex = 0

    const nextIndex = (currentIndex + 1) % statusCycle.length
    const nextStatus = statusCycle[nextIndex]

    console.log(`JobFolderList: Updating status from ${normalizedStatus} to ${nextStatus}`)

    try {
      setLocalJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, status: nextStatus, updated_at: new Date().toISOString() } : job,
        ),
      )

      if (onStatusChange) {
        onStatusChange(jobId, nextStatus)
      }

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
      console.log("JobFolderList: Status update response:", data)

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
      console.error("JobFolderList: Error updating job status:", error)
      toast({
        title: "Error",
        description: `Failed to update job status: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })

      setLocalJobs(jobs)
    } finally {
      setTimeout(() => {
        isUpdatingStatusRef.current = false
      }, 1000)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <Card key={index} className="overflow-hidden bg-white/80 backdrop-blur-sm border-purple-100 shadow-xl">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4 mb-2 bg-purple-100" />
                <Skeleton className="h-4 w-1/2 bg-purple-100" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center mb-2">
                  <Skeleton className="h-4 w-4 mr-2 rounded-full bg-purple-100" />
                  <Skeleton className="h-4 w-1/3 bg-purple-100" />
                </div>
                <div className="flex items-center mb-2">
                  <Skeleton className="h-4 w-4 mr-2 rounded-full bg-purple-100" />
                  <Skeleton className="h-4 w-1/2 bg-purple-100" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full bg-purple-100" />
              </CardFooter>
            </Card>
          ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertCircle className="mr-2 h-5 w-5" />
            Error Loading Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">{error}</p>
          <Button
            className="mt-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (localJobs.length === 0) {
    return (
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-pink-100/20"></div>
        <CardHeader className="relative text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
            <Sparkles className="h-12 w-12 text-white" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Ready to Start Your Journey?
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 mt-2">
            Add your first job application and take the first step toward your dream career.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative text-center pb-12">
          <Button
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-8 py-3 text-lg font-semibold"
            onClick={() => router.push("/dashboard/jobs/new")}
          >
            <Zap className="mr-2 h-5 w-5" />
            Add Your First Job
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {localJobs.map((job, index) => {
        const statusLower = job.status.toLowerCase()
        let displayStatus = job.status
        if (statusLower === "interviewing" || statusLower === "interview") {
          displayStatus = "Interview"
        } else if (statusLower === "offer") {
          displayStatus = "Offer Received"
        } else {
          displayStatus = statusLower.charAt(0).toUpperCase() + statusLower.slice(1)
        }

        const isNew = job.id === newJobId
        const cardGradient = getCardGradient(job.status)

        return (
          <Card
            key={job.id}
            id={`job-card-${job.id}`}
            className={`group overflow-hidden bg-gradient-to-br ${cardGradient} backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 ${isNew ? "ring-4 ring-purple-300 ring-opacity-50" : ""}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <CardHeader className="relative pb-3">
              <div className="flex justify-between items-start mb-2">
                <CardTitle
                  className="text-lg font-bold line-clamp-2 group-hover:text-purple-700 transition-colors"
                  title={job.title}
                >
                  {job.title}
                </CardTitle>
                <button
                  type="button"
                  onClick={(e) => handleStatusClick(job.id, job.status, e)}
                  className={`relative z-20 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold cursor-pointer hover:scale-110 transition-all duration-200 ${getStatusBadgeClass(job.status)}`}
                  style={{ pointerEvents: "auto" }}
                >
                  {displayStatus}
                </button>
              </div>
              <CardDescription className="line-clamp-1 font-semibold text-gray-700" title={job.company}>
                {job.company}
              </CardDescription>
            </CardHeader>

            <CardContent className="relative pb-3 space-y-3">
              {job.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="mr-2 h-4 w-4 text-purple-500" />
                  <span className="line-clamp-1 font-medium">{job.location}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <Building className="mr-2 h-4 w-4 text-purple-500" />
                <span className="line-clamp-1 font-medium">{job.company}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="mr-2 h-4 w-4 text-purple-500" />
                <span className="font-medium">Added {formatDate(job.created_at)}</span>
              </div>
            </CardContent>

            <CardFooter className="relative">
              <Link href={`/jobs/${job.id}`} className="w-full">
                <Button
                  variant="outline"
                  className="w-full bg-white/80 border-purple-200 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:border-transparent transition-all duration-300 font-semibold group-hover:shadow-lg"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
