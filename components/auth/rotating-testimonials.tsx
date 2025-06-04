"use client"

import { useState, useEffect } from "react"

const testimonials = [
  {
    quote:
      "JobCraft AI transformed my job search. I landed interviews at 3 top companies within a week of using their AI-optimized resume and cover letters.",
    author: "Sofia Chen, Software Engineer",
  },
  {
    quote:
      "After 2 months of job searching with no luck, JobCraft AI helped me tailor my resume perfectly. I got 5 callbacks in just one week!",
    author: "Marcus Johnson, Marketing Director",
  },
  {
    quote:
      "The timeline feature helped me stay organized during my job hunt. I never missed a follow-up and landed my dream role at a Fortune 500 company.",
    author: "Priya Patel, Product Manager",
  },
  {
    quote:
      "The AI-generated cover letters saved me hours of work and were better than anything I could write myself. Worth every penny!",
    author: "James Wilson, Data Scientist",
  },
  {
    quote:
      "As a career changer, I was struggling to highlight my transferable skills. JobCraft AI helped me reframe my experience and I got hired within a month.",
    author: "Olivia Martinez, UX Designer",
  },
]

export function RotatingTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 4000) // Rotate every 4 seconds instead of 8 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <blockquote className="space-y-2">
      <p className="text-lg relative overflow-hidden h-[120px] flex items-center">
        <span className="absolute transition-opacity duration-1000" style={{ opacity: 1 }}>
          "{testimonials[currentIndex].quote}"
        </span>
      </p>
      <footer className="text-sm transition-opacity duration-1000">{testimonials[currentIndex].author}</footer>
    </blockquote>
  )
}
