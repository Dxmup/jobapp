"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import { login } from "@/app/actions/auth-actions"

export function SimpleLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isPending) return

    setError("")
    setSuccess("")

    const formData = new FormData()
    formData.append("email", email)
    formData.append("password", password)

    startTransition(async () => {
      try {
        const result = await login(formData)

        if (result?.error) {
          setError(result.error)
        } else if (result?.success) {
          setSuccess("Login successful! Redirecting...")

          // Wait a moment for the session to be established, then redirect
          setTimeout(() => {
            window.location.href = result.redirectUrl || "/dashboard"
          }, 500)
        }
      } catch (error) {
        console.error("Login error:", error)
        setError("An unexpected error occurred")
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            required
          />
        </div>
      </div>
      <FormError message={error} />
      <FormSuccess message={success} />
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  )
}

// Export both names for compatibility
export const LoginForm = SimpleLoginForm
