"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Building, Calendar, MapPin } from "lucide-react"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center mb-2">
                  <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <div className="flex items-center mb-2">
                  <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600 dark:text-red-400">
            <AlertCircle className="mr-2 h-5 w-5" />
            Error Loading Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (localJobs.length === 0) {
    return (
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-blue-600 dark:text-blue-400">No Jobs Found</CardTitle>
          <CardDescription>You don't have any job applications yet or none match your current filters.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Get started by adding your first job application.</p>
          <Button className="mt-4" onClick={() => router.push("/dashboard/jobs/new")}>
            Add Job Application
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {localJobs.map((job) => {
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

        return (
          <Card
            key={job.id}
            id={`job-card-${job.id}`}
            className={`overflow-hidden hover:shadow-md transition-shadow ${isNew ? "border-blue-500" : ""}`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-1" title={job.title}>
                  {job.title}
                </CardTitle>
                <button
                  type="button"
                  onClick={(e) => handleStatusClick(job.id, job.status, e)}
                  className={`relative z-20 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity ${getStatusBadgeClass(job.status)}`}
                  style={{ pointerEvents: "auto" }}
                >
                  {displayStatus}
                </button>
              </div>
              <CardDescription className="line-clamp-1" title={job.company}>
                {job.company}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              {job.location && (
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <MapPin className="mr-1 h-3.5 w-3.5" />
                  <span className="line-clamp-1">{job.location}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <Building className="mr-1 h-3.5 w-3.5" />
                <span className="line-clamp-1">{job.company}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-3.5 w-3.5" />
                <span>Added {formatDate(job.created_at)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/jobs/${job.id}`} className="w-full">
                <Button variant="outline" className="w-full">
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
