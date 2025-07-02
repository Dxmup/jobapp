"use client"

import { FileText, FileEdit, FolderKanban, BarChart, Sparkles, Zap } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

export function LandingFeatures() {
  const features = [
    {
      icon: <FileText className="h-12 w-12" />,
      title: "AI Resume Optimization",
      description:
        "Upload your resume and our AI will optimize it for each job application, highlighting relevant skills and experience.",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
      video: "/videos/resume-revision.webm",
    },
    {
      icon: <FileEdit className="h-12 w-12" />,
      title: "Custom Cover Letters",
      description:
        "Generate tailored cover letters in seconds. Adjust tone, length, and formality to match the company culture.",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
      video: "/videos/cover-letter-demo.webm",
    },
    {
      icon: <BarChart className="h-12 w-12" />,
      title: "Interview Preparation",
      description: "Be ready for any question your interviewer might ask with unlimited job specific questions.",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
      video: "/videos/interview-questions.webm",
    },
    {
      icon: <FolderKanban className="h-12 w-12" />,
      title: "Job Application Tracking",
      description: "Organize your job applications by status: drafting, applied, interviewing, offer, or rejected.",
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
    },
    {
      icon: <Sparkles className="h-12 w-12" />,
      title: "Custom AI Engines",
      description: "Each stage of the job hunt is powered by our custom AI engines.",
      gradient: "from-yellow-500 to-orange-500",
      bgGradient: "from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20",
    },
    {
      icon: <Zap className="h-12 w-12" />,
      title: "Lightning Fast Results",
      description:
        "Custom Thank You letters, follow up reminders, and other actionable steps to stand out from the crowd.",
      gradient: "from-indigo-500 to-purple-500",
      bgGradient: "from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20",
    },
  ]

  return (
    <section
      id="features"
      className="py-32 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/30 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Transform Your Career Journey
              </span>
              <motion.span
                className="inline-block ml-4"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
              >
                🚀
              </motion.span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Our AI-powered tools help you create professional application materials tailored to each job opportunity.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto max-w-7xl">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group cursor-pointer"
            >
              <Card
                className={`h-full bg-gradient-to-br ${feature.bgGradient} border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative`}
              >
                <CardContent className="p-8 relative z-10">
                  {/* Icon with gradient */}
                  <div
                    className={`mb-6 p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white w-fit group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    {feature.icon}
                  </div>

                  <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-slate-900 group-hover:to-slate-600 dark:group-hover:from-white dark:group-hover:to-slate-300 transition-all duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">{feature.description}</p>

                  {/* Video preview for supported features */}
                  {feature.video && (
                    <div className="mt-6 rounded-lg overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <video className="w-full h-32 object-cover rounded-lg" autoPlay muted loop playsInline>
                        <source src={feature.video} type="video/webm" />
                      </video>
                    </div>
                  )}
                </CardContent>

                {/* Hover effect overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">Ready to transform your job search?</p>
          <motion.button
            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Free
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
