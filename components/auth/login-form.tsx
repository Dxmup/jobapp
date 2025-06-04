"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/app/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createZodForm, safeFormSubmit } from "@/lib/form-utils"

// At the top of the file, make sure the Supabase client is properly imported
import { getSupabaseClient } from "@/lib/supabase/client"

// Define the form schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // In the component, before using supabase, ensure it's initialized
  const supabase = getSupabaseClient()

  // Use our utility to create the form
  const form = useForm<LoginFormValues>(
    createZodForm(loginSchema, {
      email: "",
      password: "",
    }),
  )

  const onSubmit = async (data: LoginFormValues) => {
    setError(null)
    setIsLoading(true)

    try {
      // Create FormData object
      const formData = new FormData()
      formData.append("email", data.email)
      formData.append("password", data.password)

      // Call the server action
      const result = await login(formData)

      if (result.success) {
        // Redirect to the appropriate page
        router.push(result.redirectUrl || "/dashboard")
      } else {
        setError(result.error || "Login failed. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={form.handleSubmit((data) => safeFormSubmit(onSubmit, data, () => setIsLoading(false)))}>
        <div className="grid gap-4">
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
              disabled={isLoading}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
