"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Loader2, Sparkles, User, Briefcase } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CoverLetterTabProps {
  onActionUsed: () => void
  isDisabled: boolean
}

export function CoverLetterTab({ onActionUsed, isDisabled }: CoverLetterTabProps) {
  const [jobDescription, setJobDescription] = useState("")
  const [candidateName, setCandidateName] = useState("")
  const [candidateRole, setCandidateRole] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("")
  const { toast } = useToast()

  const handleGenerateCoverLetter = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Job description required",
        description: "Please paste the job description to generate a cover letter.",
        variant: "destructive",
      })
      return
    }

    if (jobDescription.length < 20) {
      toast({
        title: "Job description too short",
        description: "Please provide a more detailed job description (at least 20 characters).",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/landing/generate-cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: jobDescription,
          candidateName: candidateName.trim() || "John Smith",
          candidateRole: candidateRole.trim() || "Professional",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate cover letter")
      }

      setGeneratedCoverLetter(data.coverLetter)
      onActionUsed() // Increment the usage counter

      toast({
        title: "Cover letter generated!",
        description: "Your personalized cover letter is ready.",
      })
    } catch (error) {
      console.error("Error generating cover letter:", error)
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setJobDescription("")
    setCandidateName("")
    setCandidateRole("")
    setGeneratedCoverLetter("")
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCoverLetter)
      toast({
        title: "Copied to clipboard",
        description: "Cover letter has been copied to your clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please manually select and copy the text.",
        variant: "destructive",
      })
    }
  }

  if (generatedCoverLetter) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-500" />
            Generated Cover Letter
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopyToClipboard}>
              Copy to Clipboard
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Generate Another
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none text-left">
              <div className="whitespace-pre-wrap font-serif text-gray-800 dark:text-gray-200 leading-relaxed text-left">
                {generatedCoverLetter}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="relative border border-purple-500 bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg shadow-lg">
          <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/2"></div>
          <p className="text-sm text-purple-900 dark:text-purple-100">
            The above example is a demonstration. Once logged in, our AI will incorporate details from your resumes into
            Cover Letters making each fully customized.
          </p>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>💡 Tip: Customize this cover letter with your specific experiences and achievements for best results!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
          <Mail className="h-5 w-5 text-green-600" />
          Cover Letter Generator Demo
        </h3>
        <p className="text-muted-foreground">
          See how JobCraft turns your everyday experience into compelling stories that make hiring managers think 'I need to
          interview this person'.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details & Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="candidate-name" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Your Name (Optional)
              </label>
              <Input
                id="candidate-name"
                placeholder="e.g., John Smith"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                disabled={isDisabled}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="candidate-role" className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Target Role (Optional)
              </label>
              <Input
                id="candidate-role"
                placeholder="e.g., Software Engineer"
                value={candidateRole}
                onChange={(e) => setCandidateRole(e.target.value)}
                disabled={isDisabled}
              />
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <label htmlFor="job-description" className="text-sm font-medium">
              Job Description *
            </label>
            <Textarea
              id="job-description"
              placeholder="Paste the job description here... Include company name, role requirements, responsibilities, and any specific details mentioned in the posting."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[200px]"
              disabled={isDisabled}
            />
            <div className="text-xs text-muted-foreground text-right">{jobDescription.length} characters</div>
          </div>

          <Button
            onClick={handleGenerateCoverLetter}
            disabled={isGenerating || !jobDescription.trim() || isDisabled}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Cover Letter...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Cover Letter
              </>
            )}
          </Button>

          {isDisabled && (
            <p className="text-sm text-muted-foreground text-center">
              Demo limit reached. Sign up to continue generating cover letters!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
