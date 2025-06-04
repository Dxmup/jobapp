"use client"

import { useState } from "react"
import { Plus, Briefcase, FileText, FileEdit, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NewJobForm } from "@/components/jobs/new-job-form"
import { NewResumeForm } from "@/components/resumes/new-resume-form"
import { NewCoverLetterForm } from "@/components/cover-letters/new-cover-letter-form"

export function QuickActionsMenu() {
  const [open, setOpen] = useState(false)
  const [activeDialog, setActiveDialog] = useState<"job" | "resume" | "coverLetter" | null>(null)

  const handleAction = (action: "job" | "resume" | "coverLetter") => {
    setOpen(false)
    setActiveDialog(action)
  }

  const closeDialog = () => {
    setActiveDialog(null)
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button size="lg" className="h-14 w-14 rounded-full shadow-lg" aria-label="Quick actions">
              {open ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => handleAction("job")}>
              <Briefcase className="mr-2 h-4 w-4" />
              <span>Add a Job to Track</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("resume")}>
              <FileText className="mr-2 h-4 w-4" />
              <span>New Resume</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("coverLetter")}>
              <FileEdit className="mr-2 h-4 w-4" />
              <span>New Cover Letter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Job Dialog */}
      <Dialog open={activeDialog === "job"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add a Job to Track</DialogTitle>
            <DialogDescription>Enter the details of the job you're interested in</DialogDescription>
          </DialogHeader>
          <NewJobForm onSuccess={closeDialog} />
        </DialogContent>
      </Dialog>

      {/* Resume Dialog */}
      <Dialog open={activeDialog === "resume"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>New Resume</DialogTitle>
            <DialogDescription>Create a new resume or upload an existing one</DialogDescription>
          </DialogHeader>
          <NewResumeForm onSuccess={closeDialog} />
        </DialogContent>
      </Dialog>

      {/* Cover Letter Dialog */}
      <Dialog open={activeDialog === "coverLetter"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>New Cover Letter</DialogTitle>
            <DialogDescription>Create a new cover letter for your job application</DialogDescription>
          </DialogHeader>
          <NewCoverLetterForm onSuccess={closeDialog} />
        </DialogContent>
      </Dialog>
    </>
  )
}
