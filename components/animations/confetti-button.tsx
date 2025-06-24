"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface ConfettiButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function ConfettiButton({ children, onClick, className, variant, size }: ConfettiButtonProps) {
  const [isClicked, setIsClicked] = useState(false)

  const handleClick = () => {
    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 600)
    onClick?.()
  }

  return (
    <div className="relative">
      <Button onClick={handleClick} className={className} variant={variant} size={size}>
        {children}
      </Button>

      {isClicked && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"][i % 5],
                left: "50%",
                top: "50%",
              }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200,
              }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
