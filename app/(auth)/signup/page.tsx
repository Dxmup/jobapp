import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Mail, Bell, Users } from "lucide-react"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/50 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center group">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 mr-3 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                JobCraft AI
              </span>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative py-32 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/30 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />

          {/* Gradient Blobs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000" />

          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Coming Soon Badge */}
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-purple-900/30 dark:to-cyan-900/30 border border-purple-200 dark:border-purple-800 mb-8">
                <Bell className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Coming Soon</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl font-black mb-8 bg-gradient-to-r from-slate-900 via-purple-800 to-cyan-600 dark:from-slate-100 dark:via-purple-300 dark:to-cyan-400 bg-clip-text text-transparent leading-tight">
                We're Building Something
                <br />
                <span className="bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                  Amazing
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                JobCraft AI is preparing to revolutionize your job search experience. Get ready for AI-powered resume
                optimization, intelligent cover letter generation, and personalized interview preparation.
              </p>

              {/* Features Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
                <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/20 dark:border-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">AI Resume Optimization</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Intelligent resume tailoring for each job application
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/20 dark:border-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Smart Cover Letters</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Personalized cover letters that get you noticed
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/20 dark:border-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Interview Prep</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      AI-powered mock interviews and feedback
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* CTA Section */}
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/50 p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Be the First to Know</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Join our waitlist to get early access and exclusive updates about JobCraft AI's launch.
                </p>

                {/* Email Signup Form */}
                <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 px-8"
                  >
                    Join Waitlist
                  </Button>
                </form>
              </div>

              {/* Back to Home */}
              <div className="mt-12">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 bg-transparent"
                >
                  <Link href="/">← Back to Home</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Launch Timeline
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-12">
                Here's what we're working on and when you can expect it
              </p>

              <div className="space-y-8">
                <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                  <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Phase 1: Core Platform</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Basic resume optimization and job tracking - Completed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 animate-pulse" />
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Phase 2: AI Enhancement</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Advanced AI features and interview prep - In Progress
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                  <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Phase 3: Public Launch</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Open registration and full feature set - Coming Soon
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                JobCraft AI
              </span>
            </div>
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} JobCraft AI. Coming Soon.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
