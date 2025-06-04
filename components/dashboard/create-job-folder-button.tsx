"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus } from "lucide-react"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createZodForm, safeFormSubmit } from "@/lib/form-utils"
import { storeItem } from "@/lib/animation-utils"

const formSchema = z.object({
  jobTitle: z.string().min(3, { message: "Job title must be at least 3 characters." }),
  company: z.string().min(1, { message: "Company name is required." }),
  location: z.string().optional(),
  jobDescription: z.string().min(10, { message: "Job description must be at least 10 characters." }),
  jobUrl: z.string().url().optional().or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

export function CreateJobFolderButton({ variant = "default", className = "" }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  const form = useForm<FormValues>(
    createZodForm(formSchema, {
      jobTitle: "",
      company: "",
      location: "",
      jobDescription: "",
      jobUrl: "",
    }),
  )

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)

    try {
      // Actually create the job in the database
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.jobTitle,
          company: data.company,
          location: data.location,
          description: data.jobDescription,
          url: data.jobUrl,
          status: "saved", // Default status
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create job")
      }

      const responseData = await response.json()

      // Store the new job ID in localStorage for highlighting
      // Add a unique timestamp to force detection of changes
      const timestamp = Date.now().toString()
      storeItem("newJobId", responseData.job.id)
      storeItem("newJobTitle", data.jobTitle)
      storeItem("newJobTimestamp", timestamp)

      // Also store in sessionStorage as a backup mechanism
      sessionStorage.setItem("newJobId", responseData.job.id)
      sessionStorage.setItem("newJobTimestamp", timestamp)

      toast({
        title: "Success!",
        description: "Job application folder created successfully.",
      })

      setIsOpen(false)
      form.reset()

      // Check if we're already on the jobs page
      const isOnJobsPage = pathname === "/dashboard/jobs"

      if (isOnJobsPage) {
        // If we're already on the jobs page, use a more aggressive refresh approach
        // First refresh the router
        router.refresh()

        // Then force a page reload after a short delay if needed
        // This is a fallback in case the router.refresh() doesn't trigger a re-render
        setTimeout(() => {
          // Dispatch a custom event that the jobs page can listen for
          const refreshEvent = new CustomEvent("jobCreated", {
            detail: {
              jobId: responseData.job.id,
              timestamp: timestamp,
            },
          })
          window.dispatchEvent(refreshEvent)
        }, 100)
      } else {
        // Otherwise, redirect to the jobs page
        router.push(`/dashboard/jobs`)
      }
    } catch (error) {
      console.error("Error creating job folder:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was a problem creating your job folder.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={className}>
          <Plus className="mr-2 h-4 w-4" />
          Add a Job to Track
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add a Job to Track</DialogTitle>
          <DialogDescription>Enter the job details to create a new application folder.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((data) => safeFormSubmit(onSubmit, data, () => setIsLoading(false)))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input id="jobTitle" placeholder="e.g. Frontend Developer" {...form.register("jobTitle")} />
            {form.formState.errors.jobTitle && (
              <p className="text-sm text-red-500">{form.formState.errors.jobTitle.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" placeholder="e.g. TechCorp" {...form.register("company")} />
              {form.formState.errors.company && (
                <p className="text-sm text-red-500">{form.formState.errors.company.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input id="location" placeholder="e.g. Remote, New York" {...form.register("location")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the job description here..."
              className="min-h-[150px]"
              {...form.register("jobDescription")}
            />
            {form.formState.errors.jobDescription && (
              <p className="text-sm text-red-500">{form.formState.errors.jobDescription.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobUrl">Job URL (Optional)</Label>
            <Input id="jobUrl" placeholder="e.g. https://example.com/job-posting" {...form.register("jobUrl")} />
            {form.formState.errors.jobUrl && (
              <p className="text-sm text-red-500">{form.formState.errors.jobUrl.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Job Folder"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
