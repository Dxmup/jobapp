import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileX } from "lucide-react"

export default function CoverLetterNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="rounded-full bg-muted p-6 mb-4">
        <FileX className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Cover Letter Not Found</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        The cover letter you're looking for doesn't exist or you don't have permission to view it.
      </p>
      <Button asChild>
        <Link href="/dashboard/cover-letters">Back to Cover Letters</Link>
      </Button>
    </div>
  )
}
