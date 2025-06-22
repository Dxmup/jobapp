import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JobDetails } from "@/components/jobs/job-details"
import { JobTimeline } from "@/components/jobs/job-timeline"
import { ResumeList } from "@/components/jobs/resume-list"
import { CoverLetterList } from "@/components/jobs/cover-letter-list"
import Link from "next/link"
import { Calendar, Sparkles } from "lucide-react"
import { getJobById } from "@/lib/jobs"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, FileText } from "lucide-react"

export default async function JobPage({ params }: { params: { id: string } }) {
  const jobId = params.id

  // Try to get the job using the standard method
  let job = await getJobById(jobId)

  // If job not found, try a direct database query
  if (!job) {
    try {
      const supabase = createServerSupabaseClient()
      const { data } = await supabase.from("jobs").select("*").eq("id", jobId).single()

      if (data) {
        job = {
          id: data.id,
          userId: data.user_id,
          title: data.title,
          company: data.company,
          location: data.location,
          description: data.description,
          status: data.status,
          url: data.url,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          appliedAt: data.applied_at,
        }
      }
    } catch (error) {
      console.error("Error fetching job directly:", error)
    }
  }

  if (!job) {
    return notFound()
  }

  // Get user ID from cookie as fallback
  const cookieStore = cookies()
  const userId = cookieStore.get("user_id")?.value

  // Only check ownership if we have a userId from cookie
  if (userId && job.userId !== userId) {
    console.log(`Job ownership mismatch: Job belongs to ${job.userId}, but current user is ${userId}`)
    // Don't return notFound() here, just log the mismatch
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
          <p className="text-muted-foreground">
            {job.company} • {job.location || "No location specified"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={`/jobs/${jobId}/edit`}>Edit Job</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/jobs/${jobId}/add-event`}>
              <Calendar className="mr-2 h-4 w-4" />
              Add Event
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="resumes">Resumes</TabsTrigger>
          <TabsTrigger value="cover-letters">Cover Letters</TabsTrigger>
          <TabsTrigger value="interview-prep">Interview Prep</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-4">
          <JobDetails job={job} />
        </TabsContent>
        <TabsContent value="timeline" className="space-y-4">
          <JobTimeline jobId={jobId} />
        </TabsContent>
        <TabsContent value="resumes" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Resumes</h2>
            <Button asChild>
              <Link href={`/jobs/${jobId}/customize-resume`}>
                <Sparkles className="mr-2 h-4 w-4" />
                Customize Resume
              </Link>
            </Button>
          </div>
          <Suspense fallback={<div>Loading resumes...</div>}>
            <ResumeList jobId={jobId} />
          </Suspense>
        </TabsContent>
        <TabsContent value="cover-letters" className="space-y-4">
          <CoverLetterList jobId={jobId} />
        </TabsContent>
        <TabsContent value="interview-prep" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Interview Preparation</h2>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Practice for your interview</CardTitle>
              <CardDescription>
                Prepare for your interview with AI-powered mock interviews and practice questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium">Mock Phone Interview</h3>
                  <p className="text-sm text-muted-foreground">
                    Practice with our AI interviewer in a realistic phone interview simulation
                  </p>
                  <Button asChild className="mt-2">
                    <Link href={`/dashboard/interview-prep?jobId=${jobId}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Go to Interview Prep
                    </Link>
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium">Interview Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    Review job-specific interview questions and prepare your answers
                  </p>
                  <Button asChild variant="outline" className="mt-2">
                    <Link href={`/dashboard/interview-prep?jobId=${jobId}`}>
                      <FileText className="mr-2 h-4 w-4" />
                      View Interview Prep
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
