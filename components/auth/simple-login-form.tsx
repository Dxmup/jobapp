"use client"

import type React from "react"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/app/actions/auth-actions"

export function SimpleLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const formData = new FormData()
    formData.append("email", email)
    formData.append("password", password)

    startTransition(async () => {
      try {
        const result = await login(formData)

        if (result.success) {
          console.log("Login successful, redirecting to:", result.redirectUrl)
          // Add a small delay to ensure cookies are set
          setTimeout(() => {
            window.location.href = result.redirectUrl || "/dashboard"
          }, 100)
        } else {
          setError(result.error || "Login failed")
        }
      } catch (err) {
        setError("An unexpected error occurred")
        console.error("Login error:", err)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="john.doe@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isPending}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  )
}

export const LoginForm = SimpleLoginForm
