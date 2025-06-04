"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ArrowLeft } from "lucide-react"
import { createJobAction } from "@/app/actions/create-job-action"
import { useToast } from "@/hooks/use-toast"

export default function NewJobPage() {
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
      // Use the server action to create the job - no need to pass userId anymore
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

      toast({
        title: "Job created",
        description: "Your job application has been created successfully.",
      })

      // Redirect to the jobs page with the new job ID for highlighting
      router.push(`/dashboard/jobs?highlight=${result.data.id}`)
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
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>New Job Application</CardTitle>
            <CardDescription>Enter the details of the job you're applying for</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter the job description here..."
                rows={6}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Job Application"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
