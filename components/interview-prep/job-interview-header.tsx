import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Job = {
  id: string
  title: string
  company: string
  status?: string
  description?: string | null
}

type Resume = {
  id: string
  title: string
  created_at?: string
  content?: string | null
}

export function JobInterviewHeader({ job, resume }: { job: Job; resume?: Resume | null }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/interview-prep">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Interview Preparation</h1>
      </div>

      <div className="bg-card border rounded-lg p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">{job.title}</h2>
          <p className="text-muted-foreground">{job.company}</p>
          {job.status && (
            <Badge variant="outline" className="mt-1">
              {job.status}
            </Badge>
          )}
        </div>

        {resume && (
          <div className="pt-2 border-t">
            <h3 className="text-sm font-medium">Selected Resume</h3>
            <p className="text-sm text-muted-foreground">{resume.title || "Untitled Resume"}</p>
          </div>
        )}

        {job.description && (
          <div className="pt-2 border-t">
            <h3 className="text-sm font-medium">Job Description</h3>
            <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}
