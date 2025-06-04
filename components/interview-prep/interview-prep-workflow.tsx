"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase, ArrowRight, FileText, Loader2, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getJobResumes, generateInterviewQuestions, saveInterviewQuestions } from "@/app/actions/interview-prep-actions"

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

type Questions = {
  technical: string[]
  behavioral: string[]
}

interface InterviewPrepWorkflowProps {
  jobs: Job[]
  resumes: Resume[]
}

export function InterviewPrepWorkflow({ jobs, resumes: initialResumes }: InterviewPrepWorkflowProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedJobId, setSelectedJobId] = useState<string>("")
  const [selectedResumeId, setSelectedResumeId] = useState<string>("")
  const [jobResumes, setJobResumes] = useState<Resume[]>([])
  const [loadingResumes, setLoadingResumes] = useState<boolean>(false)
  const [noResumesFound, setNoResumesFound] = useState<boolean>(false)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [questions, setQuestions] = useState<Questions>({ technical: [], behavioral: [] })
  const [showQuestions, setShowQuestions] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [refreshCount, setRefreshCount] = useState(0)
  const [forceNewQuestions, setForceNewQuestions] = useState(true)

  // Fetch resumes when a job is selected
  useEffect(() => {
    if (selectedJobId) {
      setLoadingResumes(true)
      setNoResumesFound(false)
      setSelectedResumeId("")
      setShowQuestions(false)
      setQuestions({ technical: [], behavioral: [] })
      setForceNewQuestions(true)

      getJobResumes(selectedJobId)
        .then((result) => {
          if (result.success && result.resumes) {
            setJobResumes(result.resumes)
            setNoResumesFound(result.resumes.length === 0)

            // Auto-select the first resume if available
            if (result.resumes.length === 1) {
              setSelectedResumeId(result.resumes[0].id)
            }
          } else {
            setJobResumes([])
            setNoResumesFound(true)
          }
        })
        .catch((error) => {
          console.error("Error fetching resumes:", error)
          setJobResumes([])
          setNoResumesFound(true)
        })
        .finally(() => {
          setLoadingResumes(false)
        })
    } else {
      setJobResumes([])
      setSelectedResumeId("")
      setNoResumesFound(false)
      setShowQuestions(false)
      setQuestions({ technical: [], behavioral: [] })
      setForceNewQuestions(true)
    }
  }, [selectedJobId])

  // Function to generate interview questions
  const handleGenerateQuestions = async () => {
    if (!selectedJobId) return

    setIsGenerating(true)
    setError(null)
    setSaveError(null)

    try {
      // Always generate fresh questions for the initial request
      console.log("Generating fresh questions from Gemini API")
      const result = await generateInterviewQuestions(selectedJobId, selectedResumeId || undefined)

      if (result.success && result.questions) {
        setQuestions(result.questions)
        setShowQuestions(true)
        setRefreshCount(0)

        // Save questions to storage
        const saveResult = await saveInterviewQuestions(selectedJobId, result.questions, selectedResumeId || undefined)

        if (!saveResult.success) {
          setSaveError(saveResult.error || "Failed to save questions")
        }

        toast({
          title: "Questions generated",
          description: "Interview questions have been generated based on the job description and resume.",
          duration: 3000,
        })
      } else {
        setError(result.error || "Failed to generate questions")
        toast({
          title: "Error",
          description: result.error || "Failed to generate questions",
          variant: "destructive",
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Function to refresh questions
  const handleRefreshQuestions = async () => {
    if (!selectedJobId) return

    setIsGenerating(true)
    setError(null)
    setSaveError(null)

    try {
      // Pass the current questions to avoid repetition
      const result = await generateInterviewQuestions(selectedJobId, selectedResumeId || undefined, questions)

      if (result.success && result.questions) {
        setQuestions(result.questions)
        setRefreshCount((prev) => prev + 1)

        // Save questions to storage
        const saveResult = await saveInterviewQuestions(selectedJobId, result.questions, selectedResumeId || undefined)

        if (!saveResult.success) {
          setSaveError(saveResult.error || "Failed to save questions")
        }

        toast({
          title: "Questions refreshed",
          description:
            refreshCount > 0
              ? "New, more probing questions have been generated."
              : "New interview questions have been generated.",
          duration: 3000,
        })
      } else {
        setError(result.error || "Failed to generate questions")
        toast({
          title: "Error",
          description: result.error || "Failed to generate questions",
          variant: "destructive",
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

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

  const hasQuestions = questions.technical.length > 0 || questions.behavioral.length > 0

  return (
    <div className="space-y-6">
      {/* Job and Resume Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select a Job</CardTitle>
          <CardDescription>Choose a job to prepare for an interview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {jobs.length > 0 ? (
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
                        {jobResumes.map((resume) => (
                          <SelectItem key={resume.id} value={resume.id}>
                            {getResumeDisplayName(resume)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {noResumesFound && (
                    <p className="text-xs text-muted-foreground mt-1">
                      You can still prepare for the interview without a resume, but adding one will generate more
                      tailored questions.
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
        {jobs.length > 0 && selectedJobId && (
          <CardFooter>
            <Button className="w-full" onClick={handleGenerateQuestions} disabled={isGenerating || loadingResumes}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Questions...
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

      {/* Questions Display */}
      {showQuestions && (
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Interview Questions</CardTitle>
                <CardDescription>Practice these questions to prepare for your interview</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshQuestions}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    {refreshCount > 0 ? "Get More Questions" : "Refresh Questions"}
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {saveError && (
              <Alert variant="warning" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>{saveError}</AlertDescription>
              </Alert>
            )}

            {error ? (
              <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">
                <p className="font-medium">Error: {error}</p>
                <p className="mt-2">Please try refreshing the questions or come back later.</p>
              </div>
            ) : (
              <Tabs defaultValue="technical" className="w-full">
                <TabsList className="mb-4 grid w-full grid-cols-2">
                  <TabsTrigger value="technical">Technical Questions ({questions.technical.length})</TabsTrigger>
                  <TabsTrigger value="behavioral">Behavioral Questions ({questions.behavioral.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="technical" className="space-y-4">
                  <ol className="list-decimal pl-5 space-y-3">
                    {questions.technical.map((question, index) => (
                      <li key={index} className="p-3 border rounded-md bg-card">
                        <p className="font-medium">
                          {index + 1}. {question}
                        </p>
                      </li>
                    ))}
                  </ol>
                </TabsContent>
                <TabsContent value="behavioral" className="space-y-4">
                  <ol className="list-decimal pl-5 space-y-3">
                    {questions.behavioral.map((question, index) => (
                      <li key={index} className="p-3 border rounded-md bg-card">
                        <p className="font-medium">
                          {index + 1}. {question}
                        </p>
                      </li>
                    ))}
                  </ol>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
          <CardFooter className="border-t pt-6">
            <p className="text-sm text-muted-foreground">
              {refreshCount > 0
                ? "These questions are designed to be more probing and in-depth. Click 'Get More Questions' for additional variations."
                : "These questions are generated based on the job description and your resume. You can refresh them to get new variations."}
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
