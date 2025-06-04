"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createUserAndLogin } from "@/app/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createZodForm, safeFormSubmit } from "@/lib/form-utils"

// Define the form schema
const signupSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

type SignupFormValues = z.infer<typeof signupSchema>

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(60) // 60 seconds cooldown
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Use our utility to create the form
  const form = useForm<SignupFormValues>(
    createZodForm(signupSchema, {
      name: "",
      email: "",
      password: "",
    }),
  )

  // Countdown timer for rate limiting
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (isRateLimited && cooldownTime > 0) {
      timer = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            setIsRateLimited(false)
            return 60
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isRateLimited, cooldownTime])

  const onSubmit = async (data: SignupFormValues) => {
    // Don't allow submission during rate limiting
    if (isRateLimited) {
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      // Call the server action
      const result = await createUserAndLogin({
        name: data.name,
        email: data.email,
        password: data.password,
      })

      if (result.success) {
        // Redirect to onboarding
        router.push(result.redirectUrl || "/onboarding")
      } else {
        // Handle rate limiting
        if (result.isRateLimited) {
          setIsRateLimited(true)
          setCooldownTime(60) // Reset to 60 seconds
        }

        setError(result.error || "Sign up failed. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Sign up error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={form.handleSubmit((data) => safeFormSubmit(onSubmit, data, () => setIsLoading(false)))}>
        <div className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isRateLimited && (
            <Alert>
              <AlertDescription>Please wait {cooldownTime} seconds before trying again.</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...form.register("name")}
              required
              autoCapitalize="words"
              autoComplete="name"
              autoCorrect="off"
              disabled={isLoading || isRateLimited}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...form.register("email")}
              required
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading || isRateLimited}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
              required
              autoComplete="new-password"
              disabled={isLoading || isRateLimited}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
            <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
          </div>
          <Button type="submit" disabled={isLoading || isRateLimited}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : isRateLimited ? (
              `Try again in ${cooldownTime}s`
            ) : (
              "Create Account"
            )}
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <Button variant="outline" type="button" disabled={isLoading || isRateLimited}>
        GitHub
      </Button>
    </div>
  )
}
