import dynamic from "next/dynamic"

// Dynamic imports for performance
const LandingHero = dynamic(() => import("@/components/landing-hero"), {
  ssr: true,
})

const LandingFeatures = dynamic(() => import("@/components/landing-features"), {
  ssr: true,
})

const LandingPricing = dynamic(() => import("@/components/landing-pricing"), {
  ssr: true,
})

const LandingHeader = dynamic(() => import("@/components/landing-header"), {
  ssr: true,
})

const LandingFooter = dynamic(() => import("@/components/landing-footer"), {
  ssr: true,
})

const SocialProofSection = dynamic(() => import("@/components/landing/social-proof-section"), {
  ssr: true,
})

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <LandingHeader />
      <main>
        <LandingHero />
        <SocialProofSection />
        <LandingFeatures />
        <LandingPricing />
      </main>
      <LandingFooter />
    </div>
  )
}
