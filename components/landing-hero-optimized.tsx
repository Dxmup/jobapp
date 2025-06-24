import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, Sparkles } from "lucide-react"
import { Suspense } from "react"

// Lightweight rotating text without heavy animations
function SimpleRotatingText() {
  return (
    <span className="inline-block min-w-[200px] text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 bg-clip-text animate-pulse">
      Applications
    </span>
  )
}

// Lightweight demo tabs fallback
function SimpleDemoPreview() {
  return (
    <div className="mt-20 max-w-6xl mx-auto">
      <div className="text-center space-y-6">
        <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300">See AI in Action</h3>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border shadow-xl p-8 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h4 className="text-xl font-semibold">Resume Optimization</h4>
              <p className="text-slate-600 dark:text-slate-300">
                Upload your resume and watch our AI transform it for each job application.
              </p>
              <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white">Try Demo</Button>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-purple-950/20 dark:to-cyan-950/20 rounded-xl p-6 h-48 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">AI Processing...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LandingHeroOptimized() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/30">
      {/* Simplified background - CSS only, no JS */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
      </div>

      <div className="container relative z-10 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Simplified badge */}
          <div className="mb-8 flex justify-center">
            <Badge className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white border-0 px-6 py-2 text-sm font-medium shadow-lg">
              <Sparkles className="w-4 h-4 mr-2" />🚀 Stop Getting Rejected. Start Getting Hired.
            </Badge>
          </div>

          {/* Optimized headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[0.9]">
            <span className="block mb-4">Land Your</span>
            <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 bg-clip-text text-transparent">
              Dream Job
            </span>
            <span className="block mt-4 text-4xl md:text-5xl lg:text-6xl">with AI-Crafted</span>
            <div className="mt-4">
              <SimpleRotatingText />
            </div>
          </h1>

          {/* Simplified subtitle */}
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
            While you're getting rejected, smart job seekers are using AI to get{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
              3x more interviews
            </span>
            . Don't get left behind.
          </p>

          {/* Simplified CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 px-8 py-4 text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <Link href="/signup" className="flex items-center">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-2 border-purple-200 hover:border-purple-300 bg-white/80 backdrop-blur-sm hover:bg-white text-purple-700 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="#demo" className="flex items-center">
                <Play className="mr-2 h-5 w-5" />
                See How It Works
              </Link>
            </Button>
          </div>

          {/* Simplified trust indicators */}
          <div className="mb-20">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium">
              Trusted by 12,000+ job seekers worldwide
            </p>
            <div className="flex justify-center items-center gap-8 opacity-60">
              <div className="text-2xl font-bold text-slate-400">Google</div>
              <div className="text-2xl font-bold text-slate-400">Meta</div>
              <div className="text-2xl font-bold text-slate-400">Apple</div>
              <div className="text-2xl font-bold text-slate-400">Netflix</div>
              <div className="text-2xl font-bold text-slate-400">Amazon</div>
            </div>
          </div>

          {/* Simplified demo section */}
          <div id="demo" className="scroll-mt-20">
            <Suspense fallback={<div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />}>
              <SimpleDemoPreview />
            </Suspense>
          </div>
        </div>
      </div>

      {/* CSS-only scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center animate-bounce">
          <div className="w-1 h-3 bg-slate-400 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  )
}
