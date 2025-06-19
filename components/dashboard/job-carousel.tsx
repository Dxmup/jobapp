"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, FileText, Mail, MessageSquare, MapPin, Calendar } from "lucide-react"
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
  const [currentPage, setCurrentPage] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const jobsPerPage = 3
  const totalPages = Math.ceil(jobs.length / jobsPerPage)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs")
        if (response.ok) {
          const data = await response.json()
          setJobs(data)
        } else {
          setError("Failed to load jobs")
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error)
        setError("Failed to load jobs")
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
        return "bg-blue-100 text-blue-800"
      case "interview":
        return "bg-yellow-100 text-yellow-800"
      case "offer":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Your Job Applications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-8 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Your Job Applications</h2>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Your Job Applications</h2>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No job applications yet</p>
            <Button asChild>
              <Link href="/dashboard/jobs/new">Add Your First Job</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Your Job Applications</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage === 0}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentPage + 1} of {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage >= totalPages - 1}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getCurrentPageJobs().map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <p className="text-muted-foreground">{job.company}</p>
                </div>
                <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
              </div>
              {job.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {job.location}
                </div>
              )}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {new Date(job.created_at).toLocaleDateString()}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/jobs/${job.id}/optimize-resume`}>
                    <FileText className="w-3 h-3 mr-1" />
                    Resume
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/jobs/${job.id}/generate-cover-letter`}>
                    <Mail className="w-3 h-3 mr-1" />
                    Cover Letter
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
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

      {totalPages > 1 && (
        <div className="flex justify-center gap-1">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-2 h-2 rounded-full transition-colors ${index === currentPage ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
