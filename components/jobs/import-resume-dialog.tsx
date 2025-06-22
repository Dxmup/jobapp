"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { FileText, Import, Loader2, RefreshCw } from "lucide-react"

interface ImportResumeDialogProps {
  jobId: string
  onSuccess: () => void
}

export function ImportResumeDialog({ jobId, onSuccess }: ImportResumeDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resumes, setResumes] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState<string | null>(null)
  const { toast } = useToast()

  // Load available resumes when the dialog opens
  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open)

    if (open) {
      await loadAvailableResumes()
    }
  }

  // Load resumes that can be imported (not already associated with this job)
  const loadAvailableResumes = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Use the API endpoint that handles authentication properly
      const response = await fetch(`/api/jobs/${jobId}/available-resumes`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        setError(result.error || "Failed to load resumes")
        return
      }

      // Filter out resumes that are already associated with this job
      const availableResumes = (result.resumes || []).filter((resume: any) => !resume.isForCurrentJob)

      setResumes(availableResumes)
    } catch (err) {
      console.error("Error loading available resumes:", err)
      setError("Failed to load resumes. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Import a resume by associating it with the job
  const handleImportResume = async (resumeId: string) => {
    try {
      setIsImporting(resumeId)

      const response = await fetch(`/api/jobs/${jobId}/associate-resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeId }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        toast({
          title: "Import failed",
          description: result.error || "Failed to import resume",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Resume imported",
        description: "Resume has been associated with this job",
      })

      setIsOpen(false)
      onSuccess()
    } catch (err) {
      console.error("Error importing resume:", err)
      toast({
        title: "Import failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsImporting(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Import className="mr-2 h-4 w-4" />
          Import Resume
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Resume</DialogTitle>
          <DialogDescription>
            Select a resume from your collection to associate with this job application.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Available Resumes</h3>
            <Button variant="ghost" size="sm" onClick={loadAvailableResumes} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-800">
              <p className="text-sm">{error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={loadAvailableResumes}>
                Try Again
              </Button>
            </div>
          ) : resumes.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-md text-center">
              <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 font-medium">No available resumes</p>
              <p className="text-gray-500 text-sm mt-1">
                All your resumes are already associated with this job, or you haven't created any resumes yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {resumes.map((resume) => (
                <div key={resume.id} className="border rounded-md p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3 flex-1">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm truncate">{resume.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">{new Date(resume.createdAt).toLocaleDateString()}</p>
                          {resume.isBaseline && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Baseline</span>
                          )}
                          {resume.isAiGenerated && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                              AI Generated
                            </span>
                          )}
                        </div>
                        {resume.jobTitle && (
                          <p className="text-xs text-gray-400 mt-1">
                            For: {resume.jobTitle} at {resume.company}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleImportResume(resume.id)}
                      disabled={isImporting === resume.id}
                    >
                      {isImporting === resume.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Import"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
