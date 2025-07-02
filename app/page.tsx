import { Suspense } from "react"
import LandingHeader from "@/components/landing-header"
import LandingHero from "@/components/landing-hero"
import LandingPricing from "@/components/landing-pricing"
import LandingFooter from "@/components/landing-footer"
import { LandingFeatures, MagneticCursor } from "./client-components"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main>
        <LandingHero />
        <Suspense fallback={<div className="h-96 animate-pulse bg-gradient-to-r from-purple-50 to-cyan-50" />}>
          <LandingFeatures />
        </Suspense>
        <LandingPricing />
      </main>
      <LandingFooter />
      <Suspense fallback={null}>
        <MagneticCursor />
      </Suspense>
    </div>
  )
}
