import type React from "react"
/**
 * Animation utilities for consistent animations across the application
 */

// Pulse animation for highlighting newly created items
export const pulseAnimationCSS = `
  @keyframes pulse-border {
    0% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    }
  }

  .animate-pulse-border {
    animation: pulse-border 1.5s 2;
    border-color: #3b82f6;
  }

  .animate-pulse-border-infinite {
    animation: pulse-border 1.5s infinite;
    border-color: #3b82f6;
  }
`

// Function to scroll to an element with a ref
export const scrollToElement = (
  ref: React.RefObject<HTMLElement>,
  options = { behavior: "smooth" as ScrollBehavior, block: "center" as ScrollLogicalPosition },
) => {
  if (ref.current) {
    ref.current.scrollIntoView(options)
  }
}

// Function to clear localStorage items
export const clearStoredItem = (keys: string[]) => {
  keys.forEach((key) => localStorage.removeItem(key))
}

// Function to store item in localStorage
export const storeItem = (key: string, value: string) => {
  localStorage.setItem(key, value)
}

// Function to get item from localStorage
export const getStoredItem = (key: string) => {
  return localStorage.getItem(key)
}

// Function to apply temporary pulse animation to an element
export const applyTemporaryPulse = (
  element: HTMLElement | null,
  className = "animate-pulse-border",
  duration = 3000,
) => {
  if (!element) return

  // Add the animation class
  element.classList.add(className)

  // Remove the animation class after the specified duration
  setTimeout(() => {
    element.classList.remove(className)
  }, duration)
}
