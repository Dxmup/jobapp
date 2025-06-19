"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, FileText, Mail, MessageSquare, MapPin, Calendar, Plus } from "lucide-react"
import Link from "next/link"

interface Job {
  id: string
  title: string
  company: string
  location?: string
  status: string
  created_at: string
}

export function JobCarousel() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)

  const jobsPerPage = 3
  const totalPages = Math.ceil(jobs.length / jobsPerPage)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs")
        if (response.ok) {
          const data = await response.json()
          setJobs(data.jobs || [])
        } else {
          setError("Failed to fetch jobs")
        }
      } catch (error) {
        console.error("Error fetching jobs:", error)
        setError("Failed to fetch jobs")
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const getCurrentPageJobs = () => {
    const startIndex = currentPage * jobsPerPage
    return jobs.slice(startIndex, startIndex + jobsPerPage)
  }

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "interviewing":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "offer":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "rejected":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  if (isLoading) {
    return <JobCarouselSkeleton />
  }

  if (error) {
    return (
      <Card className="border-0 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Failed to load jobs</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (jobs.length === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No job applications yet</h3>
          <p className="text-muted-foreground mb-4 text-center">
            Start tracking your job applications to see them here
          </p>
          <Button asChild>
            <Link href="/dashboard/jobs/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Job
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getCurrentPageJobs().map((job) => (
            <Card
              key={job.id}
              className="group relative overflow-hidden border-0 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm hover:from-white/10 hover:to-white/5 transition-all duration-300"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg line-clamp-1">{job.title}</CardTitle>
                    <p className="text-sm text-muted-foreground font-medium">{job.company}</p>
                    {job.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </div>
                    )}
                  </div>
                  <Badge className={`${getStatusColor(job.status)} border`}>{job.status}</Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  Added {new Date(job.created_at).toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs bg-white/5 border-white/10 hover:bg-white/10"
                    asChild
                  >
                    <Link href={`/jobs/${job.id}/optimize-resume`}>
                      <FileText className="w-3 h-3 mr-1" />
                      Resume
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs bg-white/5 border-white/10 hover:bg-white/10"
                    asChild
                  >
                    <Link href={`/jobs/${job.id}/generate-cover-letter`}>
                      <Mail className="w-3 h-3 mr-1" />
                      Cover
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs bg-white/5 border-white/10 hover:bg-white/10"
                    asChild
                  >
                    <Link href={`/dashboard/interview-prep/${job.id}`}>
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Interview
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation Arrows */}
        {totalPages > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/10 border-white/20 hover:bg-white/20"
              onClick={prevPage}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/10 border-white/20 hover:bg-white/20"
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* Pagination Dots */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentPage ? "bg-gradient-to-r from-purple-500 to-cyan-500" : "bg-white/20 hover:bg-white/40"
              }`}
              onClick={() => setCurrentPage(index)}
            />
          ))}
        </div>
      )}

      {/* Page Indicator */}
      {totalPages > 1 && (
        <div className="text-center text-sm text-muted-foreground">
          Page {currentPage + 1} of {totalPages} • {jobs.length} total jobs
        </div>
      )}
    </div>
  )
}

function JobCarouselSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="border-0 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="space-y-2">
              <div className="h-5 bg-white/10 rounded animate-pulse" />
              <div className="h-4 bg-white/10 rounded w-2/3 animate-pulse" />
              <div className="h-3 bg-white/10 rounded w-1/2 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-8 bg-white/10 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
