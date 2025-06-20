"use client"

import { useEffect, useRef } from "react"

export function MagneticCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorDotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const cursorDot = cursorDotRef.current

    if (!cursor || !cursorDot) return

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const handleMouseEnter = () => {
      cursor.style.transform = "scale(1)"
      cursor.style.opacity = "1"
    }

    const handleMouseLeave = () => {
      cursor.style.transform = "scale(0)"
      cursor.style.opacity = "0"
    }

    const handleButtonHover = () => {
      cursor.style.transform = "scale(1.5)"
      cursor.style.backgroundColor = "rgba(147, 51, 234, 0.2)"
    }

    const handleButtonLeave = () => {
      cursor.style.transform = "scale(1)"
      cursor.style.backgroundColor = "rgba(147, 51, 234, 0.1)"
    }

    const animate = () => {
      const dx = mouseX - cursorX
      const dy = mouseY - cursorY

      cursorX += dx * 0.1
      cursorY += dy * 0.1

      cursor.style.left = `${cursorX}px`
      cursor.style.top = `${cursorY}px`

      cursorDot.style.left = `${mouseX}px`
      cursorDot.style.top = `${mouseY}px`

      requestAnimationFrame(animate)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseenter", handleMouseEnter)
    document.addEventListener("mouseleave", handleMouseLeave)

    // Add hover effects to buttons
    const buttons = document.querySelectorAll('button, a[role="button"], .cursor-pointer')
    buttons.forEach((button) => {
      button.addEventListener("mouseenter", handleButtonHover)
      button.addEventListener("mouseleave", handleButtonLeave)
    })

    animate()

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseenter", handleMouseEnter)
      document.removeEventListener("mouseleave", handleMouseLeave)
      buttons.forEach((button) => {
        button.removeEventListener("mouseenter", handleButtonHover)
        button.removeEventListener("mouseleave", handleButtonLeave)
      })
    }
  }, [])

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed w-8 h-8 bg-purple-500/10 rounded-full pointer-events-none z-50 transition-all duration-300 ease-out mix-blend-difference"
        style={{ transform: "translate(-50%, -50%)" }}
      />
      <div
        ref={cursorDotRef}
        className="fixed w-1 h-1 bg-purple-600 rounded-full pointer-events-none z-50"
        style={{ transform: "translate(-50%, -50%)" }}
      />
    </>
  )
}
