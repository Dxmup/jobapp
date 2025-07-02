import { LandingHeader } from "@/components/landing-header"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Sparkles, Zap, Target, Users } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/30" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

        {/* Animated Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <LandingHeader />

      <main className="flex-1 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-6 bg-gradient-to-r from-purple-100 to-cyan-100 text-purple-700 border-purple-200"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Coming Soon
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-cyan-600 bg-clip-text text-transparent mb-6">
            Get Ready for the Future of
            <br />
            <span className="text-5xl md:text-7xl">Job Applications</span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
            JobCraft AI is launching soon with revolutionary AI-powered tools to transform your job search. Be among the
            first to experience the future of career advancement.
          </p>
        </div>

        {/* Waitlist Form */}
        <Card className="max-w-md mx-auto mb-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Join the Waitlist
            </CardTitle>
            <CardDescription>Be the first to know when we launch and get exclusive early access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="border-purple-200 focus:border-purple-400"
              />
            </div>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
              <Zap className="w-4 h-4 mr-2" />
              Get Early Access
            </Button>
            <p className="text-xs text-slate-500 text-center">
              No spam, unsubscribe at any time. We respect your privacy.
            </p>
          </CardContent>
        </Card>

        {/* Feature Preview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
            What's Coming
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-800">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <CardTitle>AI Resume Optimization</CardTitle>
                <CardDescription>
                  Automatically tailor your resume for each job application with advanced AI analysis
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-800">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Smart Cover Letters</CardTitle>
                <CardDescription>
                  Generate personalized, compelling cover letters that match your voice and the job requirements
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-800">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Live Interview Prep</CardTitle>
                <CardDescription>
                  Practice with AI-powered mock interviews that adapt to your industry and experience level
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Launch Timeline */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Launch Timeline
          </h2>

          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">Phase 1: Core Platform</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Basic job tracking and resume management - Completed
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Complete
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white animate-spin" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400">Phase 2: AI Integration</h3>
                <p className="text-slate-600 dark:text-slate-300">Resume optimization and cover letter generation</p>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                In Progress
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400">Phase 3: Advanced Features</h3>
                <p className="text-slate-600 dark:text-slate-300">Live interview prep and advanced analytics</p>
              </div>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">Already have an account?</p>
          <Link href="/login">
            <Button variant="outline" size="lg" className="border-purple-200 hover:border-purple-400 bg-transparent">
              Sign In Instead
            </Button>
          </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
