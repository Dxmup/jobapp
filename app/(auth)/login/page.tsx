import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { RotatingTestimonials } from "@/components/auth/rotating-testimonials"

export default function LoginPage() {
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
            <RotatingTestimonials />
          </div>
        </div>
      </div>

      {/* Right side with form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Enter your email to sign in to your account</p>
          </div>
          <LoginForm />
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/signup" className="hover:text-brand underline underline-offset-4">
              Don&apos;t have an account? Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
