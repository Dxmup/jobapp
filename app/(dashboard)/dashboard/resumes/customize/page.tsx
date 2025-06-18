"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, FileText, Loader2, Sparkles, AlertCircle } from "lucide-react"
import Link from "next/link"
import { customizeResumeWithAI, reviseResumeWithAI } from "@/app/actions/ai-actions"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Job {
  id: string
  title: string
  company: string
  description?: string
}

interface Resume {
  id: string
  name: string
  content: string
}

export default function CustomizeResumePage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRevising, setIsRevising] = useState(false)
  const [baselineResume, setBaselineResume] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [baseResume, setBaseResume] = useState<Resume | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  // Form state
  const [resumeName, setResumeName] = useState("Customized Resume")
  const [customInstructions, setCustomInstructions] = useState("")
  const [resumeContent, setResumeContent] = useState("")
  const [selectedJobId, setSelectedJobId] = useState("")
  const [versionName, setVersionName] = useState("AI Customized")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Get resumeId from URL params
  const resumeId = searchParams.get("resumeId")

  useEffect(() => {
    if (resumeId) {
      fetchResumeContent(resumeId)
    }
    fetchJobs()
  }, [resumeId])

  useEffect(() => {
    if (selectedJobId) {
      fetchJobDetails(selectedJobId)
    }
  }, [selectedJobId])

  // Fetch the base resume content
  const fetchResumeContent = async (resumeId: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch resume content")
      }

      const data = await response.json()

      if (data.success && data.resume) {
        setBaseResume(data.resume)
        setBaselineResume(data.resume.content)
        setResumeName(`${data.resume.name} (Job-Specific)`)
      } else {
        throw new Error(data.error || "Failed to fetch resume content")
      }
    } catch (error) {
      console.error("Error fetching resume content:", error)
      setError("Failed to load resume content")
      toast({
        title: "Error",
        description: "Failed to load resume content",
        variant: "destructive",
      })
    }
  }

  // Fetch available jobs
  const fetchJobs = async () => {
    setIsLoadingJobs(true)
    try {
      const response = await fetch("/api/jobs")
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || data || [])
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setIsLoadingJobs(false)
    }
  }

  // Fetch job details when a job is selected
  const fetchJobDetails = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch job details")
      }

      const data = await response.json()

      if (data.job) {
        setSelectedJob(data.job)
        setJobDescription(data.job.description || "")
        setResumeName(`${baseResume?.name || "Resume"} for ${data.job.title} at ${data.job.company}`)
      }
    } catch (error) {
      console.error("Error fetching job details:", error)
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive",
      })
    }
  }

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!resumeName || resumeName.length < 3) {
      errors.resumeName = "Resume name must be at least 3 characters."
    }

    if (!versionName) {
      errors.versionName = "Version name is required."
    }

    if (!resumeContent || resumeContent.length < 50) {
      errors.resumeContent = "Resume content must be at least 50 characters."
    }

    if (!selectedJobId) {
      errors.selectedJobId = "Please select a job to customize for."
    }

    if (!resumeId) {
      errors.baseResume = "No base resume selected."
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleCustomize() {
    if (!resumeId) {
      toast({
        title: "No base resume",
        description: "Please select a resume to customize.",
        variant: "destructive",
      })
      return
    }

    if (!baselineResume) {
      toast({
        title: "No resume content",
        description: "The selected resume has no content to customize.",
        variant: "destructive",
      })
      return
    }

    if (!selectedJobId) {
      toast({
        title: "No job selected",
        description: "Please select a job to customize the resume for.",
        variant: "destructive",
      })
      return
    }

    if (!jobDescription) {
      toast({
        title: "No job description",
        description: "The selected job has no description. Please add a job description first.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const result = await customizeResumeWithAI({
        baselineResume,
        jobDescription,
        customInstructions,
      })

      if (result.success && result.customizedResume) {
        setResumeContent(result.customizedResume)

        toast({
          title: "Resume customized!",
          description: "Your AI-customized resume is ready to review.",
        })
      } else {
        throw new Error(result.error || "Failed to customize resume")
      }
    } catch (error) {
      console.error("Error customizing resume:", error)
      toast({
        title: "Customization failed",
        description:
          error instanceof Error ? error.message : "There was a problem customizing your resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleRevise() {
    setIsRevising(true)

    try {
      if (!customInstructions || customInstructions.trim() === "") {
        throw new Error("Please provide custom instructions for revision.")
      }

      if (!resumeContent || resumeContent.trim() === "") {
        throw new Error("No resume content to revise. Please customize first.")
      }

      const result = await reviseResumeWithAI({
        currentResume: resumeContent,
        jobDescription,
        customInstructions,
      })

      if (result.success && result.revisedResume) {
        setResumeContent(result.revisedResume)

        toast({
          title: "Resume revised!",
          description: "Your AI-revised resume is ready to review.",
        })
      } else {
        throw new Error(result.error || "Failed to revise resume")
      }
    } catch (error) {
      console.error("Error revising resume:", error)
      toast({
        title: "Revision failed",
        description:
          error instanceof Error ? error.message : "There was a problem revising your resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRevising(false)
    }
  }

  async function handleSubmit() {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      })
      return
    }

    try {
      // Create a new resume with the job ID and parent resume ID
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: resumeName,
          content: resumeContent,
          jobId: selectedJobId,
          parentResumeId: resumeId,
          isAiGenerated: true,
          versionName: versionName,
          fileName: `${resumeName.replace(/\s+/g, "-").toLowerCase()}.txt`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save resume")
      }

      toast({
        title: "Resume saved!",
        description: "Your customized resume has been saved successfully.",
      })

      router.push("/dashboard/resumes")
    } catch (error) {
      console.error("Error saving resume:", error)
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save resume",
        variant: "destructive",
      })
    }
  }

  if (!resumeId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/resumes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Customize Resume</h1>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Resume Selected</AlertTitle>
          <AlertDescription>Please select a resume to customize from the resumes page.</AlertDescription>
        </Alert>

        <Button asChild>
          <Link href="/dashboard/resumes">Go to Resumes</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/resumes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Customize Resume for Job Application</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Resume Customization
            </CardTitle>
            <CardDescription>Customize your resume for a specific job application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="jobSelect">Select Job</Label>
                <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job to customize for..." />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingJobs ? (
                      <SelectItem value="loading" disabled>
                        Loading jobs...
                      </SelectItem>
                    ) : (
                      jobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{job.title}</span>
                            <span className="text-sm text-muted-foreground">{job.company}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {formErrors.selectedJobId && <p className="text-sm text-red-500">{formErrors.selectedJobId}</p>}
                <p className="text-sm text-muted-foreground">Select the job you want to customize this resume for</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resumeName">Resume Name</Label>
                <Input id="resumeName" value={resumeName} onChange={(e) => setResumeName(e.target.value)} />
                {formErrors.resumeName && <p className="text-sm text-red-500">{formErrors.resumeName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="versionName">Version Name</Label>
                <Input
                  id="versionName"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  placeholder="e.g., AI Customized, First Draft, etc."
                />
                {formErrors.versionName && <p className="text-sm text-red-500">{formErrors.versionName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customInstructions">Custom Instructions (Optional)</Label>
                <Textarea
                  id="customInstructions"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Add specific instructions for customizing your resume..."
                  className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground">
                  Provide specific instructions for the AI, such as "Highlight my project management skills" or "Focus
                  on my experience with React"
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleCustomize}
                  disabled={isGenerating || !baselineResume || !selectedJobId}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Customizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Customize Resume
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleRevise} disabled={isRevising || !resumeContent}>
                  {isRevising ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Revising...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Revise with AI
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-500" />
              Resume Preview
            </CardTitle>
            <CardDescription>Review and edit your customized resume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="resumeContent">Resume Content</Label>
              <Textarea
                id="resumeContent"
                value={resumeContent}
                onChange={(e) => setResumeContent(e.target.value)}
                placeholder="Your customized resume will appear here..."
                className="min-h-[400px] font-mono text-sm"
              />
              {formErrors.resumeContent && <p className="text-sm text-red-500">{formErrors.resumeContent}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/resumes")}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={!resumeContent}>
              Save Resume
            </Button>
          </CardFooter>
        </Card>
      </div>

      {selectedJob && (
        <div className="space-y-4 bg-muted/40 p-4 rounded-lg border">
          <h2 className="text-lg font-medium">
            Job Description: {selectedJob.title} at {selectedJob.company}
          </h2>
          <div className="whitespace-pre-wrap text-sm">{jobDescription}</div>
        </div>
      )}
    </div>
  )
}
