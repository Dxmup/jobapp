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
        setTestimonials(data.testimonials)
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      // Fallback to hardcoded testimonials if API fails
      setTestimonials([
        {
          id: "1",
          quote:
            "JobCraft AI transformed my job search. I landed interviews at 3 top companies within a week of using their AI-optimized resume and cover letters.",
          author: "Sofia Chen",
          position: "Software Engineer",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (testimonials.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 4000) // Rotate every 4 seconds

    return () => clearInterval(interval)
  }, [testimonials.length])

  if (loading || testimonials.length === 0) {
    return (
      <blockquote className="space-y-2">
        <p className="text-lg">
          "JobCraft AI transformed my job search. I landed interviews at 3 top companies within a week of using their
          AI-optimized resume and cover letters."
        </p>
        <footer className="text-sm">Sofia Chen, Software Engineer</footer>
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
