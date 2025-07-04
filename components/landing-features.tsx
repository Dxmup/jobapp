"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, MessageSquare, Target, Zap, Brain, CheckCircle, Users, TrendingUp, Clock } from "lucide-react"

const features = [
  {
    icon: FileText,
    title: "AI Resume Optimization",
    description: "Transform your resume with AI-powered suggestions tailored to specific job descriptions.",
    badge: "Most Popular",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: MessageSquare,
    title: "Cover Letter Generator",
    description: "Generate compelling, personalized cover letters that highlight your unique value proposition.",
    badge: "New",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Target,
    title: "Interview Preparation",
    description: "Practice with AI-generated questions specific to your target role and industry.",
    badge: "Popular",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Brain,
    title: "Smart Job Matching",
    description: "Find opportunities that align with your skills, experience, and career goals.",
    badge: "Coming Soon",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: TrendingUp,
    title: "Application Tracking",
    description: "Monitor your job applications and get insights on your job search progress.",
    badge: "Essential",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Zap,
    title: "Quick Apply",
    description: "Apply to multiple jobs quickly with pre-filled applications and optimized documents.",
    badge: "Time Saver",
    color: "from-yellow-500 to-orange-500",
  },
]

const stats = [
  { icon: Users, value: "10,000+", label: "Job Seekers Helped" },
  { icon: CheckCircle, value: "85%", label: "Success Rate" },
  { icon: Clock, value: "50%", label: "Faster Applications" },
  { icon: TrendingUp, value: "3x", label: "More Interviews" },
]

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="py-24 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/30"
    >
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <Badge variant="outline" className="mb-4">
            Powerful Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 dark:from-slate-100 dark:via-purple-100 dark:to-slate-100 bg-clip-text text-transparent">
            Everything you need to land your dream job
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our AI-powered platform provides comprehensive tools to optimize every aspect of your job search journey.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-2">
                <stat.icon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-3 rounded-2xl bg-gradient-to-r ${feature.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
