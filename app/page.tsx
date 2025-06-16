import { LandingHero } from "@/components/landing-hero"
import { LandingPricing } from "@/components/landing-pricing"
import { LandingHeader } from "@/components/landing-header"
import { LandingFooter } from "@/components/landing-footer"
import dynamic from "next/dynamic"

const LandingFeatures = dynamic(
  () => import("@/components/landing-features").then((mod) => ({ default: mod.LandingFeatures })),
  {
    loading: () => (
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <div className="h-8 bg-muted animate-pulse rounded mb-4 max-w-md mx-auto" />
            <div className="h-6 bg-muted animate-pulse rounded max-w-2xl mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto max-w-7xl">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-background rounded-lg border p-6">
                <div className="h-10 w-10 bg-muted animate-pulse rounded mb-4" />
                <div className="h-6 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 bg-muted animate-pulse rounded mb-1" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    ssr: false,
  },
)

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingPricing />
      </main>
      <LandingFooter />
    </div>
  )
}
