"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Loader2, Mail, Sparkles, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSuccess(false)

    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        setEmail("") // Clear email input on success
      } else {
        setError(data.error || "Failed to join waitlist. Please try again.")
      }
    } catch (err) {
      console.error("Waitlist submission error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-slate-950 dark:to-purple-950/30 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 max-w-6xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
        {/* Left side - Visuals and Testimonial */}
        <div className="relative hidden lg:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-purple-600 to-cyan-600 text-white overflow-hidden">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(/abstract-geometric-shapes.png)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.15,
            }}
          />
          <div className="relative z-10 text-center space-y-6">
            <h2 className="text-4xl font-extrabold tracking-tight">Join the Future of Job Seeking</h2>
            <p className="text-lg opacity-90">Get early access to AI-powered tools that transform your job search.</p>
            <div className="mt-8">
              <img
                src="/placeholder-user.jpg"
                alt="Testimonial user"
                className="w-20 h-20 rounded-full mx-auto border-4 border-white/30 shadow-lg"
              />
              <p className="mt-4 text-lg font-semibold">
                "JobCraft AI helped me land my dream job faster than I ever thought possible!"
              </p>
              <p className="text-sm opacity-80">- Sarah J., Marketing Manager</p>
            </div>
          </div>
        </div>

        {/* Right side - Coming Soon / Waitlist Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <img src="/placeholder-logo.svg" alt="JobCraft AI Logo" className="h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Coming Soon!</h2>
            <p className="text-slate-600 dark:text-slate-400">
              We're working hard to bring you the best AI-powered job application assistant.
            </p>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">
                Be the first to know when we launch!
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="sr-only">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    disabled={isSubmitting || isSuccess}
                  />
                </div>
                {error && <p className="text-red-500 text-sm text-left">{error}</p>}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white py-3 rounded-lg text-lg font-semibold shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || isSuccess}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Joining...
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" /> Joined!
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-5 w-5" /> Join Our Waitlist
                    </>
                  )}
                </Button>
              </form>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">We respect your privacy. No spam, ever.</p>
            </div>

            <div className="mt-8 text-center">
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">What's Coming:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-sm flex flex-col items-center text-center">
                  <Sparkles className="h-8 w-8 text-purple-500 mb-2" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">AI Resume Optimization</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-sm flex flex-col items-center text-center">
                  <Mail className="h-8 w-8 text-cyan-500 mb-2" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">Automated Cover Letters</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-sm flex flex-col items-center text-center">
                  <MessageSquare className="h-8 w-8 text-green-500 mb-2" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">AI Interview Practice</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
