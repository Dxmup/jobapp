// lib/animation-utils.ts

import type React from "react"

// This file contains utility functions and constants related to animations.

export const SHORT_DURATION = 200 // milliseconds
export const SHORT_DELAY = 200 // milliseconds

export const FADE_IN_ANIMATION = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: SHORT_DURATION } },
  exit: { opacity: 0, transition: { duration: SHORT_DURATION } },
}

export const SLIDE_IN_LEFT_ANIMATION = {
  initial: { x: -50, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: SHORT_DURATION, ease: "easeOut" } },
  exit: { x: -50, opacity: 0, transition: { duration: SHORT_DURATION, ease: "easeIn" } },
}

export const SLIDE_IN_RIGHT_ANIMATION = {
  initial: { x: 50, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: SHORT_DURATION, ease: "easeOut" } },
  exit: { x: 50, opacity: 0, transition: { duration: SHORT_DURATION, ease: "easeIn" } },
}

export const SCALE_ANIMATION = {
  initial: { scale: 0.5, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: SHORT_DURATION, ease: "easeOut" } },
  exit: { scale: 0.5, opacity: 0, transition: { duration: SHORT_DURATION, ease: "easeIn" } },
}

export const POP_IN_ANIMATION = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { duration: SHORT_DURATION, type: "spring", stiffness: 100, damping: 15 },
  },
  exit: { scale: 0, opacity: 0, transition: { duration: SHORT_DURATION } },
}

export const FADE_IN_DELAYED_ANIMATION = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: SHORT_DURATION, delay: SHORT_DELAY } },
  exit: { opacity: 0, transition: { duration: SHORT_DURATION } },
}

export const SLIDE_UP_ANIMATION = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: SHORT_DURATION, ease: "easeOut" } },
  exit: { y: 20, opacity: 0, transition: { duration: SHORT_DURATION, ease: "easeIn" } },
}

export const SLIDE_DOWN_ANIMATION = {
  initial: { y: -20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: SHORT_DURATION, ease: "easeOut" } },
  exit: { y: -20, opacity: 0, transition: { duration: SHORT_DURATION, ease: "easeIn" } },
}

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
