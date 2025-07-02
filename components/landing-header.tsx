"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Sparkles } from "lucide-react"
import dynamic from "next/dynamic"

const ModeToggle = dynamic(() => import("@/components/mode-toggle").then((mod) => ({ default: mod.ModeToggle })), {
  loading: () => <div className="h-9 w-9 bg-white/10 animate-pulse rounded-lg backdrop-blur-sm" />,
  ssr: false,
})

export default function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/50 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center group">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 mr-3 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
              JobCraft AI
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 relative group"
          >
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 relative group"
          >
            Pricing
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 relative group"
          >
            Login
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Button
            asChild
            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <Link href="/signup">Get Started</Link>
          </Button>
          <ModeToggle />
        </nav>

        <button
          className="md:hidden p-2 rounded-lg bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white/20 dark:hover:bg-slate-800/70 transition-colors duration-300"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/50">
          <div className="container py-6 space-y-4">
            <Link
              href="#features"
              className="block text-lg font-semibold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="block text-lg font-semibold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="block text-lg font-semibold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
            <Button
              asChild
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 shadow-lg"
            >
              <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
