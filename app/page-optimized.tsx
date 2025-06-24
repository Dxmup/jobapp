import { LandingHeroOptimized } from "@/components/landing-hero-optimized"
import { LandingPricing } from "@/components/landing-pricing"
import { LandingHeader } from "@/components/landing-header"
import { LandingFooter } from "@/components/landing-footer"
import { SocialProofSection } from "@/components/landing/social-proof-section"
import { LandingFeaturesOptimized } from "@/components/landing-features-optimized"

export default function HomeOptimized() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-1">
        <LandingHeroOptimized />
        <LandingFeaturesOptimized />
        <SocialProofSection />
        <LandingPricing />
      </main>
      <LandingFooter />
    </div>
  )
}
