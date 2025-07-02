"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, ChevronDown } from "lucide-react"
import { motion } from "framer-motion"
import { ScrollReveal } from "./animations/scroll-reveal"
import { StatsCounter } from "./animations/stats-counter"
import { TypingEffect } from "./animations/typing-effect"
import { EnhancedHeroDemoTabs } from "./landing/enhanced-hero-demo-tabs"

export function LandingHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-purple-50/30 to-cyan-50/30 dark:from-slate-900 dark:via-purple-950/20 dark:to-cyan-950/20">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-300/10 to-cyan-300/10 rounded-full blur-3xl animate-spin-slow" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-slate-100/50 dark:bg-grid-slate-800/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <div className="container relative z-10 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Hero content */}
          <div className="text-center lg:text-left">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-purple-200/50 dark:border-purple-800/50 mb-8">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  AI-Powered Job Search Assistant
                </span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Land Your
                </span>
                <br />
                <TypingEffect
                  words={["Dream Job", "Next Role", "Perfect Match", "Career Goal"]}
                  className="bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent"
                />
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Transform your job search with AI-powered resume optimization, personalized cover letters, and interview
                preparation that gets results.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.6}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg px-8 py-4"
                  asChild
                >
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-slate-300 dark:border-slate-600 hover:border-purple-400 dark:hover:border-purple-500 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-lg px-8 py-4 hover:scale-105 transition-all duration-300"
                  asChild
                >
                  <Link href="#demo">
                    <Play className="mr-2 h-5 w-5" />
                    See How It Works
                  </Link>
                </Button>
              </div>
            </ScrollReveal>

            {/* Stats */}
            <ScrollReveal delay={0.8}>
              <div className="grid grid-cols-3 gap-8 text-center lg:text-left">
                <div>
                  <StatsCounter end={95} suffix="%" className="text-3xl font-bold text-slate-900 dark:text-white" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Success Rate</p>
                </div>
                <div>
                  <StatsCounter end={10000} suffix="+" className="text-3xl font-bold text-slate-900 dark:text-white" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Jobs Landed</p>
                </div>
                <div>
                  <StatsCounter end={24} suffix="h" className="text-3xl font-bold text-slate-900 dark:text-white" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Avg. Response</p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right column - Demo */}
          <div className="relative">
            <ScrollReveal delay={1.0}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-3xl blur-2xl transform rotate-6" />
                <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 shadow-2xl overflow-hidden">
                  <EnhancedHeroDemoTabs />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Scroll indicator */}
        <ScrollReveal delay={1.2}>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="flex flex-col items-center gap-2 text-slate-600 dark:text-slate-400"
            >
              <span className="text-sm font-medium">Scroll to explore</span>
              <ChevronDown className="h-5 w-5" />
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default LandingHero
