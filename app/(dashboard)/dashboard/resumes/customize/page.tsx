"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import type { Job } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  content: z.string().min(10, {
    message: "Content must be at least 10 characters.",
  }),
  jobId: z.string().optional(),
})

const CustomizeResumePage = () => {
  const router = useRouter()
  const { toast } = useToast()
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [baseResumeId, setBaseResumeId] = useState<string | null>(null)
  const [resumeContent, setResumeContent] = useState("")
  const [resumeTitle, setResumeTitle] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Resume created successfully.",
        })
        router.push("/dashboard/resumes")
      } else {
        toast({
          title: "Error!",
          description: "Failed to create resume.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error!",
        description: "Something went wrong.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/jobs", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          setJobs(data)
        } else {
          toast({
            title: "Error!",
            description: "Failed to fetch jobs.",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error!",
          description: "Something went wrong.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobs()
  }, [toast])

  // Check for resumeId in query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const resumeId = params.get("resumeId")

    if (resumeId) {
      setBaseResumeId(resumeId)
      fetchResumeContent(resumeId)
    }
  }, [])

  const fetchResumeContent = async (resumeId: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setResumeContent(data.content)
        setResumeTitle(data.title)
        form.setValue("title", data.title)
        form.setValue("content", data.content)
      } else {
        toast({
          title: "Error!",
          description: "Failed to fetch resume content.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error!",
        description: "Something went wrong.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Customize Resume</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Resume Title" {...field} />
                </FormControl>
                <FormDescription>Give your resume a descriptive title.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea placeholder="Resume Content" className="resize-none" {...field} />
                </FormControl>
                <FormDescription>Write the content of your resume.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="jobId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related Job (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoading ? (
                      <SelectItem value="loading" disabled>
                        <Skeleton className="h-9 w-full" />
                      </SelectItem>
                    ) : (
                      jobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>Optionally, link this resume to a specific job.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  )
}

export default CustomizeResumePage
