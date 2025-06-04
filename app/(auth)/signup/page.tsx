import Link from "next/link"
import { SignUpForm } from "@/components/auth/signup-form"

export default function SignUpPage() {
  return (
    <div className="flex h-screen">
      {/* Left side with gradient */}
      <div className="hidden w-1/2 relative lg:block">
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: "linear-gradient(135deg, rgb(147, 51, 234) 0%, rgb(6, 182, 212) 100%)",
            zIndex: 0,
          }}
        />
        <div className="relative z-10 flex flex-col h-full p-10 text-white">
          <div className="flex items-center text-lg font-medium">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-white">JobCraft AI</span>
            </Link>
          </div>
          <div className="mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                "After struggling with job applications for months, JobCraft AI helped me create a resume that actually
                got responses. I'm now working at my dream company!"
              </p>
              <footer className="text-sm">Marcus Johnson, Product Manager</footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Right side with form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">Enter your email below to create your account</p>
          </div>
          <SignUpForm />
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-brand underline underline-offset-4">
              Already have an account? Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
