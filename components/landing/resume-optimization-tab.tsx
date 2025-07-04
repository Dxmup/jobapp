"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, FileText, Zap, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const sampleResume = `John Smith
Software Engineer

Experience:
• Developed web applications using React and Node.js
• Worked with databases and APIs
• Collaborated with team members on projects

Skills:
JavaScript, React, Node.js, HTML, CSS`

const optimizedResume = `John Smith
Senior Software Engineer | Full-Stack Developer

PROFESSIONAL EXPERIENCE:
Software Engineer | TechCorp (2021-Present)
• Architected and developed 5+ scalable web applications using React.js and Node.js, serving 10,000+ daily active users
• Optimized database queries and API performance, reducing response times by 40%
• Led cross-functional team of 4 developers in agile environment, delivering projects 20% ahead of schedule
• Implemented automated testing suites, improving code coverage from 60% to 95%

TECHNICAL SKILLS:
Frontend: React.js, TypeScript, HTML5, CSS3, Tailwind CSS
Backend: Node.js, Express.js, Python, RESTful APIs
Database: PostgreSQL, MongoDB, Redis
Tools: Git, Docker, AWS, CI/CD pipelines`

const improvements = [
  { type: "added", text: "Quantified achievements with specific metrics" },
  { type: "added", text: "Enhanced job title with relevant keywords" },
  { type: "added", text: "Structured experience with clear company context" },
  { type: "added", text: "Expanded technical skills with modern technologies" },
  { type: "improved", text: "Transformed basic bullet points into impact statements" },
]

export function ResumeOptimizationTab() {
  const [jobTitle, setJobTitle] = useState("Software Engineer")
  const [resumeText, setResumeText] = useState(sampleResume)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleOptimize = async () => {
    setIsOptimizing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsOptimizing(false)
    setShowResults(true)
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="job-title">Target Job Title</Label>
            <Input
              id="job-title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
            />
          </div>

          <div>
            <Label htmlFor="resume-text">Current Resume</Label>
            <Textarea
              id="resume-text"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your current resume here..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          <Button
            onClick={handleOptimize}
            disabled={isOptimizing || !resumeText.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Optimizing with AI...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Optimize Resume
              </>
            )}
          </Button>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <Card className="border-green-200 dark:border-green-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Optimized Resume
                    </CardTitle>
                    <CardDescription>AI-enhanced version tailored for {jobTitle}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap font-mono">{optimizedResume}</pre>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Key Improvements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {improvements.map((improvement, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-2"
                      >
                        <Badge
                          variant={improvement.type === "added" ? "default" : "secondary"}
                          className="mt-0.5 text-xs"
                        >
                          {improvement.type}
                        </Badge>
                        <span className="text-sm">{improvement.text}</span>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {!showResults && (
            <Card className="border-dashed border-2 border-slate-200 dark:border-slate-700">
              <CardContent className="flex items-center justify-center h-[300px] text-center">
                <div className="space-y-2">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto" />
                  <p className="text-slate-500 dark:text-slate-400">Optimized resume will appear here</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
