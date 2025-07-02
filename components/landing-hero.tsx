import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import dynamic from "next/dynamic"
import { ArrowRight, Play, Sparkles } from "lucide-react"

// Optimized dynamic imports with better loading states
const RotatingText = dynamic(() => import("./rotating-text").then((mod) => ({ default: mod.RotatingText })), {
  loading: () => (
    <span className="inline-block min-w-[200px] h-12 bg-gradient-to-r from-purple-200 to-cyan-200 animate-pulse rounded-lg" />
  ),
  ssr: false,
})

const EnhancedHeroDemoTabs = dynamic(
  () => import("./landing/enhanced-hero-demo-tabs").then((mod) => ({ default: mod.EnhancedHeroDemoTabs })),
  {
    loading: () => (
      <div className="mt-20 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="text-center space-y-4">
            <div className="h-10 bg-gradient-to-r from-purple-200 to-cyan-200 rounded-xl w-3/4 mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded-lg w-full mx-auto"></div>
          </div>
          <div className="h-[500px] bg-gradient-to-br from-purple-50 to-cyan-50 rounded-2xl border-2 border-dashed border-purple-200"></div>
        </div>
      </div>
    ),
    ssr: false,
  },
)

export default function LandingHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/30">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-yellow-300/10 to-orange-300/10 rounded-full blur-3xl animate-pulse delay-2000" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="container relative z-10 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Floating badge */}
          <div className="mb-8 flex justify-center">
            <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white border-0 px-6 py-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Sparkles className="w-4 h-4 mr-2" />🚀 Stop Getting Rejected. Start Getting Hired.
            </Badge>
          </div>

          {/* Main headline with enhanced typography */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[0.9]">
            <span className="block mb-4">Land Your</span>
            <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 bg-clip-text text-transparent relative">
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 blur-2xl opacity-30 animate-pulse"></span>
              Dream Job
            </span>
            <span className="block mt-4 text-4xl md:text-5xl lg:text-6xl">with AI-Crafted</span>
            <div className="mt-4">
              <RotatingText />
            </div>
          </h1>

          {/* Enhanced subtitle */}
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
            While you're getting rejected, smart job seekers are using AI to get{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
              3x more interviews
            </span>
            . Don't get left behind.
          </p>

          {/* Enhanced CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 group"
            >
              <Link href="/signup" className="flex items-center">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-2 border-purple-200 hover:border-purple-300 bg-white/80 backdrop-blur-sm hover:bg-white text-purple-700 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
            >
              <Link href="#demo" className="flex items-center">
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                See How It Works
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mb-20">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium">
              Trusted by 12,000+ job seekers worldwide
            </p>
            <div className="flex justify-center items-center gap-8 opacity-60 hover:opacity-80 transition-opacity">
              <div className="text-2xl font-bold text-slate-400">Google</div>
              <div className="text-2xl font-bold text-slate-400">Meta</div>
              <div className="text-2xl font-bold text-slate-400">Apple</div>
              <div className="text-2xl font-bold text-slate-400">Netflix</div>
              <div className="text-2xl font-bold text-slate-400">Amazon</div>
            </div>
          </div>

          {/* Interactive Demo Section */}
          <div id="demo" className="scroll-mt-20">
            <EnhancedHeroDemoTabs />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-slate-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}
