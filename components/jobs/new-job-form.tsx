"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createJobAction } from "@/app/actions/create-job-action"

interface NewJobFormProps {
  onSuccess?: () => void
}

export function NewJobForm({ onSuccess }: NewJobFormProps) {
  const [title, setTitle] = useState("")
  const [company, setCompany] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !company) {
      toast({
        title: "Missing information",
        description: "Please provide at least a job title and company name.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createJobAction({
        title,
        company,
        location,
        description,
        url,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      console.log("Job created successfully, ID:", result.data.id)

      // Store the ID for highlighting - use both localStorage and sessionStorage for redundancy
      localStorage.setItem("highlightJobId", result.data.id)
      localStorage.setItem("newJobId", result.data.id)
      localStorage.setItem("newJobTitle", title)
      localStorage.setItem("newJobTimestamp", Date.now().toString())

      // Also store in sessionStorage as backup
      sessionStorage.setItem("newJobId", result.data.id)
      sessionStorage.setItem("newJobTitle", title)
      sessionStorage.setItem("newJobTimestamp", Date.now().toString())

      // Dispatch a custom event that the jobs page can listen for
      const jobCreatedEvent = new CustomEvent("jobCreated", {
        detail: { id: result.data.id, title },
      })
      window.dispatchEvent(jobCreatedEvent)

      toast({
        title: "Job created",
        description: "Your job application has been created successfully.",
      })

      // Call the success callback if provided
      if (onSuccess) {
        onSuccess()
      }

      // Refresh the current page
      router.refresh()

      // If we're not already on the jobs page, navigate there
      if (!window.location.pathname.includes("/dashboard/jobs")) {
        router.push("/dashboard/jobs")
      } else {
        // Force a hard refresh to ensure the new job is loaded
        window.location.href = "/dashboard/jobs?highlight=" + result.data.id
      }
    } catch (error) {
      console.error("Error creating job:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create job",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Job Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Software Engineer"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company *</Label>
        <Input
          id="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g., Acme Inc."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Remote, New York, NY"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">Job URL</Label>
        <Input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/job-posting"
        />
        <p className="text-sm text-muted-foreground">Optional: Link to the job posting</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Job Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter the job description here..."
          rows={4}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Job Application"
          )}
        </Button>
      </div>
    </form>
  )
}
