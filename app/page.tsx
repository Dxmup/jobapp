import { Suspense } from "react"
import LandingHeader from "@/components/landing-header"
import LandingHero from "@/components/landing-hero"
import { LandingFeatures, MagneticCursor, InteractiveBackground } from "./client-components"
import LandingPricing from "@/components/landing-pricing"
import LandingFooter from "@/components/landing-footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Interactive Background */}
      <InteractiveBackground />

      {/* Magnetic Cursor */}
      <MagneticCursor />

      {/* Header */}
      <LandingHeader />

      {/* Hero Section */}
      <LandingHero />

      {/* Features Section */}
      <Suspense
        fallback={
          <div className="py-24 bg-gradient-to-br from-slate-50 to-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-6 shadow-sm border">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4 animate-pulse" />
                    <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      >
        <LandingFeatures />
      </Suspense>

      {/* Pricing Section */}
      <LandingPricing />

      {/* Footer */}
      <LandingFooter />
    </div>
  )
}
