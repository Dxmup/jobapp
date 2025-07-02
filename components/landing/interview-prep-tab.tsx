"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles, BrainCircuit, MessageSquare, Mic } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"

export function InterviewPrepTab() {
  const [jobDescription, setJobDescription] = useState("")
  const [role, setRole] = useState("")
  const [experience, setExperience] = useState("")
  const [questions, setQuestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGenerateQuestions = async () => {
    setError(null)
    setQuestions([])

    if (!jobDescription.trim()) {
      setError("Please enter a job description.")
      return
    }

    if (jobDescription.length < 50) {
      setError("Job description must be at least 50 characters.")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/landing/generate-interview-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          role: role.trim(),
          experience: experience || "entry to mid-level",
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setQuestions(data.questions)
        toast({
          title: "Questions generated!",
          description: "Practice these questions to ace your interview.",
        })
      } else {
        setError(data.error || "Failed to generate questions. Please try again.")
        toast({
          title: "Error",
          description: data.error || "Failed to generate questions.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error generating interview questions:", err)
      setError("An unexpected error occurred. Please try again.")
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-lg border-purple-200/50 dark:border-purple-800/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-purple-800 dark:text-purple-300 flex items-center">
            <BrainCircuit className="mr-2 h-6 w-6" /> Generate Interview Questions
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Paste your job description to get personalized interview questions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="job-description" className="text-slate-700 dark:text-slate-300">
              Job Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="job-description"
              placeholder="Paste the job description here... (minimum 50 characters)"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
              className="mt-1 bg-white/80 dark:bg-slate-800/80 border-purple-200 dark:border-purple-700 focus-visible:ring-purple-500"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>{jobDescription.length} characters</span>
              <span>Minimum: 50 characters</span>
            </div>
          </div>
          <div>
            <Label htmlFor="role" className="text-slate-700 dark:text-slate-300">
              Role/Position (Optional)
            </Label>
            <Input
              id="role"
              placeholder="e.g., Software Engineer, Marketing Manager"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 bg-white/80 dark:bg-slate-800/80 border-purple-200 dark:border-purple-700 focus-visible:ring-purple-500"
            />
          </div>
          <div>
            <Label htmlFor="experience" className="text-slate-700 dark:text-slate-300">
              Experience Level (Optional)
            </Label>
            <Input
              id="experience"
              placeholder="e.g., Entry-level, Mid-level, Senior"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="mt-1 bg-white/80 dark:bg-slate-800/80 border-purple-200 dark:border-purple-700 focus-visible:ring-purple-500"
            />
          </div>

          <Button
            onClick={handleGenerateQuestions}
            disabled={isLoading || !jobDescription.trim() || jobDescription.length < 50}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Generate Questions
              </>
            )}
          </Button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </CardContent>
      </Card>

      <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-lg border-cyan-200/50 dark:border-cyan-800/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-cyan-800 dark:text-cyan-300 flex items-center">
            <MessageSquare className="mr-2 h-6 w-6" /> Your Interview Questions
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Practice these questions to ace your interview.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {questions.length > 0 ? (
              <motion.div
                key="questions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ScrollArea className="h-[400px] pr-4">
                  <ul className="space-y-4">
                    {questions.map((q, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-purple-600 dark:text-purple-400 font-semibold flex-shrink-0">
                          {index + 1}.
                        </span>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{q}</p>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
                <Separator className="my-6 bg-purple-200 dark:bg-purple-700" />
                <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400 text-sm">
                  <Mic className="h-5 w-5 text-cyan-600" />
                  <span>
                    **Pro Tip:** Practice answering these questions out loud to build confidence and refine your
                    responses.
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center h-[400px] text-center text-slate-500 dark:text-slate-400"
              >
                <Sparkles className="h-12 w-12 mb-4 text-purple-400" />
                <p className="text-lg">Your personalized interview questions will appear here.</p>
                <p className="text-sm mt-2">Enter a job description and click "Generate Questions" to get started!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
