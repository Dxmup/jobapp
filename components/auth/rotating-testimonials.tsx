"use client"

import { useState, useEffect } from "react"

interface Testimonial {
  id: string
  quote: string
  author: string
  position?: string
  company?: string
}

export function RotatingTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/testimonials")
      if (response.ok) {
        const data = await response.json()
        if (data.testimonials && data.testimonials.length > 0) {
          setTestimonials(data.testimonials)
        } else {
          // If no testimonials in database, show a single default one
          setTestimonials([
            {
              id: "default",
              quote:
                "CareerAI has revolutionized how I approach job applications. The AI-powered tools are incredibly effective.",
              author: "Professional User",
              position: "Job Seeker",
            },
          ])
        }
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      // Fallback testimonial if API fails
      setTestimonials([
        {
          id: "fallback",
          quote:
            "CareerAI has revolutionized how I approach job applications. The AI-powered tools are incredibly effective.",
          author: "Professional User",
          position: "Job Seeker",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (testimonials.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 4000) // Rotate every 4 seconds

    return () => clearInterval(interval)
  }, [testimonials.length])

  if (loading) {
    return (
      <blockquote className="space-y-2">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </blockquote>
    )
  }

  if (testimonials.length === 0) {
    return (
      <blockquote className="space-y-2">
        <p className="text-lg">
          "CareerAI has revolutionized how I approach job applications. The AI-powered tools are incredibly effective."
        </p>
        <footer className="text-sm">Professional User, Job Seeker</footer>
      </blockquote>
    )
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <blockquote className="space-y-2">
      <p className="text-lg relative overflow-hidden h-[120px] flex items-center">
        <span className="absolute transition-opacity duration-1000" style={{ opacity: 1 }}>
          "{currentTestimonial.quote}"
        </span>
      </p>
      <footer className="text-sm transition-opacity duration-1000">
        {currentTestimonial.author}
        {currentTestimonial.position && `, ${currentTestimonial.position}`}
        {currentTestimonial.company && ` at ${currentTestimonial.company}`}
      </footer>
    </blockquote>
  )
}
