"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface TextMorphProps {
  fromText: string
  toText: string
  duration?: number
  className?: string
  onComplete?: () => void
  autoStart?: boolean
}

export function TextMorph({
  fromText,
  toText,
  duration = 2000,
  className,
  onComplete,
  autoStart = true,
}: TextMorphProps) {
  const [currentText, setCurrentText] = useState(fromText)
  const [isAnimating, setIsAnimating] = useState(false)
  const [progress, setProgress] = useState(0)

  const startAnimation = () => {
    if (isAnimating) return

    setIsAnimating(true)
    setProgress(0)

    const steps = Math.max(fromText.length, toText.length)
    const stepDuration = duration / steps

    let currentStep = 0

    const interval = setInterval(() => {
      currentStep++
      const progressPercent = currentStep / steps
      setProgress(progressPercent)

      // Create morphing effect by gradually replacing characters
      let morphedText = ""

      for (let i = 0; i < Math.max(fromText.length, toText.length); i++) {
        if (i < fromText.length && progressPercent < 0.5) {
          // First half: show original text with some scrambling
          if (Math.random() < progressPercent * 2) {
            morphedText += getRandomChar()
          } else {
            morphedText += fromText[i] || ""
          }
        } else if (i < toText.length) {
          // Second half: gradually reveal new text
          if (Math.random() < (progressPercent - 0.5) * 2) {
            morphedText += toText[i]
          } else {
            morphedText += getRandomChar()
          }
        }
      }

      setCurrentText(morphedText)

      if (currentStep >= steps) {
        clearInterval(interval)
        setCurrentText(toText)
        setIsAnimating(false)
        onComplete?.()
      }
    }, stepDuration)
  }

  const getRandomChar = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    return chars[Math.floor(Math.random() * chars.length)]
  }

  useEffect(() => {
    if (autoStart) {
      const timer = setTimeout(startAnimation, 500)
      return () => clearTimeout(timer)
    }
  }, [autoStart])

  return (
    <div className={cn("font-mono transition-all duration-100", className)}>
      <span
        className={cn("inline-block transition-all duration-100", isAnimating && "text-green-500 animate-pulse")}
        style={{
          textShadow: isAnimating ? "0 0 10px rgba(34, 197, 94, 0.5)" : "none",
        }}
      >
        {currentText}
      </span>
      {!autoStart && (
        <button
          onClick={startAnimation}
          disabled={isAnimating}
          className="ml-4 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {isAnimating ? "Morphing..." : "Transform"}
        </button>
      )}
    </div>
  )
}
