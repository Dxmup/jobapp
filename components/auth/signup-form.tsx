"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createUserAndLogin } from "@/app/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createZodForm, safeFormSubmit } from "@/lib/form-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Define the form schema
const signupSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  selectedTier: z.enum(["free", "pro", "premium"]).default("free"),
})

type SignupFormValues = z.infer<typeof signupSchema>

const subscriptionTiers = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: ["3 job applications", "2 resume versions", "3 cover letters", "Basic job tracking"],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "For active job seekers",
    features: ["Unlimited applications", "Unlimited resumes", "AI optimization", "Interview prep"],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$39",
    period: "per month",
    description: "For serious professionals",
    features: ["Everything in Pro", "Expert review", "Priority support", "Team features"],
    popular: false,
  },
]

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(60)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTier, setSelectedTier] = useState<"free" | "pro" | "premium">("free")
  const router = useRouter()

  // Use our utility to create the form
  const form = useForm<SignupFormValues>(
    createZodForm(signupSchema, {
      name: "",
      email: "",
      password: "",
      selectedTier: "free",
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
      // Call the server action with selected tier
      const result = await createUserAndLogin({
        name: data.name,
        email: data.email,
        password: data.password,
        selectedTier: data.selectedTier,
      })

      if (result.success) {
        // If user selected a paid tier, redirect to checkout
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl
        } else {
          // Free tier - redirect to onboarding
          router.push(result.redirectUrl || "/onboarding")
        }
      } else {
        // Handle rate limiting
        if (result.isRateLimited) {
          setIsRateLimited(true)
          setCooldownTime(60)
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
    <div className="space-y-6">
      {/* Subscription Tier Selection */}
      <div className="space-y-4">
        <div className="space-y-3">
          {subscriptionTiers.map((tier) => (
            <Card
              key={tier.id}
              className={`cursor-pointer transition-all ${
                selectedTier === tier.id ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
              }`}
              onClick={() => {
                setSelectedTier(tier.id as "free" | "pro" | "premium")
                form.setValue("selectedTier", tier.id as "free" | "pro" | "premium")
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{tier.name}</CardTitle>
                    {tier.popular && (
                      <Badge variant="secondary" className="text-xs">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{tier.price}</div>
                    <div className="text-xs text-muted-foreground">{tier.period}</div>
                  </div>
                </div>
                <CardDescription className="text-sm">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Account Details Form */}
      <form onSubmit={form.handleSubmit((data) => safeFormSubmit(onSubmit, data, () => setIsLoading(false)))}>
        <div className="space-y-4">
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

          <div className="space-y-2">
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

          <div className="space-y-2">
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

          <div className="space-y-2">
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

          <Button type="submit" disabled={isLoading || isRateLimited} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {selectedTier === "free" ? "Creating account..." : "Processing..."}
              </>
            ) : isRateLimited ? (
              `Try again in ${cooldownTime}s`
            ) : selectedTier === "free" ? (
              "Create Free Account"
            ) : (
              `Continue to Payment - ${subscriptionTiers.find((t) => t.id === selectedTier)?.price}/month`
            )}
          </Button>

          {selectedTier !== "free" && (
            <p className="text-xs text-center text-muted-foreground">
              You'll be redirected to secure payment processing
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
