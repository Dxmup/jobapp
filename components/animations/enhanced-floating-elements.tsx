"use client"

import { motion } from "framer-motion"
import {
  FileText,
  Mail,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
  Award,
  Zap,
  Star,
  CheckCircle,
} from "lucide-react"

const floatingElements = [
  { Icon: FileText, color: "text-blue-500", size: 24, delay: 0 },
  { Icon: Mail, color: "text-green-500", size: 28, delay: 0.5 },
  { Icon: MessageSquare, color: "text-purple-500", size: 26, delay: 1 },
  { Icon: Sparkles, color: "text-yellow-500", size: 30, delay: 1.5 },
  { Icon: Target, color: "text-red-500", size: 25, delay: 2 },
  { Icon: TrendingUp, color: "text-cyan-500", size: 27, delay: 2.5 },
  { Icon: Award, color: "text-orange-500", size: 29, delay: 3 },
  { Icon: Zap, color: "text-pink-500", size: 26, delay: 3.5 },
  { Icon: Star, color: "text-indigo-500", size: 24, delay: 4 },
  { Icon: CheckCircle, color: "text-emerald-500", size: 28, delay: 4.5 },
]

export function EnhancedFloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {floatingElements.map(({ Icon, color, size, delay }, index) => (
        <motion.div
          key={index}
          className={`absolute ${color} opacity-10 hover:opacity-20 transition-opacity`}
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
            y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
            rotate: 0,
            scale: 0.5,
          }}
          animate={{
            x: [
              Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
              Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
              Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
            ],
            y: [
              Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
              Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
              Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
            ],
            rotate: [0, 180, 360],
            scale: [0.5, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 25 + Math.random() * 15,
            repeat: Number.POSITIVE_INFINITY,
            delay: delay,
            ease: "easeInOut",
          }}
          style={{
            left: `${5 + ((index * 8) % 85)}%`,
            top: `${5 + ((index * 12) % 80)}%`,
          }}
        >
          <Icon size={size} />
        </motion.div>
      ))}
    </div>
  )
}
