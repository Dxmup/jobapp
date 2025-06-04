"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Trash2, RefreshCw, PenTool, Plus, Sparkles, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { getJobCoverLetters, deleteCoverLetter } from "@/app/actions/cover-letter-actions"

interface CoverLetterListProps {
  jobId: string
}

export function CoverLetterList({ jobId }: CoverLetterListProps) {
  const [coverLetters, setCoverLetters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const fetchCoverLetters = async () => {
    try {
      setIsRefreshing(true)
      setError(null)

      const result = await getJobCoverLetters(jobId)

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch cover letters")
      }

      setCoverLetters(result.coverLetters || [])
    } catch (err) {
      console.error("Error fetching cover letters:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch cover letters")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCoverLetters()
  }, [jobId])

  const handleDeleteCoverLetter = async (coverLetterId: string) => {
    try {
      const result = await deleteCoverLetter(coverLetterId)

      if (!result.success) {
        throw new Error(result.error || "Failed to delete cover letter")
      }

      toast({
        title: "Cover letter deleted",
        description: "The cover letter has been deleted successfully.",
      })

      // Refresh the list
      fetchCoverLetters()
    } catch (err) {
      console.error("Error deleting cover letter:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete cover letter",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Cover Letters</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={fetchCoverLetters} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" asChild>
            <Link href={`/jobs/${jobId}/generate-cover-letter`}>
              <Plus className="h-4 w-4 mr-2" />
              Generate New
            </Link>
          </Button>
        </div>
      </div>

      {isLoading && !isRefreshing ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-red-700">
          <p className="font-medium">Error loading cover letters</p>
          <p className="text-sm mt-1">{error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={fetchCoverLetters}>
            Try Again
          </Button>
        </div>
      ) : coverLetters.length === 0 ? (
        <div className="rounded-md bg-gray-50 p-8 text-center text-gray-500">
          <FileText className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p className="mb-2 text-sm">No cover letters yet</p>
          <p className="text-xs mb-4">Generate a cover letter to get started</p>
          <Button asChild>
            <Link href={`/jobs/${jobId}/generate-cover-letter`}>
              <Plus className="h-4 w-4 mr-2" />
              Generate Cover Letter
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coverLetters.map((coverLetter) => (
            <Card key={coverLetter.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base truncate">{coverLetter.name}</CardTitle>
                    <CardDescription className="text-xs">Created: {formatDate(coverLetter.created_at)}</CardDescription>
                  </div>
                  {coverLetter.is_ai_generated && (
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                      <Sparkles className="mr-1 h-3 w-3" />
                      AI
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm line-clamp-3 text-gray-600 dark:text-gray-300">
                  {coverLetter.content.substring(0, 150)}...
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/cover-letters/${coverLetter.id}`}>
                      <PenTool className="mr-1 h-3 w-3" />
                      View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-1 h-3 w-3" />
                    Download
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                  onClick={() => handleDeleteCoverLetter(coverLetter.id)}
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
