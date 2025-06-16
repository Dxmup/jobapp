import Link from "next/link"

export function LandingFooter() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                JobCraft AI
              </span>
            </Link>
            <p className="text-sm text-foreground/60 max-w-xs">
              AI-powered job search assistant helping you land your dream job faster.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Product</h4>
            <div className="space-y-2 text-sm">
              <Link href="#features" className="block text-foreground/60 hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="block text-foreground/60 hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/dashboard" className="block text-foreground/60 hover:text-foreground transition-colors">
                Dashboard
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Support</h4>
            <div className="space-y-2 text-sm">
              <Link href="/help" className="block text-foreground/60 hover:text-foreground transition-colors">
                Help Center
              </Link>
              <Link href="/contact" className="block text-foreground/60 hover:text-foreground transition-colors">
                Contact Us
              </Link>
              <Link href="/status" className="block text-foreground/60 hover:text-foreground transition-colors">
                Status
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Legal</h4>
            <div className="space-y-2 text-sm">
              <Link href="/privacy" className="block text-foreground/60 hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-foreground/60 hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="block text-foreground/60 hover:text-foreground transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center text-sm text-foreground/60">
          <p>&copy; 2024 JobCraft AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
