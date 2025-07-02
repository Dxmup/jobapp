"use client"

import dynamic from "next/dynamic"

// Dynamic imports with SSR disabled for client-only components
export const LandingFeatures = dynamic(() => import("@/components/landing-features"), {
  ssr: false,
  loading: () => (
    <div className="py-24 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4 max-w-md mx-auto"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse max-w-2xl mx-auto"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mb-4"></div>
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
})

export const MagneticCursor = dynamic(() => import("@/components/animations/magnetic-cursor"), {
  ssr: false,
  loading: () => null,
})

export const InteractiveBackground = dynamic(() => import("@/components/animations/interactive-background"), {
  ssr: false,
  loading: () => null,
})

export const FloatingElements = dynamic(() => import("@/components/animations/floating-elements"), {
  ssr: false,
  loading: () => null,
})
