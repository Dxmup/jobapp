"use client"

import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface Resume {
  id: string
  name: string
  job_id: string | null
  user_id: string
  created_at: string
}

interface ResumeSelectorProps {
  jobId?: string
  onSelect: (resumeId: string) => void
  selectedResumeId?: string
}

export function ResumeSelector({ jobId, onSelect, selectedResumeId }: ResumeSelectorProps) {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchResumes() {
      try {
        setLoading(true)

        // Use the ultra-simple endpoint
        const response = await fetch("/api/resumes/list")

        if (!response.ok) {
          throw new Error("Failed to fetch resumes")
        }

        const data = await response.json()

        if (data.success) {
          console.log("Resumes loaded:", data.resumes)
          setResumes(data.resumes || [])

          // Auto-select the first resume if none is selected
          if (!selectedResumeId && data.resumes && data.resumes.length > 0) {
            onSelect(data.resumes[0].id)
          }
        } else {
          throw new Error(data.error || "Failed to fetch resumes")
        }
      } catch (error) {
        console.error("Error fetching resumes:", error)
        setError(error instanceof Error ? error.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchResumes()
  }, [onSelect, selectedResumeId])

  // Group resumes for the dropdown
  const baselineResumes = resumes.filter((resume) => resume.job_id === null)
  const currentJobResumes = jobId ? resumes.filter((resume) => resume.job_id === jobId) : []
  const otherJobResumes = resumes.filter((resume) => resume.job_id !== null && resume.job_id !== jobId)

  return (
    <Select value={selectedResumeId} onValueChange={onSelect}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a resume" />
      </SelectTrigger>
      <SelectContent>
        {loading ? (
          <div className="flex items-center justify-center p-2">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span>Loading resumes...</span>
          </div>
        ) : resumes.length === 0 ? (
          <div className="p-2 text-center text-sm text-muted-foreground">
            No resumes found. Please create a resume first.
          </div>
        ) : (
          <>
            {baselineResumes.length > 0 && (
              <SelectGroup>
                <SelectLabel>Baseline Resumes</SelectLabel>
                {baselineResumes.map((resume) => (
                  <SelectItem key={resume.id} value={resume.id}>
                    {resume.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}

            {currentJobResumes.length > 0 && (
              <SelectGroup>
                <SelectLabel>Resumes for This Job</SelectLabel>
                {currentJobResumes.map((resume) => (
                  <SelectItem key={resume.id} value={resume.id}>
                    {resume.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}

            {otherJobResumes.length > 0 && (
              <SelectGroup>
                <SelectLabel>Resumes for Other Jobs</SelectLabel>
                {otherJobResumes.map((resume) => (
                  <SelectItem key={resume.id} value={resume.id}>
                    {resume.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </>
        )}
      </SelectContent>
    </Select>
  )
}
