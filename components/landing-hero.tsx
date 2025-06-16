"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import dynamic from "next/dynamic"

// Lazy load heavy components
const RotatingText = dynamic(
  () => import("@/components/rotating-text").then((mod) => ({ default: mod.RotatingText })),
  {
    loading: () => <span className="inline-block min-w-[180px] h-8 bg-muted animate-pulse rounded" />,
    ssr: false,
  },
)

const HeroDemoTabs = dynamic(
  () => import("@/components/landing/hero-demo-tabs").then((mod) => ({ default: mod.HeroDemoTabs })),
  {
    loading: () => (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-background rounded-lg border p-8">
          <div className="flex space-x-1 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded flex-1" />
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-muted animate-pulse rounded" />
            <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-6 bg-muted animate-pulse rounded w-1/2" />
          </div>
        </div>
      </div>
    ),
    ssr: false,
  },
)

export function LandingHero() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-cyan-50/50 dark:from-purple-950/20 dark:to-cyan-950/20" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-200/20 dark:bg-purple-800/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-200/20 dark:bg-cyan-800/20 rounded-full blur-3xl" />

      <div className="container relative">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 hover:bg-purple-100 dark:hover:bg-purple-900">
            Stop Getting Rejected. Start Getting Hired.
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Land Your Dream Job with{" "}
            <span className="block">
              AI-Powered <RotatingText />
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto mb-8">
            Transform your job search with intelligent resume optimization, personalized cover letters, and interview
            preparation tailored to each opportunity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="#features">See How It Works</Link>
            </Button>
          </div>
        </div>

        {/* Interactive Demo */}
        <HeroDemoTabs />
      </div>
    </section>
  )
}
