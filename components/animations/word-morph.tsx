"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface WordMorphProps {
  fromText: string
  toText: string
  duration?: number
  className?: string
  onComplete?: () => void
  autoStart?: boolean
  highlightChanges?: boolean
}

export function WordMorph({
  fromText,
  toText,
  duration = 3000,
  className,
  onComplete,
  autoStart = true,
  highlightChanges = true,
}: WordMorphProps) {
  const [currentText, setCurrentText] = useState(fromText)
  const [isAnimating, setIsAnimating] = useState(false)
  const [changedWords, setChangedWords] = useState<Set<number>>(new Set())

  const startAnimation = () => {
    if (isAnimating) return

    setIsAnimating(true)
    setChangedWords(new Set())

    const fromWords = fromText.split(" ")
    const toWords = toText.split(" ")
    const maxWords = Math.max(fromWords.length, toWords.length)

    let currentStep = 0
    const stepDuration = duration / maxWords

    const interval = setInterval(() => {
      const wordsToShow = [...fromWords]
      const newChangedWords = new Set<number>()

      // Transform words one by one
      for (let i = 0; i <= currentStep && i < maxWords; i++) {
        if (toWords[i] && fromWords[i] !== toWords[i]) {
          wordsToShow[i] = toWords[i]
          newChangedWords.add(i)
        } else if (toWords[i] && !fromWords[i]) {
          wordsToShow.push(toWords[i])
          newChangedWords.add(i)
        }
      }

      setCurrentText(wordsToShow.join(" "))
      setChangedWords(newChangedWords)
      currentStep++

      if (currentStep > maxWords) {
        clearInterval(interval)
        setCurrentText(toText)
        setIsAnimating(false)
        onComplete?.()

        // Clear highlights after animation
        setTimeout(() => setChangedWords(new Set()), 1000)
      }
    }, stepDuration)
  }

  useEffect(() => {
    if (autoStart) {
      const timer = setTimeout(startAnimation, 500)
      return () => clearTimeout(timer)
    }
  }, [autoStart])

  const renderText = () => {
    if (!highlightChanges) {
      return currentText
    }

    return currentText.split(" ").map((word, index) => (
      <span
        key={index}
        className={cn(
          "transition-all duration-500",
          changedWords.has(index) && "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1 rounded",
        )}
      >
        {word}
        {index < currentText.split(" ").length - 1 ? " " : ""}
      </span>
    ))
  }

  return (
    <div className={cn("transition-all duration-300", className)}>
      <div className="text-content">{renderText()}</div>
      {!autoStart && (
        <button
          onClick={startAnimation}
          disabled={isAnimating}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isAnimating ? "Transforming..." : "Transform Text"}
        </button>
      )}
    </div>
  )
}
