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
import { Loader2, Save, ArrowLeft, Download, Sparkles, Trash2, ExternalLink } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

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

type Job = {
  id: string
  title: string
  company: string
  status?: string
  created_at?: string
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

  // Job association state
  const [associatedJobs, setAssociatedJobs] = useState<Job[]>([])
  const [availableJobs, setAvailableJobs] = useState<Job[]>([])
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string>("")
  const [isAssociatingJob, setIsAssociatingJob] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchResume()
  }, [params.id])

  useEffect(() => {
    if (resume) {
      fetchJobAssociations()
    }
  }, [resume])

  const fetchResume = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/resumes/${params.id}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch resume")
      }

      if (result.success && result.resume) {
        const resume = result.resume
        setResume(resume)
        setName(resume.name)
        setContent(resume.content)
        setJobTitle(resume.job_title || "")
        setCompany(resume.company || "")
      } else {
        throw new Error("Resume not found")
      }
    } catch (error) {
      console.error("Error fetching resume:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch resume")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchJobAssociations = async () => {
    setIsLoadingJobs(true)
    try {
      // Fetch associated jobs
      const associatedResponse = await fetch(`/api/resumes/${params.id}/associated-jobs`)
      const associatedResult = await associatedResponse.json()

      if (associatedResult.success) {
        setAssociatedJobs(associatedResult.jobs || [])
      }

      // Fetch all user jobs for the dropdown
      const allJobsResponse = await fetch("/api/jobs/list-for-user")
      const allJobsResult = await allJobsResponse.json()

      if (allJobsResult.success) {
        const associatedJobIds = new Set((associatedResult.jobs || []).map((job: Job) => job.id))
        const available = (allJobsResult.jobs || []).filter((job: Job) => !associatedJobIds.has(job.id))
        setAvailableJobs(available)
      }
    } catch (error) {
      console.error("Error fetching job associations:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load job associations",
      })
    } finally {
      setIsLoadingJobs(false)
    }
  }

  const handleAssociateJob = async () => {
    if (!selectedJobId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a job to associate",
      })
      return
    }

    setIsAssociatingJob(true)
    try {
      const response = await fetch(`/api/resumes/${params.id}/associate-job`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId: selectedJobId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to associate job")
      }

      toast({
        title: "Success",
        description: "Resume successfully associated with job",
      })

      // Refresh job associations
      fetchJobAssociations()
      setSelectedJobId("")
    } catch (error) {
      console.error("Error associating job:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to associate job",
      })
    } finally {
      setIsAssociatingJob(false)
    }
  }

  const handleDisassociateJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to remove this job association?")) {
      return
    }

    try {
      const response = await fetch(`/api/resumes/${params.id}/disassociate-job`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to remove association")
      }

      toast({
        title: "Success",
        description: "Job association removed successfully",
      })

      // Refresh job associations
      fetchJobAssociations()
    } catch (error) {
      console.error("Error removing job association:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove association",
      })
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
      const response = await fetch(`/api/resumes/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          content,
          jobTitle: jobTitle || null,
          company: company || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update resume")
      }

      toast({
        title: "Success",
        description: "Resume updated successfully",
      })

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

  if (error && !resume) {
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
          Back to Resumes
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
                  AI Generated
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
          <CardDescription>Jobs that are currently using this resume</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingJobs ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : associatedJobs.length > 0 ? (
            <div className="space-y-3">
              {associatedJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{job.title}</p>
                      {job.status && (
                        <Badge variant="outline" className="text-xs">
                          {job.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/jobs/${job.id}`}>
                        <ExternalLink className="mr-1 h-3 w-3" />
                        View
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisassociateJob(job.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>This resume is not associated with any jobs yet.</p>
              <p className="text-sm">Use the section below to apply this resume to your job applications.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apply to Jobs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Apply to Jobs</CardTitle>
          <CardDescription>Associate this resume with your job applications</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingJobs ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : availableJobs.length > 0 ? (
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job to apply this resume to..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableJobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          <div className="flex flex-col items-start">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{job.title}</span>
                              {job.status && (
                                <Badge variant="outline" className="text-xs">
                                  {job.status}
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">{job.company}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAssociateJob} disabled={!selectedJobId || isAssociatingJob}>
                  {isAssociatingJob ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    "Apply Resume"
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                You can apply this resume to multiple jobs. Each association will be tracked separately.
              </p>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No available jobs found.</p>
              <p className="text-sm">
                {associatedJobs.length > 0
                  ? "This resume is already applied to all your jobs."
                  : "Create a job first to apply this resume."}
              </p>
              <Button variant="outline" className="mt-3" asChild>
                <Link href="/dashboard/jobs/new">Create New Job</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
