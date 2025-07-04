import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "JobCraft - AI-Powered Career Assistant",
  description:
    "Transform your job search with AI-powered resume optimization, cover letter generation, and interview preparation.",
  keywords: "job search, resume optimization, cover letter, interview prep, AI career assistant",
  authors: [{ name: "JobCraft Team" }],
  openGraph: {
    title: "JobCraft - AI-Powered Career Assistant",
    description:
      "Transform your job search with AI-powered resume optimization, cover letter generation, and interview preparation.",
    type: "website",
    url: "https://jobcraft.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "JobCraft - AI-Powered Career Assistant",
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
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
