"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, MapPin, Clock, DollarSign } from "lucide-react"

interface Job {
  id: string
  title: string
  company: string
  location: string
  type: string
  salary: string
  description: string
  tags: string[]
  postedAt: string
}

interface JobCarouselProps {
  jobs?: Job[]
}

const JOBS_PER_PAGE = 3

function getCurrentPageJobs(jobs: Job[], currentPage: number): Job[] {
  if (!Array.isArray(jobs)) {
    return []
  }

  const startIndex = currentPage * JOBS_PER_PAGE
  const endIndex = startIndex + JOBS_PER_PAGE
  return jobs.slice(startIndex, endIndex)
}

export function JobCarousel({ jobs = [] }: JobCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0)

  // Ensure jobs is always an array
  const safeJobs = Array.isArray(jobs) ? jobs : []
  const totalPages = Math.ceil(safeJobs.length / JOBS_PER_PAGE)
  const currentJobs = getCurrentPageJobs(safeJobs, currentPage)

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  if (safeJobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No jobs available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recommended Jobs</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevPage} disabled={totalPages <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentPage + 1} of {totalPages}
          </span>
          <Button variant="outline" size="icon" onClick={nextPage} disabled={totalPages <= 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{job.title}</CardTitle>
              <CardDescription className="font-medium">{job.company}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {job.type}
                </div>
              </div>

              <div className="flex items-center gap-1 text-sm font-medium">
                <DollarSign className="h-4 w-4" />
                {job.salary}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>

              <div className="flex flex-wrap gap-2">
                {job.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">{job.postedAt}</span>
                <Button size="sm">Apply Now</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
