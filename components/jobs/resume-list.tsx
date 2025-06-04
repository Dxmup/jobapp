"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Trash2, RefreshCw, PenTool, Sparkles, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { getJobResumes, removeResumeFromJob } from "@/app/actions/resume-actions"
import { ImportResumeDialog } from "./import-resume-dialog"

interface ResumeListProps {
  jobId: string
}

export function ResumeList({ jobId }: ResumeListProps) {
  const [resumes, setResumes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  // Load resumes when the component mounts or refreshes
  const loadResumes = async () => {
    try {
      setIsRefreshing(true)
      setError(null)

      console.log("Fetching resumes for job:", jobId)
      const result = await getJobResumes(jobId)
      console.log("Resume fetch result:", result)

      if (!result.success) {
        setError(result.error || "Failed to load resumes")
        return
      }

      setResumes(result.resumes || [])
    } catch (err) {
      console.error("Error loading resumes:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Load resumes when the component mounts
  useEffect(() => {
    loadResumes()
  }, [jobId])

  // Handle removing a resume from the job
  const handleRemoveResume = async (resumeId: string) => {
    try {
      const result = await removeResumeFromJob(resumeId, jobId)

      if (!result.success) {
        toast({
          title: "Remove failed",
          description: result.error || "Failed to remove resume",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Resume removed",
        description: "Resume has been removed from this job",
      })

      // Refresh the resume list
      loadResumes()
    } catch (err) {
      console.error("Error removing resume:", err)
      toast({
        title: "Remove failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {resumes.length} {resumes.length === 1 ? "resume" : "resumes"} associated with this job
        </p>
        <div className="flex gap-2">
          <ImportResumeDialog jobId={jobId} onSuccess={loadResumes} />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/jobs/${jobId}/upload-resume`}>Upload New Resume</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={loadResumes} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading && !isRefreshing ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-red-700">{error}</div>
      ) : resumes.length === 0 ? (
        <div className="rounded-md bg-gray-50 p-8 text-center text-gray-500">
          <FileText className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p className="mb-2 text-sm">No resumes yet</p>
          <p className="text-xs">Import a resume to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Card key={resume.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base truncate">{resume.name}</CardTitle>
                    <CardDescription className="text-xs">Created: {formatDate(resume.created_at)}</CardDescription>
                  </div>
                  {resume.is_ai_generated && (
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                      <Sparkles className="mr-1 h-3 w-3" />
                      AI
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center text-sm">
                  <FileText className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    {resume.is_ai_generated ? "AI-Generated Resume" : "Uploaded Resume"}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex space-x-2">
                  {resume.file_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={resume.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-1 h-3 w-3" />
                        Download
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/resumes/${resume.id}`}>
                      <PenTool className="mr-1 h-3 w-3" />
                      View
                    </Link>
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleRemoveResume(resume.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
