"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const words = ["Resumes", "Cover Letters", "Interview Prep", "Applications"]

export function RotatingText() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative inline-block min-h-[1.2em]">
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 bg-clip-text text-transparent"
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
