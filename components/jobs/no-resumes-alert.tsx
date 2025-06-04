import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileText, Plus } from "lucide-react"
import Link from "next/link"

interface NoResumesAlertProps {
  jobId: string
}

export function NoResumesAlert({ jobId }: NoResumesAlertProps) {
  return (
    <Alert className="bg-amber-50 border-amber-200">
      <FileText className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">No Resumes Available</AlertTitle>
      <AlertDescription className="text-amber-700">
        <p className="mb-3">
          You need to associate at least one resume with this job before you can generate a cover letter.
        </p>
        <Button asChild variant="outline" className="border-amber-300 bg-amber-100 hover:bg-amber-200">
          <Link href={`/jobs/${jobId}`}>
            <Plus className="h-4 w-4 mr-2" />
            Add Resume to Job
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}
