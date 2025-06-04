"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Sparkles, RefreshCw, Upload, FileText, AlertCircle, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { saveCoverLetterAction } from "@/app/actions/save-cover-letter-action"

interface NewCoverLetterFormProps {
  onSuccess?: () => void
}

export function NewCoverLetterForm({ onSuccess }: NewCoverLetterFormProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedJobId, setSelectedJobId] = useState("")
  const [selectedResumeId, setSelectedResumeId] = useState("")
  const [availableJobs, setAvailableJobs] = useState<
    Array<{ id: string; title: string; company: string; description?: string }>
  >([])
  const [availableResumes, setAvailableResumes] = useState<Array<{ id: string; name: string; content?: string }>>([])
  const [isLoadingJobs, setIsLoadingJobs] = useState(true)
  const [isLoadingResumes, setIsLoadingResumes] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("manual")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedJob, setSelectedJob] = useState<{ title: string; company: string; description?: string } | null>(null)
  const [selectedResume, setSelectedResume] = useState<{ name: string; content?: string } | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState("")
  const [extractedResumeText, setExtractedResumeText] = useState("")
  const [resumeError, setResumeError] = useState("")
  const [autoSave, setAutoSave] = useState(true)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // AI generation options
  const [tone, setTone] = useState("professional")
  const [length, setLength] = useState("medium")
  const [includePersonalExperience, setIncludePersonalExperience] = useState(true)
  const [creativityLevel, setCreativityLevel] = useState([50])

  const router = useRouter()
  const { toast } = useToast()

  // Fetch jobs and resumes on component mount
  useEffect(() => {
    fetchJobs()
    fetchResumes()
  }, [])

  const fetchJobs = async () => {
    setIsLoadingJobs(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setResumeError("User not authenticated")
        return
      }

      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, company, description")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching jobs:", error)
        setResumeError("Failed to load jobs")
        return
      }

      if (data) {
        setAvailableJobs(data)
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
      setResumeError("Failed to load jobs")
    } finally {
      setIsLoadingJobs(false)
    }
  }

  const fetchResumes = async () => {
    setIsLoadingResumes(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setResumeError("User not authenticated")
        return
      }

      // First try to get resumes from the API endpoint
      try {
        const response = await fetch("/api/resumes/list")
        if (response.ok) {
          const data = await response.json()
          if (data && Array.isArray(data)) {
            setAvailableResumes(data)
            setIsLoadingResumes(false)
            return
          }
        }
      } catch (error) {
        console.error("Error fetching resumes from API:", error)
      }

      // Fallback to direct Supabase query
      // Use the correct column names: 'name' instead of 'title'
      const { data, error } = await supabase
        .from("resumes")
        .select("id, name, content")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching resumes:", error)
        setResumeError("Failed to load resumes")
        return
      }

      if (data) {
        setAvailableResumes(data)
      }
    } catch (error) {
      console.error("Error fetching resumes:", error)
      setResumeError("Failed to load resumes")
    } finally {
      setIsLoadingResumes(false)
    }
  }

  // Update selected job details when job ID changes
  useEffect(() => {
    if (selectedJobId && selectedJobId !== "none") {
      const job = availableJobs.find((job) => job.id === selectedJobId)
      if (job) {
        setSelectedJob(job)
        // Auto-generate title if empty
        if (!title) {
          setTitle(`Cover Letter for ${job.title} at ${job.company}`)
        }
      }
    } else {
      setSelectedJob(null)
    }
  }, [selectedJobId, availableJobs, title])

  // Update selected resume details when resume ID changes
  useEffect(() => {
    if (selectedResumeId && selectedResumeId !== "none") {
      const resume = availableResumes.find((resume) => resume.id === selectedResumeId)
      if (resume) {
        setSelectedResume(resume)
        // Clear any uploaded resume text since we're using a selected resume
        setExtractedResumeText("")
      }
    } else {
      setSelectedResume(null)
    }
  }, [selectedResumeId, availableResumes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveCoverLetter()
  }

  const saveCoverLetter = async () => {
    if (!title || !content) {
      toast({
        title: "Missing information",
        description: "Please provide a title and content for your cover letter.",
        variant: "destructive",
      })
      return false
    }

    if (!selectedJobId || selectedJobId === "none") {
      toast({
        title: "No job selected",
        description: "Please select a job for this cover letter.",
        variant: "destructive",
      })
      return false
    }

    setIsSubmitting(true)
    setIsSaving(true)

    try {
      // Call the server action to save the cover letter
      const result = await saveCoverLetterAction({
        jobId: selectedJobId,
        name: title,
        content: content,
      })

      if (!result.success) {
        throw new Error(result.error || "Failed to save cover letter")
      }

      // Set localStorage for highlighting the new cover letter
      if (result.coverLetterId) {
        localStorage.setItem("highlightCoverLetter", result.coverLetterId)
        localStorage.setItem("scrollToCoverLetter", "true")
      }

      toast({
        title: "Cover letter created",
        description: "Your cover letter has been created successfully.",
      })

      // Call the success callback if provided
      if (onSuccess) {
        onSuccess()
      }

      // Navigate to the cover letters page
      router.push("/dashboard/cover-letters")

      return true
    } catch (error) {
      console.error("Error creating cover letter:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create cover letter",
        variant: "destructive",
      })
      return false
    } finally {
      setIsSubmitting(false)
      setIsSaving(false)
    }
  }

  const generateCoverLetter = async () => {
    if (!selectedJob) {
      toast({
        title: "No job selected",
        description: "Please select a job to generate a cover letter.",
        variant: "destructive",
      })
      return
    }

    // Check if we have either a selected resume or uploaded resume text
    if (!selectedResume?.content && !extractedResumeText) {
      toast({
        title: "No resume selected",
        description: "Please select or upload a resume to generate a cover letter.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // In a real implementation, this would call an AI service with both job and resume data
      const resumeContent = selectedResume?.content || extractedResumeText || "No resume content available"

      // Simulate AI generation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate content based on job and resume
      const generatedContent = `Dear Hiring Manager,

I am writing to express my interest in the ${selectedJob.title} position at ${selectedJob.company}. ${
        resumeContent.includes("experience")
          ? "With my background in software development and passion for creating user-friendly applications, I believe I would be a valuable addition to your team."
          : "I am excited about the opportunity to bring my skills to your team."
      }

${
  selectedJob.description
    ? `I was particularly excited to see that you're looking for someone with experience in ${
        selectedJob.description.includes("React") ? "React" : "software development"
      }. ${
        resumeContent.includes("React") || resumeContent.includes("react")
          ? "In my previous role, I successfully delivered several projects using React and Next.js."
          : "In my previous role, I successfully delivered several projects using modern web technologies."
      }`
    : ""
}

${
  includePersonalExperience
    ? `Throughout my career, I have consistently demonstrated strong problem-solving abilities and a commitment to delivering high-quality work. I thrive in collaborative environments and enjoy tackling complex challenges.`
    : ""
}

I am excited about the opportunity to bring my skills to ${selectedJob.company} and contribute to your team's success. Thank you for considering my application.

Sincerely,
[Your Name]`

      setContent(generatedContent)

      toast({
        title: "Cover letter generated",
        description: "Your cover letter has been generated successfully.",
      })

      // Auto-save if enabled
      if (autoSave) {
        // Small delay to allow the user to see the generation success message
        setTimeout(async () => {
          const saveSuccess = await saveCoverLetter()
          if (!saveSuccess) {
            toast({
              title: "Auto-save disabled",
              description: "Please review your cover letter and save manually.",
            })
          }
        }, 1000)
      }
    } catch (error) {
      console.error("Error generating cover letter:", error)
      toast({
        title: "Generation failed",
        description: "Failed to generate cover letter. Please try again or write manually.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOC, DOCX, or TXT file.",
        variant: "destructive",
      })
      return
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadedFileName(file.name)
    setUploadProgress(0)
    // Clear selected resume when uploading a new one
    setSelectedResumeId("")
    setSelectedResume(null)

    try {
      // Create form data for upload
      const formData = new FormData()
      formData.append("file", file)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Actually upload the file and extract text
      const response = await fetch("/api/extract-document-text", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to extract text from document")
      }

      const data = await response.json()

      if (data.text) {
        setExtractedResumeText(data.text)
        toast({
          title: "Resume uploaded",
          description: "Your resume has been uploaded and text extracted successfully.",
        })
      } else {
        throw new Error("No text extracted from document")
      }
    } catch (error) {
      console.error("Error uploading resume:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {resumeError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{resumeError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Cover Letter Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Application for Software Engineer at Acme Inc."
          required
        />
      </div>

      {/* Job selection - always visible regardless of tab */}
      <div className="space-y-2">
        <Label htmlFor="job">Select Job *</Label>
        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
          <SelectTrigger id="job" disabled={isLoadingJobs || availableJobs.length === 0}>
            <SelectValue placeholder={isLoadingJobs ? "Loading jobs..." : "Select a job"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {availableJobs.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title} at {job.company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isLoadingJobs && <p className="text-sm text-muted-foreground">Loading jobs...</p>}
        {availableJobs.length === 0 && !isLoadingJobs && (
          <p className="text-sm text-muted-foreground">No jobs found. Please create a job first.</p>
        )}
      </div>

      {/* Resume selection - always visible regardless of tab */}
      <div className="space-y-2">
        <Label htmlFor="resume">Select Resume</Label>
        <div className="flex gap-2">
          <Select value={selectedResumeId} onValueChange={setSelectedResumeId} className="flex-1">
            <SelectTrigger id="resume" disabled={isLoadingResumes}>
              <SelectValue placeholder={isLoadingResumes ? "Loading resumes..." : "Select a resume"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {availableResumes.map((resume) => (
                <SelectItem key={resume.id} value={resume.id}>
                  {resume.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" onClick={triggerFileUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
          />
        </div>
        {isLoadingResumes && <p className="text-sm text-muted-foreground">Loading resumes...</p>}
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">{uploadedFileName}</span>
            <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {extractedResumeText && !selectedResumeId && (
        <div className="space-y-2 p-3 border rounded-md bg-muted/30">
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Uploaded Resume</span>
          </div>
          <p className="text-xs text-muted-foreground">{extractedResumeText.substring(0, 150)}...</p>
        </div>
      )}

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Write Manually</TabsTrigger>
          <TabsTrigger value="ai" disabled={!selectedJobId || selectedJobId === "none"}>
            Generate with AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Cover Letter Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-[250px]"
              placeholder="Enter your cover letter content here..."
              required
            />
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <RadioGroup value={tone} onValueChange={setTone} className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="professional" id="professional" />
                      <Label htmlFor="professional">Professional</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="friendly" id="friendly" />
                      <Label htmlFor="friendly">Friendly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="enthusiastic" id="enthusiastic" />
                      <Label htmlFor="enthusiastic">Enthusiastic</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Length</Label>
                  <RadioGroup value={length} onValueChange={setLength} className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="short" id="short" />
                      <Label htmlFor="short">Short</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="long" id="long" />
                      <Label htmlFor="long">Long</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="creativity">Creativity Level</Label>
                    <span className="text-sm text-muted-foreground">{creativityLevel[0]}%</span>
                  </div>
                  <Slider
                    id="creativity"
                    min={0}
                    max={100}
                    step={10}
                    value={creativityLevel}
                    onValueChange={setCreativityLevel}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="personal-experience"
                      checked={includePersonalExperience}
                      onCheckedChange={setIncludePersonalExperience}
                    />
                    <Label htmlFor="personal-experience">Include personal experience</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="auto-save" checked={autoSave} onCheckedChange={setAutoSave} />
                    <Label htmlFor="auto-save">Auto-save when generated</Label>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={generateCoverLetter}
                  disabled={
                    isGenerating ||
                    isSaving ||
                    !selectedJobId ||
                    selectedJobId === "none" ||
                    (!selectedResumeId && !extractedResumeText)
                  }
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Cover Letter
                    </>
                  )}
                </Button>

                {!selectedResumeId && !extractedResumeText && (
                  <p className="text-sm text-amber-500 flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Please select or upload a resume for better AI generation
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="ai-content">Generated Content</Label>
              <div className="flex gap-2">
                {content && (
                  <Button variant="outline" size="sm" onClick={generateCoverLetter} disabled={isGenerating || isSaving}>
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Regenerate
                  </Button>
                )}
                {content && !autoSave && (
                  <Button variant="outline" size="sm" onClick={saveCoverLetter} disabled={isSubmitting || isSaving}>
                    <Save className="mr-2 h-3 w-3" />
                    Save
                  </Button>
                )}
              </div>
            </div>
            <Textarea
              id="ai-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-[250px]"
              placeholder="AI-generated content will appear here..."
              required
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || isSaving || !content || !selectedJobId || selectedJobId === "none"}
        >
          {isSubmitting || isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Create Cover Letter"
          )}
        </Button>
      </div>
    </form>
  )
}
