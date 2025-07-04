import { LandingHero } from "@/components/landing-hero"
import { LandingFeatures } from "@/components/landing-features"
import { LandingPricing } from "@/components/landing-pricing"
import { LandingHeader } from "@/components/landing-header"
import { LandingFooter } from "@/components/landing-footer"
import { SocialProofSection } from "@/components/landing/social-proof-section"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <SocialProofSection />
        <LandingPricing />
      </main>
      <LandingFooter />
    </div>
  )
}
