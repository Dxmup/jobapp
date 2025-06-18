"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, FileText, Mail, MessageSquare, Building, MapPin, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Job {
  id: string
  title: string
  company: string
  location?: string
  status: string
  created_at: string
  updated_at: string
}

export function JobCarousel() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  const itemsPerPage = 3

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/jobs")
      if (!response.ok) {
        throw new Error("Failed to fetch jobs")
      }
      const data = await response.json()
      setJobs(data.jobs || [])
    } catch (err) {
      console.error("Error fetching jobs:", err)
      setError(err instanceof Error ? err.message : "Failed to load jobs")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeClass = (status: string) => {
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const handleNavigation = (jobId: string, type: "resumes" | "cover-letters" | "interview") => {
    switch (type) {
      case "resumes":
        router.push(`/jobs/${jobId}/optimize-resume`)
        break
      case "cover-letters":
        router.push(`/jobs/${jobId}/generate-cover-letter`)
        break
      case "interview":
        router.push(`/dashboard/interview-prep/${jobId}`)
        break
    }
  }

  const nextSlide = () => {
    if (currentIndex < Math.ceil(jobs.length / itemsPerPage) - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const visibleJobs = jobs.slice(currentIndex * itemsPerPage, (currentIndex + 1) * itemsPerPage)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Job Applications</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex gap-2 w-full">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                  </div>
                </CardFooter>
              </Card>
            ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Job Applications</h2>
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="p-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button className="mt-4" onClick={fetchJobs}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Job Applications</h2>
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">No Job Applications Yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first job application to track your progress.
            </p>
            <Button onClick={() => router.push("/dashboard/jobs/new")}>Add Job Application</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalPages = Math.ceil(jobs.length / itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Job Applications</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={currentIndex >= totalPages - 1}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleJobs.map((job) => {
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
            <Card key={job.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2" title={job.title}>
                    {job.title}
                  </CardTitle>
                  <Badge className={cn("text-xs", getStatusBadgeClass(job.status))}>{displayStatus}</Badge>
                </div>
                <CardDescription className="line-clamp-1" title={job.company}>
                  {job.company}
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-2">
                <div className="space-y-1 text-sm text-muted-foreground">
                  {job.location && (
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-3.5 w-3.5" />
                      <span className="line-clamp-1">{job.location}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Building className="mr-1 h-3.5 w-3.5" />
                    <span className="line-clamp-1">{job.company}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3.5 w-3.5" />
                    <span>Added {formatDate(job.created_at)}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigation(job.id, "resumes")}
                    className="flex-1 text-xs"
                  >
                    <FileText className="mr-1 h-3 w-3" />
                    Resume
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigation(job.id, "cover-letters")}
                    className="flex-1 text-xs"
                  >
                    <Mail className="mr-1 h-3 w-3" />
                    Cover Letter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigation(job.id, "interview")}
                    className="flex-1 text-xs"
                  >
                    <MessageSquare className="mr-1 h-3 w-3" />
                    Interview
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Pagination dots */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentIndex ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
