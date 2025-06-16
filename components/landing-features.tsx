"use client"

import { FileText, FileEdit, FolderKanban, BarChart, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

export function LandingFeatures() {
  const features = [
    {
      icon: <FileText className="h-10 w-10 text-purple-600" />,
      title: "AI Resume Optimization",
      description:
        "Upload your resume and our AI will optimize it for each job application, highlighting relevant skills and experience.",
    },
    {
      icon: <FileEdit className="h-10 w-10 text-cyan-500" />,
      title: "Custom Cover Letters",
      description:
        "Generate tailored cover letters in seconds. Adjust tone, length, and formality to match the company culture.",
    },
    {
      icon: <BarChart className="h-10 w-10 text-cyan-500" />,
      title: "Interview Preparation",
      description: "Be ready for any question your interviewer might ask with unlimited job specific questions.",
    },
    {
      icon: <FolderKanban className="h-10 w-10 text-purple-600" />,
      title: "Job Application Tracking",
      description: "Organize your job applications by status: drafting, applied, interviewing, offer, or rejected.",
    },
    {
      icon: <Sparkles className="h-10 w-10 text-purple-600" />,
      title: "Custom AI Engines",
      description: "Each stage of the job hunt is powered by our custom AI engines.",
    },
    {
      icon: <Sparkles className="h-10 w-10 text-purple-600" />,
      title: "And More...",
      description:
        "Custom Thank You letters, follow up reminders, and other actionable steps to stand out from the crowd.",
    },
  ]

  return (
    <section id="features" className="py-20 bg-muted/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Supercharge Your Job Search</h2>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Our AI-powered tools help you create professional application materials tailored to each job opportunity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto max-w-7xl">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-background rounded-lg border p-6 transition-all hover:shadow-md hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-foreground/70">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
