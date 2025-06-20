"use client"

import { motion } from "framer-motion"
import { FileText, Mail, MessageSquare, Sparkles, Target, TrendingUp, Award, Zap } from "lucide-react"

const floatingIcons = [
  { Icon: FileText, color: "text-blue-500", delay: 0 },
  { Icon: Mail, color: "text-green-500", delay: 0.5 },
  { Icon: MessageSquare, color: "text-purple-500", delay: 1 },
  { Icon: Sparkles, color: "text-yellow-500", delay: 1.5 },
  { Icon: Target, color: "text-red-500", delay: 2 },
  { Icon: TrendingUp, color: "text-cyan-500", delay: 2.5 },
  { Icon: Award, color: "text-orange-500", delay: 3 },
  { Icon: Zap, color: "text-pink-500", delay: 3.5 },
]

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {floatingIcons.map(({ Icon, color, delay }, index) => (
        <motion.div
          key={index}
          className={`absolute ${color} opacity-20`}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            rotate: 0,
            scale: 0.5,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            rotate: 360,
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Number.POSITIVE_INFINITY,
            delay: delay,
            ease: "linear",
          }}
          style={{
            left: `${10 + ((index * 12) % 80)}%`,
            top: `${10 + ((index * 15) % 70)}%`,
          }}
        >
          <Icon size={24 + Math.random() * 16} />
        </motion.div>
      ))}
    </div>
  )
}
