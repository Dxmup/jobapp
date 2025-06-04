"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase, ArrowRight, FileText, Loader2 } from "lucide-react"
import { getJobResumes } from "@/app/actions/interview-prep-actions"
import { Skeleton } from "@/components/ui/skeleton"

type Job = {
  id: string
  title: string
  company: string
  status: string
}

type Resume = {
  id: string
  name: string
  file_name: string
  created_at: string
}

export function JobSelector({ jobs = [] }: { jobs?: Job[] }) {
  const router = useRouter()
  const [selectedJobId, setSelectedJobId] = useState<string>("")
  const [selectedResumeId, setSelectedResumeId] = useState<string>("")
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loadingResumes, setLoadingResumes] = useState<boolean>(false)
  const [noResumesFound, setNoResumesFound] = useState<boolean>(false)
  const [isNavigating, setIsNavigating] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Fetch jobs if not provided
  useEffect(() => {
    if (!jobs || jobs.length === 0) {
      setIsLoading(true)
      // Fetch jobs if not provided as props
      fetch("/api/jobs")
        .then((res) => res.json())
        .then((data) => {
          if (data.jobs) {
            // Do nothing, we'll use the fetched jobs in the component
            setIsLoading(false)
          }
        })
        .catch((error) => {
          console.error("Error fetching jobs:", error)
          setIsLoading(false)
        })
    }
  }, [jobs])

  // Fetch resumes when a job is selected
  useEffect(() => {
    if (selectedJobId) {
      setLoadingResumes(true)
      setNoResumesFound(false)
      setSelectedResumeId("")

      getJobResumes(selectedJobId)
        .then((result) => {
          if (result.success && result.resumes) {
            setResumes(result.resumes)
            setNoResumesFound(result.resumes.length === 0)

            // Auto-select the first resume if available
            if (result.resumes.length === 1) {
              setSelectedResumeId(result.resumes[0].id)
            }
          } else {
            setResumes([])
            setNoResumesFound(true)
          }
        })
        .catch((error) => {
          console.error("Error fetching resumes:", error)
          setResumes([])
          setNoResumesFound(true)
        })
        .finally(() => {
          setLoadingResumes(false)
        })
    } else {
      setResumes([])
      setSelectedResumeId("")
      setNoResumesFound(false)
    }
  }, [selectedJobId])

  const handlePrepare = useCallback(() => {
    if (selectedJobId) {
      setIsNavigating(true)

      const url = selectedResumeId
        ? `/dashboard/interview-prep/${selectedJobId}?resumeId=${selectedResumeId}`
        : `/dashboard/interview-prep/${selectedJobId}`

      console.log(`Navigating to: ${url}`)
      console.log(`Selected job ID: ${selectedJobId}`)
      console.log(`Selected resume ID: ${selectedResumeId || "none"}`)

      router.push(url)
    }
  }, [router, selectedJobId, selectedResumeId])

  // Helper function to get resume display name
  const getResumeDisplayName = (resume: Resume) => {
    // Try to use name first, then file_name, then fallback
    if (resume.name && resume.name.trim() !== "") {
      return resume.name
    }

    if (resume.file_name && resume.file_name.trim() !== "") {
      // Remove file extension and replace underscores/hyphens with spaces
      return resume.file_name
        .replace(/\.[^/.]+$/, "") // Remove extension
        .replace(/[_-]/g, " ") // Replace underscores and hyphens with spaces
    }

    // Fallback to a formatted date if available
    if (resume.created_at) {
      const date = new Date(resume.created_at)
      return `Resume (${date.toLocaleDateString()})`
    }

    return "Untitled Resume"
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Select a Job</CardTitle>
        <CardDescription>Choose a job to prepare for an interview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {jobs && jobs.length > 0 ? (
          <>
            <div className="space-y-2">
              <label htmlFor="job-select" className="text-sm font-medium">
                Job
              </label>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger id="job-select">
                  <SelectValue placeholder="Select a job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} at {job.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedJobId && (
              <div className="space-y-2">
                <label htmlFor="resume-select" className="text-sm font-medium">
                  Resume (Optional)
                </label>
                {loadingResumes ? (
                  <Skeleton className="h-10 w-full" />
                ) : noResumesFound ? (
                  <div className="text-sm text-amber-600 flex items-center gap-2 p-2 bg-amber-50 rounded-md">
                    <FileText className="h-4 w-4" />
                    <span>No resumes found for this job. You can still proceed without a resume.</span>
                  </div>
                ) : (
                  <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                    <SelectTrigger id="resume-select">
                      <SelectValue placeholder="Select a resume (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {resumes.map((resume) => (
                        <SelectItem key={resume.id} value={resume.id}>
                          {getResumeDisplayName(resume)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {noResumesFound && (
                  <p className="text-xs text-muted-foreground mt-1">
                    You can still prepare for the interview without a resume, but adding one will generate more tailored
                    questions.
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              You haven't added any jobs yet. Add a job to prepare for interviews.
            </p>
            <Button className="mt-4" variant="outline" onClick={() => router.push("/dashboard/jobs/new")}>
              Add Your First Job
            </Button>
          </div>
        )}
      </CardContent>
      {jobs && jobs.length > 0 && selectedJobId && (
        <CardFooter>
          <Button className="w-full" onClick={handlePrepare} disabled={isNavigating || loadingResumes}>
            {isNavigating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing...
              </>
            ) : (
              <>
                Prepare for Interview
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
