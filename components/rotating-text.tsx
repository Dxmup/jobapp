"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

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

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={terms[index]}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="inline-block min-w-[180px] bg-gradient-to-r from-primary to-sky-500 text-transparent bg-clip-text font-semibold"
      >
        {terms[index]}
      </motion.span>
    </AnimatePresence>
  )
}
