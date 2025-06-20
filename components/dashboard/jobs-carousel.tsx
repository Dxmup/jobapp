"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus, Briefcase } from "lucide-react"
import Link from "next/link"
import { JobCard } from "./job-card"

interface Job {
  id: string
  title: string
  company: string
  status: string
  created_at: string
}

export function JobsCarousel() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Fixed 3 cards per view
  const cardsPerView = 3
  const maxIndex = Math.max(0, jobs.length - cardsPerView)

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch("/api/jobs/list-for-user")
        if (!response.ok) {
          throw new Error("Failed to fetch jobs")
        }
        const data = await response.json()
        setJobs(data.jobs || [])
      } catch (error) {
        console.error("Error fetching jobs:", error)
        setError("Failed to load jobs")
        setJobs([])
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            Your Jobs
          </h2>
        </div>
        <div className="w-full overflow-hidden">
          <div className="flex gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-1/3 flex-shrink-0">
                <div className="h-[140px] rounded-xl bg-muted/50 animate-pulse mx-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-0 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6 text-center">
          <p className="text-muted-foreground text-sm sm:text-base">Failed to load jobs. Please try again.</p>
        </CardContent>
      </Card>
    )
  }

  if (jobs.length === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            Your Jobs
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6 sm:py-8 px-4 sm:px-6">
          <div className="space-y-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
              <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">No jobs yet</h3>
              <p className="text-sm text-muted-foreground">Start tracking your job applications</p>
            </div>
            <Button
              asChild
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
              size="sm"
            >
              <Link href="/dashboard/jobs/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Job
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If we have fewer jobs than cards per view, show them in a simple grid
  if (jobs.length <= cardsPerView) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            Your Jobs ({jobs.length})
          </h2>
          <Button
            size="sm"
            asChild
            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
          >
            <Link href="/dashboard/jobs/new">
              <Plus className="w-4 h-4 mr-2" />
              New Job
            </Link>
          </Button>
        </div>
        <div className="w-full overflow-hidden">
          <div className="flex gap-4">
            {jobs.map((job) => (
              <div key={job.id} className="w-1/3 flex-shrink-0">
                <div className="mx-2">
                  <JobCard job={job} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
          Your Jobs ({jobs.length})
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="bg-white/5 border-white/10 hover:bg-white/10 h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className="bg-white/5 border-white/10 hover:bg-white/10 h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            asChild
            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
          >
            <Link href="/dashboard/jobs/new">
              <Plus className="w-4 h-4 mr-2" />
              New Job
            </Link>
          </Button>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`,
          }}
        >
          {jobs.map((job) => (
            <div key={job.id} className="w-1/3 flex-shrink-0">
              <div className="mx-2">
                <JobCard job={job} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {jobs.length > cardsPerView && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.ceil(jobs.length / cardsPerView) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-purple-500" : "bg-white/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
