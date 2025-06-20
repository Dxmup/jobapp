"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Mail, MessageSquare, ArrowRight } from "lucide-react"
import { ResumeOptimizationTab } from "./resume-optimization-tab"
import Link from "next/link"
import { CoverLetterTab } from "./cover-letter-tab"
import { InterviewPrepTab } from "./interview-prep-tab"

const MAX_DEMO_ACTIONS = 4

export function HeroDemoTabs() {
  const [actionCount, setActionCount] = useState(0)
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)

  const handleActionUsed = () => {
    const newCount = actionCount + 1
    setActionCount(newCount)

    if (newCount >= MAX_DEMO_ACTIONS) {
      setShowSignupPrompt(true)
    }
  }

  const isDisabled = actionCount >= MAX_DEMO_ACTIONS

  if (showSignupPrompt) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Ready to supercharge your job search? 🚀</h3>
            <p className="text-lg text-muted-foreground">
              You've tried our demo features. Now unlock the full power of AI-driven job applications!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
            <div className="p-4 border rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-semibold">Unlimited Resume Optimization</h4>
              <p className="text-sm text-muted-foreground">Tailor resumes for every job application</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Mail className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-semibold">AI Cover Letters</h4>
              <p className="text-sm text-muted-foreground">Generate personalized cover letters instantly</p>
            </div>
            <div className="p-4 border rounded-lg">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-semibold">Interview Practice</h4>
              <p className="text-sm text-muted-foreground">Practice with AI-powered phone interviews</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" onClick={() => setShowSignupPrompt(false)}>
              Continue Demo
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">No credit card required • Free plan available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">See What Our AI Can Do — No Sign-Up Needed</h2>
        <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
          Instantly improve your resume, cover letter, or interview prep. Just try one of the tools below to see how our
          AI works—your first few actions are free. Sign up for full powered results.
        </p>
      </div>

      <Tabs defaultValue="resume" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resume" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Resume Optimizer
          </TabsTrigger>
          <TabsTrigger value="cover-letter" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Cover Letter
          </TabsTrigger>
          <TabsTrigger value="interview" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Interview Prep
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="mt-6">
          <ResumeOptimizationTab onActionUsed={handleActionUsed} isDisabled={isDisabled} />
        </TabsContent>

        <TabsContent value="cover-letter" className="mt-6">
          <CoverLetterTab onActionUsed={handleActionUsed} isDisabled={isDisabled} />
        </TabsContent>

        <TabsContent value="interview" className="mt-6">
          <InterviewPrepTab onActionUsed={handleActionUsed} isDisabled={isDisabled} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
