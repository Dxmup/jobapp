import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import dynamic from "next/dynamic"

// Replace the existing import
// import { RotatingText } from "./rotating-text"

// Add dynamic import with loading component
const RotatingText = dynamic(() => import("./rotating-text").then((mod) => ({ default: mod.RotatingText })), {
  loading: () => <span className="inline-block min-w-[180px] h-8 bg-muted animate-pulse rounded" />,
  ssr: false,
})

// Replace the existing import
// import { HeroDemoTabs } from "./landing/hero-demo-tabs"

// Add dynamic import with loading component
const HeroDemoTabs = dynamic(() => import("./landing/hero-demo-tabs").then((mod) => ({ default: mod.HeroDemoTabs })), {
  loading: () => (
    <div className="mt-16 max-w-6xl mx-auto">
      <div className="animate-pulse space-y-6">
        <div className="text-center space-y-4">
          <div className="h-8 bg-gray-200 rounded-md w-3/4 mx-auto"></div>
          <div className="h-6 bg-gray-200 rounded-md w-full mx-auto"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  ),
  ssr: false,
})

export function LandingHero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-[0.07]" />
      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="mb-4 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 hover:bg-purple-100 dark:hover:bg-purple-900">
            Stop Getting Rejected. Start Getting Hired.
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Land Your Dream Job with{" "}
            <span className="bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
              AI-Crafted
              <br />
              <RotatingText />
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            While you're getting rejected, smart job seekers are using AI to get 3x more interviews. Don't get left
            behind.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">See How It Works</Link>
            </Button>
          </div>

          {/* Interactive Demo Section */}
          <div className="mt-16">
            <HeroDemoTabs />
          </div>
        </div>
      </div>
    </section>
  )
}
