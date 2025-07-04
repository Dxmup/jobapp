"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Mail, MessageSquare, ArrowRight } from "lucide-react"
import Link from "next/link"
import { HeroDemoTabs } from "./hero-demo-tabs"

const MAX_DEMO_ACTIONS = 4

export function EnhancedHeroDemoTabs() {
  const [actionCount, setActionCount] = useState(0)
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)

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
    <div className="mt-20 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
          See JobCraft AI in Action
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          Experience how our AI transforms your job application materials in real-time
        </p>
      </div>
      <HeroDemoTabs />
    </div>
  )
}
