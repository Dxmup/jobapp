"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getUserJobs } from "@/app/actions/interview-prep-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Headphones, FileText } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { StreamlinedJobSelector } from "@/components/interview-prep/streamlined-job-selector"
import { Suspense } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function InterviewPrepPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobSelectorRef = useRef<HTMLDivElement>(null)
  const [selectedJobId, setSelectedJobId] = useState<string>("")
  const [selectedResumeId, setSelectedResumeId] = useState<string>("")
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [interviewType, setInterviewType] = useState<"phone-screener" | "first-interview">("first-interview")

  // Load jobs on mount
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobsResult = await getUserJobs()
        if (jobsResult.success) {
          setJobs(jobsResult.jobs)

          // Auto-select job from URL parameter
          const jobIdFromUrl = searchParams.get("jobId")
          if (jobIdFromUrl && jobsResult.jobs.some((job) => job.id === jobIdFromUrl)) {
            setSelectedJobId(jobIdFromUrl)
          }
        }
      } catch (error) {
        console.error("Failed to load jobs:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadJobs()
  }, [searchParams])

  // Handle mock interview button click
  const handleMockInterviewClick = () => {
    if (!selectedJobId) {
      // Scroll to job selector and highlight it
      jobSelectorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })

      // Add a subtle shake animation to draw attention
      jobSelectorRef.current?.classList.add("animate-pulse")
      setTimeout(() => {
        jobSelectorRef.current?.classList.remove("animate-pulse")
      }, 2000)

      return
    }

    // Navigate directly to mock interview
    const mockInterviewUrl = `/dashboard/interview-prep/${selectedJobId}/mock-interview?interviewType=${interviewType}${selectedResumeId ? `&resumeId=${selectedResumeId}` : ""}`

    router.push(mockInterviewUrl)
  }

  // Handle text questions button click
  const handleTextQuestionsClick = () => {
    if (!selectedJobId) {
      handleMockInterviewClick() // Same scroll behavior
      return
    }

    const textQuestionsUrl = `/dashboard/interview-prep/${selectedJobId}?interviewType=${interviewType}${selectedResumeId ? `&resumeId=${selectedResumeId}` : ""}`

    router.push(textQuestionsUrl)
  }

  // Get selected job details for display
  const selectedJob = jobs.find((job) => job.id === selectedJobId)

  // Dynamic button text and state
  const getMockInterviewButtonText = () => {
    if (!selectedJobId) return "Select Job to Start Mock Interview"
    if (selectedJob) return `Start Mock Interview for ${selectedJob.title}`
    return "Start Mock Phone Interview"
  }

  const getTextQuestionsButtonText = () => {
    if (!selectedJobId) return "Select Job to View Questions"
    if (selectedJob) return `View Questions for ${selectedJob.title}`
    return "View Suggested Questions"
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Interview Preparation</h1>
        <p className="text-muted-foreground mt-2">
          Practice with AI-powered mock interviews or review job-specific questions.
        </p>
      </div>

      {/* Streamlined Mock Interview Section */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-800">🎙️ AI Mock Phone Interviews</CardTitle>
          <CardDescription className="text-purple-700">
            Practice with our AI interviewer for realistic interview experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Headphones className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Realistic Experience</p>
                  <p className="text-sm text-muted-foreground">AI interviewer with natural conversation</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Phone className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Job-Specific Questions</p>
                  <p className="text-sm text-muted-foreground">Tailored to your job and resume</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {selectedJob && (
                <div className="bg-white/50 p-3 rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-purple-800">Selected Job:</p>
                  <p className="text-purple-700">
                    {selectedJob.title} at {selectedJob.company}
                  </p>
                </div>
              )}

              {/* New: Interview Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="interview-type" className="text-purple-800 font-medium">
                  Interview Type
                </Label>
                <RadioGroup
                  id="interview-type"
                  value={interviewType}
                  onValueChange={(value: "phone-screener" | "first-interview") => setInterviewType(value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone-screener" id="phone-screener" />
                    <Label htmlFor="phone-screener">Phone Screener (15 min)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="first-interview" id="first-interview" />
                    <Label htmlFor="first-interview">First Interview (30 min)</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                onClick={handleMockInterviewClick}
                size="lg"
                className={`w-full ${selectedJobId ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-400 hover:bg-gray-500"}`}
                disabled={!selectedJobId && jobs.length === 0}
              >
                <Phone className="mr-2 h-4 w-4" />
                {getMockInterviewButtonText()}
              </Button>

              <Button
                onClick={handleTextQuestionsClick}
                variant="outline"
                size="lg"
                className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                disabled={!selectedJobId && jobs.length === 0}
              >
                <FileText className="mr-2 h-4 w-4" />
                {getTextQuestionsButtonText()}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Selection Section */}
      <div ref={jobSelectorRef} className="space-y-4 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Select Your Job</h2>
            <p className="text-sm text-muted-foreground">
              Choose a job and resume to customize your interview preparation
            </p>
          </div>
          {!selectedJobId && (
            <Badge variant="outline" className="animate-pulse border-purple-300 text-purple-700">
              Required for Interview
            </Badge>
          )}
        </div>

        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <StreamlinedJobSelector
            jobs={jobs}
            selectedJobId={selectedJobId}
            selectedResumeId={selectedResumeId}
            onJobChange={setSelectedJobId}
            onResumeChange={setSelectedResumeId}
            isLoading={isLoading}
          />
        </Suspense>
      </div>
    </div>
  )
}
