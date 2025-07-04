"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, MessageSquare, Users } from "lucide-react"
import { ResumeOptimizationTab } from "./resume-optimization-tab"
import { CoverLetterTab } from "./cover-letter-tab"
import { InterviewPrepTab } from "./interview-prep-tab"

export function EnhancedHeroDemoTabs() {
  const [activeTab, setActiveTab] = useState("resume")

  const tabs = [
    {
      id: "resume",
      label: "Resume Optimizer",
      icon: FileText,
      badge: "AI-Powered",
    },
    {
      id: "cover-letter",
      label: "Cover Letters",
      icon: MessageSquare,
      badge: "Personalized",
    },
    {
      id: "interview",
      label: "Interview Prep",
      icon: Users,
      badge: "Practice",
    },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold">See JobCraft AI in Action</CardTitle>
          <CardDescription>Try our AI-powered tools with real examples</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <Badge variant="secondary" className="hidden md:inline-flex text-xs">
                    {tab.badge}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="resume" className="mt-0">
              <ResumeOptimizationTab />
            </TabsContent>

            <TabsContent value="cover-letter" className="mt-0">
              <CoverLetterTab />
            </TabsContent>

            <TabsContent value="interview" className="mt-0">
              <InterviewPrepTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
