"use client"

import { useState, useEffect } from "react"

export function RotatingText() {
  const terms = [
    "Applications",
    "Resumes",
    "Cover Letters",
    "Prep Questions",
    "Practice Interviews",
    "Thank You Letters",
  ]
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % terms.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return <span className="inline-block min-w-[180px]">{terms[index]}</span>
}
