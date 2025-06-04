"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ArrowLeft, FileText, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  resumeName: z.string().min(3, {
    message: "Resume name must be at least 3 characters.",
  }),
  currentResume: z.string().min(10, {
    message: "Please enter your current resume content.",
  }),
  focusAreas: z.string().optional(),
  baseResumeId: z.string().optional(),
  versionName: z.string().min(1, {
    message: "Version name is required.",
  }),
})

export default function OptimizeResumePage({ params }: { params: { id: string } }) {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizedContent, setOptimizedContent] = useState<string | null>(null)
  const [baseResumes, setBaseResumes] = useState<{ id: string; name: string }[]>([])
  const [isLoadingResumes, setIsLoadingResumes] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const jobId = params.id

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resumeName: "AI Optimized Resume",
      currentResume: "",
      focusAreas: "",
      baseResumeId: "",
      versionName: "AI Optimized",
    },
  })

  // Fetch base resumes
  useEffect(() => {
    async function fetchBaseResumes() {
      try {
        setIsLoadingResumes(true)
        const response = await fetch("/api/resumes?isBase=true")

        if (!response.ok) {
          throw new Error("Failed to fetch base resumes")
        }

        const data = await response.json()

        if (data.success && Array.isArray(data.resumes)) {
          setBaseResumes(
            data.resumes.map((resume: any) => ({
              id: resume.id,
              name: resume.name,
            })),
          )

          // Set the first resume as selected if available
          if (data.resumes.length > 0) {
            form.setValue("baseResumeId", data.resumes[0].id)

            // Fetch the content of the first resume
            const firstResumeResponse = await fetch(`/api/resumes/${data.resumes[0].id}`)
            if (firstResumeResponse.ok) {
              const resumeData = await firstResumeResponse.json()
              if (resumeData.success && resumeData.resume) {
                form.setValue("currentResume", resumeData.resume.content)
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching base resumes:", error)
        toast({
          title: "Error",
          description: "Failed to load your resumes. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingResumes(false)
      }
    }

    fetchBaseResumes()
  }, [toast, form])

  // Handle base resume selection change
  const handleBaseResumeChange = async (resumeId: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch resume details")
      }

      const data = await response.json()

      if (data.success && data.resume) {
        form.setValue("currentResume", data.resume.content)
      }
    } catch (error) {
      console.error("Error fetching resume:", error)
      toast({
        title: "Error",
        description: "Failed to load resume content.",
        variant: "destructive",
      })
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsOptimizing(true)

    try {
      // Simulate API call to OpenAI for resume optimization
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Mock optimized resume
      const mockOptimizedResume = `
JOHN DOE
Frontend Developer
San Francisco, CA | (123) 456-7890 | john.doe@example.com | linkedin.com/in/johndoe | github.com/johndoe

PROFESSIONAL SUMMARY
Results-driven Frontend Developer with 5+ years of experience building responsive and performant web applications. Specialized in React, Next.js, and modern JavaScript frameworks with a strong focus on accessibility and user experience. Proven track record of improving application performance and implementing best practices that drive business results.

SKILLS
• Frontend: React, Next.js, TypeScript, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS
• State Management: Redux, Context API, Zustand
• Testing: Jest, React Testing Library, Cypress
• Performance Optimization: Webpack, Code Splitting, Lazy Loading
• Accessibility: WCAG 2.1 Guidelines, Aria Attributes, Keyboard Navigation
• CI/CD: GitHub Actions, CircleCI, Vercel Deployments
• Tools: Git, npm, Yarn, VS Code, Figma

PROFESSIONAL EXPERIENCE

SENIOR FRONTEND DEVELOPER | InnovateTech | San Francisco, CA | 2021 - Present
• Led the development of a responsive e-commerce platform using Next.js and Tailwind CSS, resulting in a 40% increase in mobile conversions and 25% reduction in bounce rates
• Implemented comprehensive accessibility improvements that brought the application to WCAG 2.1 AA compliance
• Optimized application performance by implementing code splitting and lazy loading, reducing initial load time by 35%
• Mentored junior developers and conducted code reviews to ensure code quality and best practices

FRONTEND DEVELOPER | TechSolutions | San Francisco, CA | 2018 - 2021
• Developed and maintained multiple React applications serving over 100,000 daily active users
• Collaborated with UX/UI designers to implement pixel-perfect interfaces and smooth animations
• Reduced bundle size by 45% through optimization techniques and proper dependency management
• Implemented automated testing with Jest and React Testing Library, achieving 85% code coverage

EDUCATION
Bachelor of Science in Computer Science | University of California, Berkeley | 2014 - 2018

PROJECTS
Personal Portfolio Website (2022)
• Designed and developed a personal portfolio using Next.js, Framer Motion, and Tailwind CSS
• Implemented dark mode, responsive design, and accessibility features
• Achieved 100/100 Lighthouse performance score

Open Source Contributions
• Active contributor to React-based open source projects
• Created and maintained a popular React hooks library with 500+ GitHub stars
      `

      setOptimizedContent(mockOptimizedResume)

      toast({
        title: "Resume optimized!",
        description: "Your AI-optimized resume is ready to review.",
      })
    } catch (error) {
      console.error("Error optimizing resume:", error)
      toast({
        title: "Optimization failed",
        description: "There was a problem optimizing your resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleSave = async () => {
    try {
      if (!optimizedContent) {
        toast({
          title: "No optimized content",
          description: "Please optimize your resume first.",
          variant: "destructive",
        })
        return
      }

      const baseResumeId = form.getValues("baseResumeId")

      if (!baseResumeId) {
        toast({
          title: "No resume selected",
          description: "Please select a base resume.",
          variant: "destructive",
        })
        return
      }

      // Create a new resume with the job ID and parent resume ID
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.getValues("resumeName"),
          content: optimizedContent,
          jobId: jobId,
          parentResumeId: baseResumeId,
          isAiGenerated: true,
          versionName: form.getValues("versionName"),
          // Use the file name from the base resume
          fileName: baseResumes.find((r) => r.id === baseResumeId)?.name + ".txt" || "optimized-resume.txt",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save resume")
      }

      toast({
        title: "Resume saved!",
        description: "Your optimized resume has been saved successfully.",
      })

      router.push(`/dashboard/jobs/${jobId}`)
    } catch (error) {
      console.error("Error saving resume:", error)
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save resume",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/jobs/${jobId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Optimize Resume with AI</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Resume Optimization
            </CardTitle>
            <CardDescription>Let AI optimize your resume for this specific job</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="resumeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>This name will be used to identify your optimized resume</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="versionName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., AI Optimized, First Draft, etc." />
                      </FormControl>
                      <FormDescription>A short label to identify this version</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="baseResumeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Resume</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          handleBaseResumeChange(value)
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a base resume" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingResumes ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span>Loading resumes...</span>
                            </div>
                          ) : baseResumes.length === 0 ? (
                            <div className="p-2 text-center text-sm text-muted-foreground">
                              No base resumes found. Please create a resume first.
                            </div>
                          ) : (
                            baseResumes.map((resume) => (
                              <SelectItem key={resume.id} value={resume.id}>
                                {resume.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>Select the resume you want to optimize</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentResume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Resume Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your current resume content here..."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>This is the content that will be optimized</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="focusAreas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Focus Areas (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add specific skills or experiences you want to highlight..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Specify any particular skills, experiences, or achievements you want to emphasize
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isOptimizing || !!optimizedContent}>
                  {isOptimizing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Optimizing...
                    </>
                  ) : optimizedContent ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Optimized!
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Optimize Resume
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-500" />
              Optimized Resume Preview
            </CardTitle>
            <CardDescription>Review and edit your AI-optimized resume</CardDescription>
          </CardHeader>
          <CardContent>
            {optimizedContent ? (
              <Textarea
                value={optimizedContent}
                onChange={(e) => setOptimizedContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center min-h-[400px] border rounded-md bg-muted/40">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No optimized resume yet</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-md">
                  Select a base resume and click "Optimize Resume" to create a tailored version with AI.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            {optimizedContent && (
              <>
                <Button variant="outline" onClick={() => setOptimizedContent(null)}>
                  Regenerate
                </Button>
                <Button onClick={handleSave}>Save Resume</Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
