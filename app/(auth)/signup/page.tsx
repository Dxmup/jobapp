"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Clock, Sparkles, Zap, Target, Users, ArrowLeft, Loader2, Mail } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setError("This email is already on our waitlist!")
        } else {
          setError(data.error || "Something went wrong. Please try again.")
        }
        return
      }

      setIsSubmitted(true)
      setEmail("")
    } catch (err) {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side with gradient - matching landing page style */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: "linear-gradient(135deg, rgb(147, 51, 234) 0%, rgb(6, 182, 212) 100%)",
            zIndex: 0,
          }}
        />

        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
          <div
            className="absolute bottom-32 right-16 w-24 h-24 bg-cyan-300/20 rounded-full blur-lg animate-bounce"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-8 w-16 h-16 bg-purple-300/20 rounded-full blur-md animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="relative z-10 flex flex-col h-full p-10 text-white">
          <div className="flex items-center text-lg font-medium">
            <Link href="/" className="flex items-center group">
              <div className="p-2 rounded-xl bg-white/20 mr-3 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">JobCraft AI</span>
            </Link>
          </div>

          <div className="mt-auto space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">The Future of Job Applications</h2>
              <p className="text-lg text-white/90 leading-relaxed">
                We're building something revolutionary that will transform how you approach your career. AI-powered
                tools that understand your unique strengths and help you land your dream job.
              </p>
            </div>

            <blockquote className="space-y-3 border-l-4 border-white/30 pl-6">
              <p className="text-lg italic text-white/95">
                "The early preview completely changed my job search strategy. I can't wait for the full launch!"
              </p>
              <footer className="text-sm text-white/80">Sarah Chen, Beta Tester</footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Right side with coming soon content */}
      <div className="flex-1 lg:w-1/2 flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
        {/* Mobile header */}
        <div className="lg:hidden p-4 border-b bg-white/80 backdrop-blur-sm">
          <Link href="/" className="flex items-center group">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 mr-3 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
              JobCraft AI
            </span>
          </Link>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-full">
            <div className="w-full max-w-lg space-y-8 py-4">
              {/* Back to home link */}
              <div className="text-center">
                <Link
                  href="/"
                  className="inline-flex items-center text-sm text-slate-600 hover:text-purple-600 transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Home
                </Link>
              </div>

              {/* Coming Soon Badge */}
              <div className="text-center">
                <Badge
                  variant="secondary"
                  className="mb-6 bg-gradient-to-r from-purple-100 to-cyan-100 text-purple-700 border-purple-200 px-4 py-2"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Coming Soon
                </Badge>

                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-cyan-600 bg-clip-text text-transparent mb-4">
                  Get Ready for Launch
                </h1>

                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  JobCraft AI is launching soon with revolutionary AI-powered tools to transform your job search. Be
                  among the first to experience the future of career advancement.
                </p>
              </div>

              {/* Waitlist Form */}
              {!isSubmitted ? (
                <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                      <Mail className="w-5 h-5 text-purple-600" />
                      Join Our Waitlist
                    </CardTitle>
                    <CardDescription>
                      Be the first to know when we launch and get exclusive early access
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="border-purple-200 focus:border-purple-400"
                          disabled={isSubmitting}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting || !email}
                        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Joining Waitlist...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Join Waitlist
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-center text-slate-500">
                        No spam, unsubscribe at any time. We respect your privacy.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-700 mb-2">You're on the list!</h3>
                        <p className="text-green-600">
                          Thanks for joining our waitlist. We'll notify you as soon as JobCraft AI launches.
                        </p>
                      </div>
                      <Button
                        onClick={() => setIsSubmitted(false)}
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        Add Another Email
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Feature Preview Cards */}
              <div className="space-y-4">
                <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">AI Resume Optimization</CardTitle>
                        <CardDescription className="text-sm">
                          Automatically tailor your resume for each job application
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Smart Cover Letters</CardTitle>
                        <CardDescription className="text-sm">
                          Generate personalized, compelling cover letters instantly
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Live Interview Prep</CardTitle>
                        <CardDescription className="text-sm">Practice with AI-powered mock interviews</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              {/* Launch Timeline */}
              <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                <CardHeader>
                  <CardTitle className="text-center bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                    Launch Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-green-600">Phase 1: Core Platform</p>
                      <p className="text-sm text-slate-600">Basic job tracking - Complete</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-white animate-spin" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-purple-600">Phase 2: AI Integration</p>
                      <p className="text-sm text-slate-600">Resume optimization & cover letters</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-600">Phase 3: Advanced Features</p>
                      <p className="text-sm text-slate-600">Live interview prep & analytics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA Section */}
              <div className="text-center space-y-4">
                <div className="pt-4">
                  <Link
                    href="/login"
                    className="text-sm text-slate-600 hover:text-purple-600 transition-colors underline underline-offset-4"
                  >
                    Already have an account? Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
