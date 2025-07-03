import { LandingHero } from "@/components/landing-hero"
import { LandingPricing } from "@/components/landing-pricing"
import { LandingHeader } from "@/components/landing-header"
import { LandingFooter } from "@/components/landing-footer"
import { SocialProofSection } from "@/components/landing/social-proof-section"
import { ClientLandingFeatures } from "@/components/client-landing-features"
import { ClientMagneticCursor } from "@/components/client-magnetic-cursor"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <ClientMagneticCursor />
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <ClientLandingFeatures />
        <SocialProofSection />
        <LandingPricing />
      </main>
      <LandingFooter />
    </div>
  )
}
