"use client"

import type React from "react"

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
import { Briefcase, LinkIcon, Loader2, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AssociateJobDialogProps {
  resumeId: string
  onSuccess: () => void
  trigger?: React.ReactNode
}

export function AssociateJobDialog({ resumeId, onSuccess, trigger }: AssociateJobDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [jobs, setJobs] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isAssociating, setIsAssociating] = useState<string | null>(null)
  const { toast } = useToast()

  // Load available jobs when the dialog opens
  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open)

    if (open) {
      await loadAvailableJobs()
    }
  }

  // Load jobs that can be associated with this resume
  const loadAvailableJobs = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/resumes/${resumeId}/available-jobs`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        setError(result.error || "Failed to load jobs")
        return
      }

      setJobs(result.jobs || [])
    } catch (err) {
      console.error("Error loading available jobs:", err)
      setError("Failed to load jobs. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Associate the resume with a job
  const handleAssociateJob = async (jobId: string) => {
    try {
      setIsAssociating(jobId)

      const response = await fetch(`/api/resumes/${resumeId}/associate-job`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        toast({
          title: "Association failed",
          description: result.error || "Failed to associate with job",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Resume associated",
        description: "Resume has been associated with the job",
      })

      setIsOpen(false)
      onSuccess()
    } catch (err) {
      console.error("Error associating with job:", err)
      toast({
        title: "Association failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsAssociating(null)
    }
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <LinkIcon className="mr-2 h-4 w-4" />
      Associate with Job
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Associate with Job</DialogTitle>
          <DialogDescription>
            Select a job to associate this resume with. This helps organize your applications.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Available Jobs</h3>
            <Button variant="ghost" size="sm" onClick={loadAvailableJobs} disabled={isLoading}>
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
              <Button variant="outline" size="sm" className="mt-2" onClick={loadAvailableJobs}>
                Try Again
              </Button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-md text-center">
              <Briefcase className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 font-medium">No available jobs</p>
              <p className="text-gray-500 text-sm mt-1">
                All your jobs are already associated with this resume, or you haven't created any jobs yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {jobs.map((job) => (
                <div key={job.id} className="border rounded-md p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3 flex-1">
                      <Briefcase className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm truncate">{job.title}</h4>
                        <p className="text-sm text-gray-600 truncate">{job.company}</p>
                        {job.location && <p className="text-xs text-gray-500 truncate">{job.location}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</p>
                          <Badge variant="outline" className="text-xs">
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleAssociateJob(job.id)} disabled={isAssociating === job.id}>
                      {isAssociating === job.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Associate"}
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
