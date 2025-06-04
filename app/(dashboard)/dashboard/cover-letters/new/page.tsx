"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function NewCoverLetterPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedJobId, setSelectedJobId] = useState("")
  const [availableJobs, setAvailableJobs] = useState<Array<{ id: string; title: string; company: string }>>([])
  const [isLoadingJobs, setIsLoadingJobs] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useState(() => {
    const fetchJobs = async () => {
      setIsLoadingJobs(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase
          .from("jobs")
          .select("id, title, company")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (!error && data) {
          setAvailableJobs(data)
        }
      } catch (error) {
        console.error("Error fetching jobs:", error)
      } finally {
        setIsLoadingJobs(false)
      }
    }

    fetchJobs()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !content) {
      toast({
        title: "Missing information",
        description: "Please provide a title and content for your cover letter.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to create a cover letter")
      }

      // If a job is selected, get its details
      let jobTitle = null
      let company = null

      if (selectedJobId) {
        const selectedJob = availableJobs.find((job) => job.id === selectedJobId)
        if (selectedJob) {
          jobTitle = selectedJob.title
          company = selectedJob.company
        }
      }

      // Create the cover letter
      const { data, error } = await supabase
        .from("cover_letters")
        .insert({
          user_id: user.id,
          title,
          content,
          job_id: selectedJobId || null,
          job_title: jobTitle,
          company,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Cover letter created",
        description: "Your cover letter has been created successfully.",
      })

      // Redirect to the cover letters page with the new cover letter ID for highlighting
      router.push(`/dashboard/cover-letters?highlight=${data.id}`)
    } catch (error) {
      console.error("Error creating cover letter:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create cover letter",
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
            <CardTitle>New Cover Letter</CardTitle>
            <CardDescription>Create a new cover letter from scratch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Cover Letter Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Software Engineer at Acme Inc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job">Associated Job (Optional)</Label>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger id="job" disabled={isLoadingJobs || availableJobs.length === 0}>
                  <SelectValue placeholder="Select a job" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {availableJobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} at {job.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoadingJobs && <p className="text-sm text-muted-foreground">Loading jobs...</p>}
              {!isLoadingJobs && availableJobs.length === 0 && (
                <p className="text-sm text-muted-foreground">No jobs found. Create a job first to associate it.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Cover Letter Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your cover letter content here..."
                rows={12}
                required
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
                "Create Cover Letter"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
