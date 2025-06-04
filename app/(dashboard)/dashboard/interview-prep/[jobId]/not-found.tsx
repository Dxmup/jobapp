import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileQuestion } from "lucide-react"

export default function InterviewPrepNotFound() {
  return (
    <div className="container mx-auto py-12 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-muted p-3 rounded-full">
              <FileQuestion className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center">Job Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            The job you're looking for doesn't exist or you don't have permission to view it.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/dashboard/interview-prep">Return to Interview Prep</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
