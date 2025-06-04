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
import { getUserResumes, associateResumeWithJob } from "@/app/actions/resume-actions"

interface ImportResumeDialogProps {
  jobId: string
  onSuccess: () => void
}

export function ImportResumeDialog({ jobId, onSuccess }: ImportResumeDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resumes, setResumes] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Load resumes when the dialog opens
  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open)

    if (open) {
      await loadResumes()
    }
  }

  // Load resumes from the server
  const loadResumes = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await getUserResumes()

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
    }
  }

  // Import a resume
  const handleImportResume = async (resumeId: string) => {
    try {
      const result = await associateResumeWithJob(resumeId, jobId)

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Resume</DialogTitle>
          <DialogDescription>Select a resume to associate with this job application.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Your Resumes</h3>
            <Button variant="ghost" size="sm" onClick={loadResumes} disabled={isLoading}>
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
            </div>
          ) : resumes.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-md text-center">
              <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 font-medium">No resumes found</p>
              <p className="text-gray-500 text-sm mt-1">Upload a resume first before importing.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {resumes.map((resume) => (
                <div key={resume.id} className="border rounded-md p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">{resume.name}</h4>
                        <p className="text-xs text-gray-500">{new Date(resume.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleImportResume(resume.id)}>
                      Import
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
