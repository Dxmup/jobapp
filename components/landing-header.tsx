"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Sparkles } from "lucide-react"

export function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/50">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center group">
          <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 mr-3 group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
            JobCraft AI
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-purple-600 transition-colors"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-purple-600 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-purple-600 transition-colors"
          >
            Login
          </Link>
          <Button
            asChild
            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white"
          >
            <Link href="/signup">Get Started</Link>
          </Button>
        </nav>

        <button className="md:hidden p-2 rounded-lg" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b">
          <div className="container py-6 space-y-4">
            <Link href="#features" className="block text-lg font-semibold" onClick={() => setIsMenuOpen(false)}>
              Features
            </Link>
            <Link href="#pricing" className="block text-lg font-semibold" onClick={() => setIsMenuOpen(false)}>
              Pricing
            </Link>
            <Link href="/login" className="block text-lg font-semibold" onClick={() => setIsMenuOpen(false)}>
              Login
            </Link>
            <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white">
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
