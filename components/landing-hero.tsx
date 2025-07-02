import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, Sparkles } from "lucide-react"

export function LandingHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/30">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container relative z-10 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <Badge className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white border-0 px-6 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />🚀 Stop Getting Rejected. Start Getting Hired.
            </Badge>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[0.9]">
            <span className="block mb-4">Land Your</span>
            <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 bg-clip-text text-transparent">
              Dream Job
            </span>
            <span className="block mt-4 text-4xl md:text-5xl lg:text-6xl">with AI-Crafted</span>
            <span className="block mt-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Resumes & Cover Letters
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
            While you're getting rejected, smart job seekers are using AI to get{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
              3x more interviews
            </span>
            . Don't get left behind.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 px-8 py-4 text-lg font-semibold shadow-2xl hover:scale-105 transition-all duration-300"
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
              className="border-2 border-purple-200 hover:border-purple-300 bg-white/80 backdrop-blur-sm hover:bg-white text-purple-700 px-8 py-4 text-lg font-semibold shadow-lg hover:scale-105 transition-all duration-300"
            >
              <Link href="#demo" className="flex items-center">
                <Play className="mr-2 h-5 w-5" />
                See How It Works
              </Link>
            </Button>
          </div>

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
        </div>
      </div>
    </section>
  )
}
