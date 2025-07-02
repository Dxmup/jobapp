"use client"

import { useEffect } from "react"

export function WebVitals() {
  useEffect(() => {
    if (typeof window === "undefined") return

    // Preload critical resources
    const preloadLinks = [
      { href: "/fonts/inter.woff2", as: "font", type: "font/woff2" },
      { href: "/api/testimonials", as: "fetch" },
    ]

    preloadLinks.forEach(({ href, as, type }) => {
      const link = document.createElement("link")
      link.rel = "preload"
      link.href = href
      link.as = as
      if (type) link.type = type
      link.crossOrigin = "anonymous"
      document.head.appendChild(link)
    })

    // Optimize images
    const images = document.querySelectorAll("img")
    images.forEach((img) => {
      if (!img.loading) {
        img.loading = "lazy"
      }
      if (!img.decoding) {
        img.decoding = "async"
      }
    })

    // Prefetch next page
    const prefetchLink = document.createElement("link")
    prefetchLink.rel = "prefetch"
    prefetchLink.href = "/signup"
    document.head.appendChild(prefetchLink)
  }, [])

  return null
}
