"use client"

import dynamic from "next/dynamic"

// Optimize loading with better fallbacks
export const LandingFeatures = dynamic(
  () => import("@/components/landing-features").then((mod) => ({ default: mod.LandingFeatures })),
  {
    loading: () => (
      <section className="py-32 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/30">
        <div className="container">
          <div className="text-center mb-20">
            <div className="h-12 bg-gradient-to-r from-slate-200 to-slate-300 animate-pulse rounded-2xl mb-6 max-w-2xl mx-auto" />
            <div className="h-8 bg-slate-200 animate-pulse rounded-xl max-w-4xl mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto max-w-7xl">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border p-8 shadow-xl">
                <div className="h-12 w-12 bg-gradient-to-r from-purple-200 to-cyan-200 animate-pulse rounded-2xl mb-6" />
                <div className="h-8 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 animate-pulse rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    ssr: false,
  },
)

export const MagneticCursor = dynamic(
  () => import("@/components/animations/magnetic-cursor").then((mod) => ({ default: mod.MagneticCursor })),
  {
    ssr: false,
  },
)
