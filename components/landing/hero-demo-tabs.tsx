"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, MessageSquare, Users, Sparkles } from "lucide-react"

export function HeroDemoTabs() {
  const [activeTab, setActiveTab] = useState("resume")

  const demoContent = {
    resume: {
      icon: <FileText className="h-5 w-5" />,
      title: "AI Resume Optimization",
      description: "Watch your resume transform for each job",
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-red-700">Before: Generic Resume</span>
            </div>
            <p className="text-sm text-red-600">• Generic skills list</p>
            <p className="text-sm text-red-600">• No job-specific keywords</p>
            <p className="text-sm text-red-600">• Weak impact statements</p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700">After: AI-Optimized</span>
            </div>
            <p className="text-sm text-green-600">• Tailored for specific role</p>
            <p className="text-sm text-green-600">• ATS-optimized keywords</p>
            <p className="text-sm text-green-600">• Quantified achievements</p>
          </motion.div>
        </div>
      ),
    },
    cover: {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "Smart Cover Letters",
      description: "Generate personalized letters in seconds",
      content: (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">AI-Generated Cover Letter</span>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <p>"Dear Hiring Manager,</p>
              <p>
                I am excited to apply for the Senior Software Engineer position at TechCorp. With 5 years of experience
                in React and Node.js, I am confident I can contribute to your team's success...
              </p>
              <p className="text-xs text-slate-400 italic">Generated in 3 seconds</p>
            </div>
          </div>
        </div>
      ),
    },
    interview: {
      icon: <Users className="h-5 w-5" />,
      title: "Interview Preparation",
      description: "Practice with AI-powered mock interviews",
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium">AI Interviewer</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-700">"Tell me about a time you faced a technical challenge..."</p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  Behavioral
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Technical
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Company-Specific
                </Badge>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/80 backdrop-blur-sm">
          {Object.entries(demoContent).map(([key, demo]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
            >
              {demo.icon}
              <span className="hidden sm:inline">{demo.title.split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <AnimatePresence mode="wait">
          {Object.entries(demoContent).map(([key, demo]) => (
            <TabsContent key={key} value={key} className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/90 backdrop-blur-sm border-purple-200 shadow-xl">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white">
                          {demo.icon}
                        </div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                          {demo.title}
                        </h3>
                      </div>
                      <p className="text-slate-600">{demo.description}</p>
                    </div>
                    {demo.content}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          ))}
        </AnimatePresence>
      </Tabs>
    </div>
  )
}
