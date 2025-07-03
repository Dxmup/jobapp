import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: {
    id: string
  }
}

async function getJob(id: string) {
  const supabase = createServerSupabaseClient()

  const { data: job, error } = await supabase.from("jobs").select("*").eq("id", id).single()

  if (error || !job) {
    return null
  }

  return job
}

export default async function UploadResumePage({ params }: PageProps) {
  const job = await getJob(params.id)

  if (!job) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href={`/jobs/${params.id}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Job
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Upload Resume</h1>
        <p className="text-gray-600 mt-2">
          Upload a resume for {job.title} at {job.company}
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload New Resume
            </CardTitle>
            <CardDescription>Upload a PDF or Word document to associate with this job application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Drop your resume here</h3>
              <p className="text-gray-500 mb-4">or click to browse files</p>
              <Button>Choose File</Button>
              <p className="text-sm text-gray-400 mt-2">Supports PDF, DOC, and DOCX files up to 10MB</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Ensure your resume is up-to-date and relevant to this position</li>
              <li>• Use a clear, professional format</li>
              <li>• Include relevant keywords from the job description</li>
              <li>• Keep file size under 10MB for best performance</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
