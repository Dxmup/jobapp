"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

const formSchema = z.object({
  jobTitle: z.string().min(3, {
    message: "Job title must be at least 3 characters.",
  }),
  company: z.string().min(1, {
    message: "Company name is required.",
  }),
  location: z.string().optional(),
  jobDescription: z.string().min(10, {
    message: "Job description must be at least 10 characters.",
  }),
  jobUrl: z.string().url().optional().or(z.literal("")),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function EditJobPage({ params }: { params: { id: string } }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [jobData, setJobData] = useState<FormValues | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const jobId = params.id

  // Initialize form with empty defaults first
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitle: "",
      company: "",
      location: "",
      jobDescription: "",
      jobUrl: "",
      contactName: "",
      contactEmail: "",
      notes: "",
    },
  })

  // Fetch job data
  useEffect(() => {
    async function fetchJobData() {
      try {
        const response = await fetch(`/api/jobs/${jobId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch job data")
        }

        const data = await response.json()

        // Map API data to form values
        const formData: FormValues = {
          jobTitle: data.title || "",
          company: data.company || "",
          location: data.location || "",
          jobDescription: data.description || "",
          jobUrl: data.url || "",
          contactName: data.contact_name || "",
          contactEmail: data.contact_email || "",
          notes: data.notes || "",
        }

        setJobData(formData)

        // Reset form with fetched values
        form.reset(formData)
      } catch (error) {
        console.error("Error fetching job:", error)
        toast({
          title: "Error",
          description: "Failed to load job details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobData()
  }, [jobId, form, toast])

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: values.jobTitle,
          company: values.company,
          location: values.location,
          description: values.jobDescription,
          url: values.jobUrl,
          contact_name: values.contactName,
          contact_email: values.contactEmail,
          notes: values.notes,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update job")
      }

      toast({
        title: "Job updated",
        description: "The job details have been updated successfully.",
      })

      router.push(`/dashboard/jobs/${jobId}`)
    } catch (error) {
      console.error("Error updating job:", error)
      toast({
        title: "Error",
        description: "There was a problem updating the job details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/jobs/${jobId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit Job Details</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Job Application</CardTitle>
          <CardDescription>Update the details for this job application.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Frontend Developer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. TechCorp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Remote, New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Paste the job description here..." className="min-h-[150px]" {...field} />
                    </FormControl>
                    <FormDescription>
                      The job description is used for AI-powered resume and cover letter optimization.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Posting URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. https://company.com/jobs/position" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 border rounded-md p-4">
                <h3 className="text-sm font-medium">Contact Information (Optional)</h3>

                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Jane Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="e.g. jane.smith@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any personal notes about this application..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/jobs/${jobId}`)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
