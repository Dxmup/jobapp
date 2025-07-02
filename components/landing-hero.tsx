"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { HeroDemoTabs } from "@/components/landing/hero-demo-tabs"

export function LandingHero() {
  return (
    <section className="relative py-20 md:py-32 lg:py-40 bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-slate-950 dark:to-purple-950/30 overflow-hidden">
      {/* Background elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(/abstract-geometric-shapes.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.1,
        }}
      />
      <motion.div
        initial={{ x: "-100%", rotate: -45 }}
        animate={{ x: "0%", rotate: 0 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        className="absolute top-1/4 left-0 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"
      />
      <motion.div
        initial={{ x: "100%", rotate: 45 }}
        animate={{ x: "0%", rotate: 0 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
        className="absolute bottom-1/4 right-0 w-64 h-64 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"
      />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight"
        >
          Land Your Dream Job with{" "}
          <span className="bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
            AI-Powered Precision
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed font-medium"
        >
          While you're getting rejected, smart job seekers are using AI to get{" "}
          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
            3x more interviews AND practice interviewing using AI.
          </span>
        </motion.p>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
        >
          <Link href="/signup" passHref>
            <Button className="px-8 py-3 text-lg font-semibold rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/dashboard" passHref>
            <Button
              variant="outline"
              className="px-8 py-3 text-lg font-semibold rounded-full border-2 border-purple-500 text-purple-700 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-900/20 transition-all duration-300 transform hover:-translate-y-1 bg-transparent"
            >
              Learn More
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
          className="relative w-full max-w-5xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 md:p-6"
        >
          <HeroDemoTabs />
        </motion.div>
      </div>
    </section>
  )
}
