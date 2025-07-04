import type React from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface LandingHeaderProps extends React.HTMLAttributes<HTMLElement> {}

export function LandingHeader({ className, ...props }: LandingHeaderProps) {
  return (
    <header className={cn("sticky top-0 z-40 w-full border-b bg-background", className)} {...props}>
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <Link href="/" className="flex items-center font-semibold">
          {siteConfig.name}
        </Link>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/sign-up">Sign Up</Link>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
