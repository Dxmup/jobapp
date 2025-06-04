import { Suspense } from "react"
import Link from "next/link"
import { getUserJobs } from "@/app/actions/interview-prep-actions"
import { JobSelector } from "@/components/interview-prep/job-selector"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Headphones } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default async function InterviewPrepPage() {
  // Get all jobs for the user
  const jobsResult = await getUserJobs()
  const jobs = jobsResult.success ? jobsResult.jobs : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Interview Preparation</h1>
        <p className="text-muted-foreground mt-2">
          Prepare for your interviews with job-specific questions and general interview tips.
        </p>
      </div>

      {/* New Mock Interview Feature Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-800">New! Mock Phone Interviews</CardTitle>
          <CardDescription className="text-purple-700">
            Practice with our AI interviewer based on your job description and resume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-100 p-2 rounded-full">
              <Headphones className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">Realistic Interview Experience</p>
              <p className="text-sm text-muted-foreground">Practice answering questions in real-time</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-2 rounded-full">
              <Phone className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">Job-Specific Questions</p>
              <p className="text-sm text-muted-foreground">Tailored to your resume and the job description</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/dashboard/interview-prep/mock-interview" className="w-full">
            <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-700">
              <Phone className="mr-2 h-4 w-4" />
              Try Mock Phone Interview
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <div className="space-y-4 w-full">
        <h2 className="text-xl font-semibold">Job-Specific Preparation</h2>
        <p className="text-sm text-muted-foreground">
          Select a job to get customized interview questions based on the job description and your resume.
        </p>

        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <JobSelector jobs={jobs} />
        </Suspense>
      </div>
    </div>
  )
}
