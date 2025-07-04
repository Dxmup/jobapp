import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotatingText } from "./rotating-text"

export function LandingHero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-[0.07]" />
      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="mb-4 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 hover:bg-purple-100 dark:hover:bg-purple-900">
            AI-Powered tools for the modern job search
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Land Your Dream Job with{" "}
            <span className="bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
              AI-Crafted
              <br />
              <RotatingText />
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Optimize your resume and generate tailored cover letters with AI. Increase your chances of getting
            interviews and track your job applications in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">See How It Works</Link>
            </Button>
          </div>

          <div className="mt-16 relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg blur opacity-75"></div>
            <div className="relative bg-background rounded-lg border shadow-lg overflow-hidden">
              <img
                src="/placeholder.svg?height=600&width=1200"
                alt="JobCraft AI Dashboard Preview"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
