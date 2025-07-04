"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, MessageSquare, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const sampleCoverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the Senior Software Engineer position at TechCorp. With over 5 years of experience in full-stack development and a proven track record of delivering scalable web applications, I am excited about the opportunity to contribute to your innovative team.

In my current role at InnovateTech, I have successfully:

• Led the development of a customer portal that increased user engagement by 45%
• Architected microservices infrastructure that improved system reliability by 60%
• Mentored junior developers and established coding best practices across the team
• Collaborated with product managers to deliver features that drove $2M in additional revenue

Your job posting particularly resonated with me because of TechCorp's commitment to cutting-edge technology and user-centric design. I am especially drawn to your recent work on AI-powered solutions, which aligns perfectly with my passion for emerging technologies and my experience implementing machine learning features in production applications.

I would welcome the opportunity to discuss how my technical expertise and leadership experience can contribute to TechCorp's continued success. Thank you for considering my application.

Best regards,
John Smith`

export function CoverLetterTab() {
  const [jobTitle, setJobTitle] = useState("Senior Software Engineer")
  const [company, setCompany] = useState("TechCorp")
  const [jobDescription, setJobDescription] = useState(
    "We're looking for a Senior Software Engineer to join our team...",
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2500))
    setIsGenerating(false)
    setShowResults(true)
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="job-title-cl">Job Title</Label>
              <Input
                id="job-title-cl"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
              />
            </div>
            <div>
              <Label htmlFor="company-cl">Company</Label>
              <Input
                id="company-cl"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g., TechCorp"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="job-description-cl">Job Description (Optional)</Label>
            <Textarea
              id="job-description-cl"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here for a more tailored cover letter..."
              className="min-h-[150px]"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !jobTitle.trim() || !company.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Cover Letter...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Cover Letter
              </>
            )}
          </Button>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <AnimatePresence>
            {showResults && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card className="border-blue-200 dark:border-blue-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Generated Cover Letter
                    </CardTitle>
                    <CardDescription>
                      Personalized for {jobTitle} at {company}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg max-h-[400px] overflow-y-auto">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {sampleCoverLetter.split("\n").map((paragraph, index) => (
                          <p key={index} className="mb-3 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Button variant="outline" size="sm">
                        Copy to Clipboard
                      </Button>
                      <Button variant="outline" size="sm">
                        Download PDF
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {!showResults && (
            <Card className="border-dashed border-2 border-slate-200 dark:border-slate-700">
              <CardContent className="flex items-center justify-center h-[400px] text-center">
                <div className="space-y-2">
                  <MessageSquare className="h-12 w-12 text-slate-400 mx-auto" />
                  <p className="text-slate-500 dark:text-slate-400">Generated cover letter will appear here</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
