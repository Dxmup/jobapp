"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, ArrowLeft, Download, Sparkles } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

type Resume = {
  id: string
  name: string
  file_name: string
  file_url: string | null
  content: string
  is_ai_generated: boolean
  created_at: string
  updated_at: string
  job_title: string | null
  company: string | null
  job_id: string | null
  user_id: string | null
}

export default function ResumeDetailPage({ params }: { params: { id: string } }) {
  const [resume, setResume] = useState<Resume | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [company, setCompany] = useState("")
  const [associatedJobs, setAssociatedJobs] = useState<Array<{ id: string; title: string; company: string }>>([])
  const [availableJobs, setAvailableJobs] = useState<Array<{ id: string; title: string; company: string }>>([])
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])
  const [isApplyingToJobs, setIsApplyingToJobs] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchResume()
  }, [params.id])

  useEffect(() => {
    if (resume) {
      fetchAssociatedJobs()
    }
  }, [resume])

  const fetchResume = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get the current user
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        throw new Error("You must be logged in to view this resume")
      }

      // Fetch the resume
      const { data, error } = await supabase.from("resumes").select("*").eq("id", params.id).single()

      if (error) {
        throw new Error("Failed to fetch resume: " + error.message)
      }

      if (!data) {
        throw new Error("Resume not found")
      }

      setResume(data)
      setName(data.name)
      setContent(data.content)
      setJobTitle(data.job_title || "")
      setCompany(data.company || "")
    } catch (error) {
      console.error("Error fetching resume:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch resume")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAssociatedJobs = async () => {
    if (!resume) return

    setIsLoadingJobs(true)
    try {
      // If this resume is already associated with a job, fetch that job
      if (resume.job_id) {
        const { data, error } = await supabase
          .from("jobs")
          .select("id, title, company")
          .eq("id", resume.job_id)
          .single()

        if (!error && data) {
          setAssociatedJobs([data])
        }
      } else {
        // Otherwise, check if this resume is associated with any jobs through the job_resumes table
        const { data, error } = await supabase.from("job_resumes").select("job_id").eq("resume_id", resume.id)

        if (!error && data) {
          const jobIds = data.map((item) => item.job_id)

          if (jobIds.length > 0) {
            const { data: jobsData, error: jobsError } = await supabase
              .from("jobs")
              .select("id, title, company")
              .in("id", jobIds)

            if (!jobsError && jobsData) {
              setAssociatedJobs(jobsData)
            }
          }
        }
      }

      // Fetch available jobs (jobs that this resume is not associated with)
      const { data: allJobs, error: allJobsError } = await supabase
        .from("jobs")
        .select("id, title, company")
        .order("created_at", { ascending: false })

      if (!allJobsError && allJobs) {
        const associatedJobIds = new Set(associatedJobs.map((job) => job.id))
        const availableJobsList = allJobs.filter((job) => !associatedJobIds.has(job.id))
        setAvailableJobs(availableJobsList)
      }
    } catch (error) {
      console.error("Error fetching associated jobs:", error)
    } finally {
      setIsLoadingJobs(false)
    }
  }

  const applyToJobs = async () => {
    if (!resume || selectedJobs.length === 0) return

    setIsApplyingToJobs(true)
    try {
      // Get the current user
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        throw new Error("You must be logged in to apply to jobs")
      }

      // First, check if the job_resumes table has a user_id column
      const { data: tableInfo, error: tableInfoError } = await supabase.from("job_resumes").select("*").limit(1)

      // Create entries in the job_resumes table
      // If the table has a user_id column, include it, otherwise omit it
      const jobResumesData = selectedJobs.map((jobId) => {
        const baseData = {
          job_id: jobId,
          resume_id: resume.id,
          created_at: new Date().toISOString(),
        }

        // Only add user_id if the column exists
        if (tableInfo && tableInfo.length > 0 && "user_id" in tableInfo[0]) {
          return {
            ...baseData,
            user_id: session.user.id,
          }
        }

        return baseData
      })

      const { error } = await supabase.from("job_resumes").insert(jobResumesData)

      if (error) throw error

      // Refresh the associated jobs
      fetchAssociatedJobs()
      setSelectedJobs([])
    } catch (error) {
      console.error("Error applying to jobs:", error)
      setError(error instanceof Error ? error.message : "Failed to apply to selected jobs")
    } finally {
      setIsApplyingToJobs(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !content) {
      setError("Please provide both a name and content for your resume")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const { error } = await supabase
        .from("resumes")
        .update({
          name,
          content,
          job_title: jobTitle || null,
          company: company || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)

      if (error) {
        throw new Error("Failed to update resume: " + error.message)
      }

      // Refresh the resume data
      fetchResume()
    } catch (error) {
      console.error("Error updating resume:", error)
      setError(error instanceof Error ? error.message : "Failed to update resume")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">{error}</div>
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="space-y-2">
              <h3 className="font-medium">Resume not found</h3>
              <p className="text-sm text-muted-foreground">
                The resume you're looking for doesn't exist or you don't have permission to view it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/dashboard/resumes")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Resumes
        </Button>
        {resume.file_url && (
          <Button variant="outline" asChild>
            <a href={resume.file_url} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Download Original
            </a>
          </Button>
        )}
      </div>

      <Card>
        <form onSubmit={handleSave}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Edit Resume</CardTitle>
              {resume.is_ai_generated && (
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI
                </Badge>
              )}
            </div>
            <CardDescription>Update your resume details below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resume-name">Resume Name</Label>
              <Input id="resume-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job-title">Job Title (Optional)</Label>
                <Input
                  id="job-title"
                  placeholder="e.g., Software Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company (Optional)</Label>
                <Input
                  id="company"
                  placeholder="e.g., Acme Inc."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume-content">Resume Content</Label>
              <Textarea
                id="resume-content"
                className="min-h-[400px] font-mono"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            {error && <div className="text-sm text-destructive">{error}</div>}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Associated Jobs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Associated Jobs</CardTitle>
          <CardDescription>Jobs that are using this resume</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingJobs ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : associatedJobs.length > 0 ? (
            <div className="space-y-2">
              {associatedJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/jobs/${job.id}`)}>
                    View Job
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              This resume is not associated with any jobs yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apply to Multiple Jobs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Apply to Jobs</CardTitle>
          <CardDescription>Use this resume for multiple job applications</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingJobs ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : availableJobs.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                {availableJobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="flex items-center gap-2 border rounded-md p-3">
                    <input
                      type="checkbox"
                      id={`job-${job.id}`}
                      checked={selectedJobs.includes(job.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedJobs([...selectedJobs, job.id])
                        } else {
                          setSelectedJobs(selectedJobs.filter((id) => id !== job.id))
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <label htmlFor={`job-${job.id}`} className="flex-1 cursor-pointer">
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                    </label>
                  </div>
                ))}
              </div>
              <Button onClick={applyToJobs} disabled={selectedJobs.length === 0 || isApplyingToJobs} className="w-full">
                {isApplyingToJobs ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>Apply Resume to Selected Jobs</>
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No available jobs found. Create a job first to apply this resume.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
