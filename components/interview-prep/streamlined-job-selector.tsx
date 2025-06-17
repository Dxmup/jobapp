"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Briefcase, FileText, CheckCircle, Plus } from "lucide-react"
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

interface StreamlinedJobSelectorProps {
  jobs: Job[]
  selectedJobId: string
  selectedResumeId: string
  onJobChange: (jobId: string) => void
  onResumeChange: (resumeId: string) => void
  isLoading: boolean
}

export function StreamlinedJobSelector({
  jobs,
  selectedJobId,
  selectedResumeId,
  onJobChange,
  onResumeChange,
  isLoading,
}: StreamlinedJobSelectorProps) {
  const router = useRouter()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loadingResumes, setLoadingResumes] = useState<boolean>(false)
  const [noResumesFound, setNoResumesFound] = useState<boolean>(false)

  // Fetch resumes when a job is selected
  useEffect(() => {
    if (selectedJobId) {
      setLoadingResumes(true)
      setNoResumesFound(false)
      onResumeChange("")

      getJobResumes(selectedJobId)
        .then((result) => {
          if (result.success && result.resumes) {
            setResumes(result.resumes)
            setNoResumesFound(result.resumes.length === 0)

            // Auto-select the first resume if available
            if (result.resumes.length === 1) {
              onResumeChange(result.resumes[0].id)
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
      onResumeChange("")
      setNoResumesFound(false)
    }
  }, [selectedJobId, onResumeChange])

  // Helper function to get resume display name
  const getResumeDisplayName = (resume: Resume) => {
    if (resume.name && resume.name.trim() !== "") {
      return resume.name
    }

    if (resume.file_name && resume.file_name.trim() !== "") {
      return resume.file_name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ")
    }

    if (resume.created_at) {
      const date = new Date(resume.created_at)
      return `Resume (${date.toLocaleDateString()})`
    }

    return "Untitled Resume"
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!jobs || jobs.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-200">
        <CardContent className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Jobs Added Yet</h3>
          <p className="text-muted-foreground mb-6">
            Add a job to start practicing interviews with AI-powered mock sessions.
          </p>
          <Button onClick={() => router.push("/dashboard/jobs/new")} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Job
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={selectedJobId ? "border-green-200 bg-green-50/30" : ""}>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Job Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label htmlFor="job-select" className="text-sm font-medium">
                Job Position
              </label>
              {selectedJobId && <CheckCircle className="h-4 w-4 text-green-600" />}
            </div>
            <Select value={selectedJobId} onValueChange={onJobChange}>
              <SelectTrigger id="job-select" className={selectedJobId ? "border-green-300" : ""}>
                <SelectValue placeholder="Select a job position" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>
                        {job.title} at {job.company}
                      </span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {job.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resume Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label htmlFor="resume-select" className="text-sm font-medium">
                Resume (Optional)
              </label>
              {selectedResumeId && <CheckCircle className="h-4 w-4 text-green-600" />}
            </div>
            {!selectedJobId ? (
              <div className="h-10 bg-gray-100 rounded-md flex items-center justify-center text-sm text-muted-foreground">
                Select a job first
              </div>
            ) : loadingResumes ? (
              <Skeleton className="h-10 w-full" />
            ) : noResumesFound ? (
              <div className="text-sm text-amber-600 flex items-center gap-2 p-3 bg-amber-50 rounded-md border border-amber-200">
                <FileText className="h-4 w-4" />
                <span>No resumes found. Interview will use job description only.</span>
              </div>
            ) : (
              <Select value={selectedResumeId} onValueChange={onResumeChange}>
                <SelectTrigger id="resume-select" className={selectedResumeId ? "border-green-300" : ""}>
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
          </div>
        </div>

        {/* Selection Summary */}
        {selectedJobId && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Ready for Interview Preparation</span>
            </div>
            <div className="text-sm text-green-700">
              <p>
                <strong>Job:</strong> {jobs.find((j) => j.id === selectedJobId)?.title} at{" "}
                {jobs.find((j) => j.id === selectedJobId)?.company}
              </p>
              {selectedResumeId && (
                <p>
                  <strong>Resume:</strong> {getResumeDisplayName(resumes.find((r) => r.id === selectedResumeId)!)}
                </p>
              )}
              {!selectedResumeId && (
                <p>
                  <strong>Resume:</strong> None selected (will use job description only)
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
