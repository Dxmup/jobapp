"use client"

import dynamic from "next/dynamic"

// Dynamic imports with loading states
export const LandingFeatures = dynamic(() => import("@/components/landing-features"), {
  loading: () => (
    <div className="py-32">
      <div className="container">
        <div className="animate-pulse space-y-8">
          <div className="text-center space-y-4">
            <div className="h-12 bg-gradient-to-r from-purple-200 to-cyan-200 rounded-xl w-3/4 mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded-lg w-full mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gradient-to-br from-purple-50 to-cyan-50 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
  ssr: false,
})

export const MagneticCursor = dynamic(() => import("@/components/animations/magnetic-cursor"), {
  loading: () => null,
  ssr: false,
})
