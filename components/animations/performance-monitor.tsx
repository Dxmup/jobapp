"use client"

import { useEffect, useState } from "react"

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<{
    lcp: number | null
    fid: number | null
    cls: number | null
  }>({
    lcp: null,
    fid: null,
    cls: null,
  })

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== "development") return

    // Largest Contentful Paint
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number }
      setMetrics((prev) => ({
        ...prev,
        lcp: lastEntry.renderTime || lastEntry.loadTime || 0,
      }))
    })

    try {
      observer.observe({ entryTypes: ["largest-contentful-paint"] })
    } catch (e) {
      // Ignore if not supported
    }

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        setMetrics((prev) => ({
          ...prev,
          fid: entry.processingStart - entry.startTime,
        }))
      })
    })

    try {
      fidObserver.observe({ entryTypes: ["first-input"] })
    } catch (e) {
      // Ignore if not supported
    }

    return () => {
      observer.disconnect()
      fidObserver.disconnect()
    }
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== "development") return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div>LCP: {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : "Loading..."}</div>
      <div>FID: {metrics.fid ? `${Math.round(metrics.fid)}ms` : "N/A"}</div>
      <div>CLS: {metrics.cls ? metrics.cls.toFixed(3) : "N/A"}</div>
    </div>
  )
}
