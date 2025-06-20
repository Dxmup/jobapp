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
          // If no testimonials in database, show default ones
          setTestimonials([
            {
              id: "default-1",
              quote:
                "CareerAI has revolutionized how I approach job applications. The AI-powered tools are incredibly effective.",
              author: "Sofia Chen",
              position: "Software Engineer",
            },
            {
              id: "default-2",
              quote:
                "After 2 months of job searching with no luck, CareerAI helped me tailor my resume perfectly. I got 5 callbacks in just one week!",
              author: "Marcus Johnson",
              position: "Marketing Director",
            },
            {
              id: "default-3",
              quote:
                "The timeline feature helped me stay organized during my job hunt. I never missed a follow-up and landed my dream role at a Fortune 500 company.",
              author: "Priya Patel",
              position: "Product Manager",
            },
          ])
        }
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      // Fallback testimonials if API fails
      setTestimonials([
        {
          id: "fallback-1",
          quote:
            "CareerAI has revolutionized how I approach job applications. The AI-powered tools are incredibly effective.",
          author: "Sofia Chen",
          position: "Software Engineer",
        },
        {
          id: "fallback-2",
          quote:
            "After 2 months of job searching with no luck, CareerAI helped me tailor my resume perfectly. I got 5 callbacks in just one week!",
          author: "Marcus Johnson",
          position: "Marketing Director",
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
