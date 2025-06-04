"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, FileText, Loader2, Sparkles, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { generateCoverLetter, saveCoverLetter, getJobResumes } from "@/app/actions/cover-letter-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { storeItem } from "@/lib/animation-utils"

export default function GenerateCoverLetterPage({ params }: { params: { id: string } }) {
  // Form state
  const [coverLetterName, setCoverLetterName] = useState("Professional Cover Letter")
  const [selectedResumeId, setSelectedResumeId] = useState("")
  const [tone, setTone] = useState(5)
  const [length, setLength] = useState(5)
  const [formality, setFormality] = useState(5)
  const [additionalInfo, setAdditionalInfo] = useState("")

  // UI state
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const [resumes, setResumes] = useState<any[]>([])
  const [isLoadingResumes, setIsLoadingResumes] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()
  const jobId = params.id

  // Load resumes associated with this job
  const loadResumes = async () => {
    try {
      setIsLoadingResumes(true)
      setIsRefreshing(true)
      setError(null)

      console.log("Fetching resumes for job:", jobId)
      const result = await getJobResumes(jobId)
      console.log("Resume fetch result:", result)

      if (!result.success) {
        setError(result.error || "Failed to load resumes")
        return
      }

      setResumes(result.resumes || [])

      // If there's at least one resume, set it as the default
      if (result.resumes && result.resumes.length > 0) {
        setSelectedResumeId(result.resumes[0].id)
      }
    } catch (error) {
      console.error("Error loading resumes:", error)
      setError(error instanceof Error ? error.message : "Failed to load resumes")
    } finally {
      setIsLoadingResumes(false)
      setIsRefreshing(false)
    }
  }

  // Load resumes when the component mounts
  useEffect(() => {
    loadResumes()
  }, [jobId])

  const getToneDescription = (value: number) => {
    if (value <= 3) return "Casual and conversational"
    if (value <= 7) return "Professional and balanced"
    return "Highly formal and traditional"
  }

  const getLengthDescription = (value: number) => {
    if (value <= 3) return "Concise (250-350 words)"
    if (value <= 7) return "Standard (350-500 words)"
    return "Comprehensive (500-700 words)"
  }

  const getFormalityDescription = (value: number) => {
    if (value <= 3) return "Casual and friendly"
    if (value <= 7) return "Professional and respectful"
    return "Highly formal and traditional"
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedResumeId) {
      toast({
        title: "Missing resume",
        description: "Please select a resume to continue",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const result = await generateCoverLetter({
        jobId,
        resumeId: selectedResumeId,
        coverLetterName,
        tone,
        length,
        formality,
        additionalInfo: additionalInfo || "",
      })

      if (!result.success) {
        setError(result.error || "Failed to generate cover letter")
        toast({
          title: "Generation failed",
          description: result.error || "Failed to generate cover letter",
          variant: "destructive",
        })
        return
      }

      setGeneratedContent(result.coverLetter || "")

      toast({
        title: "Cover letter generated!",
        description: "Your AI-generated cover letter is ready to review.",
      })
    } catch (error) {
      console.error("Error generating cover letter:", error)
      setError(error instanceof Error ? error.message : "Failed to generate cover letter")
      toast({
        title: "Generation failed",
        description: "There was a problem generating your cover letter. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!generatedContent) return

    try {
      setIsSaving(true)
      setError(null)

      const result = await saveCoverLetter({
        jobId,
        name: coverLetterName,
        content: generatedContent,
      })

      if (!result.success) {
        setError(result.error || "Failed to save cover letter")
        toast({
          title: "Save failed",
          description: result.error || "Failed to save cover letter",
          variant: "destructive",
        })
        return
      }

      // After successfully saving the cover letter
      if (result.success && result.coverLetterId) {
        // Store the new cover letter ID in localStorage for highlighting
        storeItem("newCoverLetterId", result.coverLetterId)
        storeItem("newCoverLetterName", coverLetterName)

        toast({
          title: "Success!",
          description: "Cover letter created successfully.",
        })

        // Redirect to the cover letters page
        router.push("/dashboard/cover-letters")
      } else {
        toast({
          title: "Cover letter saved!",
          description: "Your cover letter has been saved successfully.",
        })

        router.push(`/jobs/${jobId}`)
      }
    } catch (error) {
      console.error("Error saving cover letter:", error)
      setError(error instanceof Error ? error.message : "Failed to save cover letter")
      toast({
        title: "Save failed",
        description: "There was a problem saving your cover letter. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/jobs/${jobId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Generate Cover Letter</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Cover Letter Settings
            </CardTitle>
            <CardDescription>Customize your AI-generated cover letter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <Button variant="outline" size="sm" onClick={loadResumes} disabled={isRefreshing} className="text-xs">
                <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh Resumes
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="coverLetterName">Cover Letter Name</Label>
                <Input
                  id="coverLetterName"
                  value={coverLetterName}
                  onChange={(e) => setCoverLetterName(e.target.value)}
                  required
                  minLength={3}
                />
                <p className="text-sm text-muted-foreground">This name will be used to identify your cover letter</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resumeSelect">Select Resume</Label>
                <Select
                  value={selectedResumeId}
                  onValueChange={setSelectedResumeId}
                  disabled={isLoadingResumes || resumes.length === 0}
                >
                  <SelectTrigger id="resumeSelect">
                    <SelectValue placeholder="Select a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingResumes ? (
                      <SelectItem value="loading" disabled>
                        Loading resumes...
                      </SelectItem>
                    ) : resumes.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No resumes available
                      </SelectItem>
                    ) : (
                      resumes.map((resume) => (
                        <SelectItem key={resume.id} value={resume.id}>
                          {resume.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {resumes.length === 0 ? (
                    <span className="text-amber-600">
                      You need to associate at least one resume with this job first
                    </span>
                  ) : (
                    "Choose the resume to base your cover letter on"
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Slider
                  id="tone"
                  min={1}
                  max={10}
                  step={1}
                  value={[tone]}
                  onValueChange={(value) => setTone(value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Casual</span>
                  <span>Professional</span>
                  <span>Formal</span>
                </div>
                <p className="text-sm text-muted-foreground">Current: {getToneDescription(tone)}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="length">Length</Label>
                <Slider
                  id="length"
                  min={1}
                  max={10}
                  step={1}
                  value={[length]}
                  onValueChange={(value) => setLength(value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Short</span>
                  <span>Medium</span>
                  <span>Long</span>
                </div>
                <p className="text-sm text-muted-foreground">Current: {getLengthDescription(length)}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="formality">Formality</Label>
                <Slider
                  id="formality"
                  min={1}
                  max={10}
                  step={1}
                  value={[formality]}
                  onValueChange={(value) => setFormality(value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Casual</span>
                  <span>Standard</span>
                  <span>Formal</span>
                </div>
                <p className="text-sm text-muted-foreground">Current: {getFormalityDescription(formality)}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Add any specific points you'd like to highlight in your cover letter..."
                  className="min-h-[100px]"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Include specific achievements, skills, or experiences you want to emphasize
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isGenerating || !!generatedContent || resumes.length === 0}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : generatedContent ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generated!
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Cover Letter
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-500" />
              Cover Letter Preview
            </CardTitle>
            <CardDescription>Review and edit your generated cover letter</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <Textarea
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center min-h-[400px] border rounded-md bg-muted/40">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No cover letter generated yet</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-md">
                  {resumes.length === 0
                    ? "You need to associate at least one resume with this job first."
                    : 'Adjust the settings on the left and click "Generate Cover Letter" to create a tailored cover letter with AI.'}
                </p>
                {resumes.length === 0 && (
                  <Button variant="outline" asChild>
                    <Link href={`/jobs/${jobId}`}>Go Back to Job</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            {generatedContent && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setGeneratedContent(null)
                    setAdditionalInfo("")
                  }}
                >
                  Regenerate
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Cover Letter"
                  )}
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
