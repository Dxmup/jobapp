"use client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function MockInterviewPage() {
  const router = useRouter()

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/interview-prep">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Interview Prep
          </Button>
        </Link>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="h-5 w-5" />
            Select a Job First
          </CardTitle>
          <CardDescription className="text-amber-700">
            To start a mock phone interview, you need to select a specific job first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            The mock interview feature creates personalized questions based on the job description and your resume.
          </p>
          <Link href="/dashboard/interview-prep">
            <Button>Select a Job to Interview For</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
