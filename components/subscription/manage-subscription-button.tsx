"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ManageSubscriptionButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  children?: React.ReactNode
}

export function ManageSubscriptionButton({ variant = "outline", children }: ManageSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleManageSubscription = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("Failed to create portal session")
      }
    } catch (error) {
      console.error("Error creating portal session:", error)
      toast({
        title: "Error",
        description: "There was a problem accessing your subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant={variant} onClick={handleManageSubscription} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children || "Manage Subscription"
      )}
    </Button>
  )
}
