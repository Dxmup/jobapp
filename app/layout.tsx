import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "JobCraft AI - Land Your Dream Job with AI-Powered Tools",
  description:
    "Transform your job search with AI-powered resume optimization, cover letter generation, and interview preparation. Get hired 3x faster.",
  keywords: "job search, AI resume, cover letter generator, interview prep, career tools",
  authors: [{ name: "JobCraft AI" }],
  openGraph: {
    title: "JobCraft AI - Land Your Dream Job with AI-Powered Tools",
    description:
      "Transform your job search with AI-powered resume optimization, cover letter generation, and interview preparation.",
    type: "website",
    url: "https://jobcraft.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "JobCraft AI - Land Your Dream Job with AI-Powered Tools",
    description:
      "Transform your job search with AI-powered resume optimization, cover letter generation, and interview preparation.",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
