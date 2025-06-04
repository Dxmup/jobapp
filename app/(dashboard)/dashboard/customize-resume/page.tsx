"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Sparkles } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"
import { Label } from "@/components/ui/label"

type Job = {
  id: string
  title: string
  company: string
  description: string
  status: string
  created_at: string
  updated_at: string
  user_id: string
  location?: string
  url?: string
  notes?: string
  salary_min?: number
  salary_max?: number
  contact_name?: string
  contact_email?: string
  contact_phone?: string
}

type Resume = {
  id: string
  name: string
  content: string
  is_ai_generated: boolean
  created_at: string
  updated_at: string
  job_title: string | null
  company: string | null
}

export default function CustomizeResumePage() {
  const router = useRouter()
  const { toast } = useToast()

  // State for data
  const [jobs, setJobs] = useState<Job[]>([])
  const [resumes, setResumes] = useState<Resume[]>([])
  const [isLoadingJobs, setIsLoadingJobs] = useState(true)
  const [isLoadingResumes, setIsLoadingResumes] = useState(true)

  // Form state
  const [selectedResumeId, setSelectedResumeId] = useState<string>("")
  const [selectedJobId, setSelectedJobId] = useState<string>("")
  const [customInstructions, setCustomInstructions] = useState<string>("")
  const [newResumeName, setNewResumeName] = useState<string>("Customized Resume")

  // Selected objects
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null)

  // Generation state
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for resumeId in query parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const resumeId = params.get("resumeId")

      if (resumeId) {
        setSelectedResumeId(resumeId)
      }
    }
  }, [])

  // Fetch data on component mount
  useEffect(() => {
    fetchJobs()
    fetchResumes()
  }, [])

  // Update selected objects when IDs change
  useEffect(() => {
    if (selectedResumeId) {
      const resume = resumes.find((r) => r.id === selectedResumeId)
      if (resume) {
        setSelectedResume(resume)
        // Update resume name if we don't have a job selected yet
        if (!selectedJobId) {
          setNewResumeName(`${resume.name} - Customized`)
        }
      }
    }
  }, [selectedResumeId, resumes, selectedJobId])

  useEffect(() => {
    if (selectedJobId) {
      const job = jobs.find((j) => j.id === selectedJobId)
      if (job) {
        setSelectedJob(job)
        // Update resume name if we have both job and resume
        if (selectedResume) {
          setNewResumeName(`${selectedResume.name} - ${job.title} at ${job.company}`)
        }
      }
    }
  }, [selectedJobId, jobs, selectedResume])

  const fetchJobs = async () => {
    setIsLoadingJobs(true)
    try {
      const response = await fetch("/api/jobs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Check if data is an array, otherwise look for a jobs property
        if (Array.isArray(data)) {
          setJobs(data)
        } else if (data && typeof data === "object" && Array.isArray(data.jobs)) {
          setJobs(data.jobs)
        } else {
          console.error("Unexpected jobs data format:", data)
          setJobs([])
          toast({
            title: "Error!",
            description: "Received invalid jobs data format.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Error!",
          description: "Failed to fetch jobs.",
          variant: "destructive",
        })
        setJobs([])
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast({
        title: "Error!",
        description: "Something went wrong.",
        variant: "destructive",
      })
      setJobs([])
    } finally {
      setIsLoadingJobs(false)
    }
  }

  const fetchResumes = async () => {
    setIsLoadingResumes(true)
    try {
      // Get the current user
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        throw new Error("You must be logged in to view resumes")
      }

      // Get the user ID from our users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", session.user.id)
        .single()

      if (userError || !userData) {
        throw new Error("Failed to get user information")
      }

      // Fetch resumes for this user
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", userData.id)
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error("Failed to fetch resumes: " + error.message)
      }

      setResumes(data || [])

      // Check if we have a resumeId in the URL and set it as selected
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search)
        const resumeId = params.get("resumeId")
        if (resumeId) {
          const selectedResume = data?.find((resume) => resume.id === resumeId)
          if (selectedResume) {
            setSelectedResume(selectedResume)
            setNewResumeName(`${selectedResume.name} - Customized`)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching resumes:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch resumes")
    } finally {
      setIsLoadingResumes(false)
    }
  }

  const handleGenerateAndSaveResume = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedResume || !selectedJob) {
      toast({
        title: "Error!",
        description: "Please select both a resume and a job.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Step 1: Generate the customized resume
      toast({
        title: "Processing",
        description: "Generating your customized resume...",
      })

      const response = await fetch("/api/ai/customize-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeContent: selectedResume.content,
          jobDescription: selectedJob.description,
          customInstructions: customInstructions || "",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate customized resume")
      }

      const data = await response.json()
      const generatedContent = data.customizedResume

      if (!generatedContent) {
        throw new Error("No content was generated")
      }

      // Step 2: Save the generated resume
      toast({
        title: "Processing",
        description: "Saving your customized resume...",
      })

      // Get the current user
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        throw new Error("You must be logged in to create a resume")
      }

      // Get the user ID from our users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", session.user.id)
        .single()

      if (userError || !userData) {
        throw new Error("Failed to get user information")
      }

      // Insert the new resume
      const { data: resumeData, error: resumeError } = await supabase
        .from("resumes")
        .insert({
          user_id: userData.id,
          name: newResumeName,
          file_name: "ai-generated.txt",
          content: generatedContent,
          is_ai_generated: true,
          job_title: selectedJob.title,
          company: selectedJob.company,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (resumeError) {
        throw new Error("Failed to save resume: " + resumeError.message)
      }

      // Store the new resume ID in localStorage to highlight it on the resumes page
      if (resumeData && resumeData[0] && resumeData[0].id) {
        localStorage.setItem("newResumeId", resumeData[0].id)
        localStorage.setItem("newResumeName", newResumeName)
      }

      toast({
        title: "Success!",
        description: "Resume has been customized and saved successfully.",
      })

      // Redirect to the resumes page
      router.push("/dashboard/resumes")
    } catch (error) {
      console.error("Error processing resume:", error)
      setError(error instanceof Error ? error.message : "Failed to process resume")
      toast({
        title: "Error!",
        description: error instanceof Error ? error.message : "Failed to process resume",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/dashboard/resumes")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Resumes
        </Button>
      </div>

      <h1 className="text-3xl font-bold tracking-tight">Customize Resume</h1>
      <p className="text-muted-foreground">Tailor your resume for a specific job using our AI assistant.</p>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Select Resume and Job</CardTitle>
          <CardDescription>Choose a resume to customize and a job to tailor it for.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerateAndSaveResume} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="resume-select">Resume</Label>
                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                  <SelectTrigger id="resume-select">
                    <SelectValue placeholder="Select a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingResumes ? (
                      <SelectItem value="loading" disabled>
                        <Skeleton className="h-9 w-full" />
                      </SelectItem>
                    ) : !Array.isArray(resumes) || resumes.length === 0 ? (
                      <SelectItem value="no-resumes" disabled>
                        No resumes available
                      </SelectItem>
                    ) : (
                      resumes.map((resume) => (
                        <SelectItem key={resume.id} value={resume.id}>
                          {resume.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Choose the resume you want to customize.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-select">Job</Label>
                <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                  <SelectTrigger id="job-select">
                    <SelectValue placeholder="Select a job" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingJobs ? (
                      <SelectItem value="loading" disabled>
                        <Skeleton className="h-9 w-full" />
                      </SelectItem>
                    ) : !Array.isArray(jobs) || jobs.length === 0 ? (
                      <SelectItem value="no-jobs" disabled>
                        No jobs available
                      </SelectItem>
                    ) : (
                      jobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title} at {job.company}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Choose the job you're applying for.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-instructions">Custom Instructions (Optional)</Label>
              <Textarea
                id="custom-instructions"
                placeholder="E.g., Highlight my project management skills, focus on leadership experience..."
                className="min-h-[100px]"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Provide any specific instructions for customizing your resume.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume-name">New Resume Name</Label>
              <Input id="resume-name" value={newResumeName} onChange={(e) => setNewResumeName(e.target.value)} />
              <p className="text-sm text-muted-foreground">Name for your customized resume.</p>
            </div>

            <Button
              type="submit"
              disabled={isProcessing || !selectedResumeId || !selectedJobId || newResumeName.length < 2}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate & Save Customized Resume
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {selectedJob && (
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              {selectedJob.title} at {selectedJob.company}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{selectedJob.description}</p>
              </div>
              {selectedJob.location && (
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p className="text-sm text-muted-foreground">{selectedJob.location}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
