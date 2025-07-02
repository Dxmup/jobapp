import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Sparkles, FileText, MessageSquare, Target, Calendar, CheckCircle } from "lucide-react"

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob dark:bg-purple-600 dark:opacity-30" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 dark:bg-cyan-600 dark:opacity-30" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 dark:bg-pink-600 dark:opacity-30" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  JobCraft AI
                </span>
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Coming Soon
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
                Something Amazing
              </span>
              <br />
              <span className="text-slate-900 dark:text-slate-100">Is On The Way</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
              We're putting the finishing touches on our revolutionary AI-powered job application platform. Get ready to
              transform your career journey with intelligent automation.
            </p>
          </div>

          {/* Feature Preview Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle>AI Resume Optimization</CardTitle>
                <CardDescription>
                  Automatically tailor your resume for each job application using advanced AI analysis
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Smart Cover Letters</CardTitle>
                <CardDescription>
                  Generate compelling, personalized cover letters that match your experience to job requirements
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Interview Preparation</CardTitle>
                <CardDescription>
                  Practice with AI-powered mock interviews tailored to your specific job applications
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Waitlist Signup */}
          <div className="max-w-md mx-auto mb-16">
            <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-800/90 border-slate-200/50 dark:border-slate-700/50">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Join the Waitlist
                </CardTitle>
                <CardDescription>Be the first to know when we launch and get exclusive early access</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    className="bg-white/50 dark:bg-slate-900/50"
                  />
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Early Access
                  </Button>
                </form>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
                  No spam, ever. Unsubscribe at any time.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Launch Timeline */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8 text-slate-900 dark:text-slate-100">Launch Timeline</h2>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Phase 1: Core Platform</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Basic job tracking and resume management - Completed
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Phase 2: AI Integration</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    AI-powered resume optimization and cover letter generation - In Progress
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Phase 3: Public Launch</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Full platform with interview prep and analytics - Coming Soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400">
                © 2024 JobCraft AI. Building the future of job applications.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
