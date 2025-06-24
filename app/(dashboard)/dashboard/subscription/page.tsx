"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Check, CreditCard, Loader2, AlertTriangle } from "lucide-react"
import { formatPrice, isStripeConfigured } from "@/lib/stripe"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Subscription {
  id: string
  product_name: string
  price_amount: number
  price_interval: string
  current_period_end: string
  cancel_at: string | null
  status: string
}

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState("free")
  const [isLoading, setIsLoading] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isStripeReady, setIsStripeReady] = useState(false)

  const success = searchParams.get("success")
  const canceled = searchParams.get("canceled")

  useEffect(() => {
    if (success) {
      toast({
        title: "Subscription successful",
        description: "Your subscription has been processed successfully.",
      })
      router.replace("/dashboard/subscription")
    } else if (canceled) {
      toast({
        title: "Subscription canceled",
        description: "Your subscription process was canceled.",
        variant: "destructive",
      })
      router.replace("/dashboard/subscription")
    }
  }, [success, canceled, toast, router])

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch("/api/stripe/subscription")
        const data = await response.json()

        if (data.subscription) {
          setSubscription(data.subscription)

          // Set the selected plan based on the subscription
          if (data.subscription.product_name.toLowerCase().includes("pro")) {
            setSelectedPlan("pro")
          } else if (
            data.subscription.product_name.toLowerCase().includes("premium") ||
            data.subscription.product_name.toLowerCase().includes("enterprise")
          ) {
            setSelectedPlan("enterprise")
          } else {
            setSelectedPlan("free")
          }
        }
      } catch (error) {
        console.error("Error fetching subscription:", error)
      } finally {
        setIsLoadingSubscription(false)
      }
    }

    fetchSubscription()
  }, [])

  useEffect(() => {
    setIsStripeReady(isStripeConfigured())
  }, [])

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Basic tools to get started with your job search",
      features: [
        "3 job applications",
        "Basic resume optimization",
        "Standard cover letter generation",
        "7-day document retention",
        "Email support",
      ],
      limitations: ["Limited AI optimizations", "No application analytics", "Basic document management"],
    },
    {
      id: "pro",
      name: "Pro",
      price: "$19",
      period: "per month",
      description: "Advanced tools for serious job seekers",
      features: [
        "Unlimited job applications",
        "Advanced resume optimization",
        "Premium cover letter generation",
        "30-day document retention",
        "Application analytics",
        "Priority support",
      ],
      limitations: [],
      popular: true,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$49",
      period: "per month",
      description: "Complete solution for career professionals",
      features: [
        "Everything in Pro",
        "Expert resume review",
        "Custom AI fine-tuning",
        "60-day document retention",
        "Team collaboration",
        "Dedicated account manager",
      ],
      limitations: [],
      priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
    },
  ]

  const handleUpgrade = async () => {
    const plan = plans.find((p) => p.id === selectedPlan)

    if (!plan || !plan.priceId) {
      toast({
        title: "Error",
        description: "Selected plan is not available for purchase.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: plan.priceId,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("Failed to create checkout session")
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast({
        title: "Error",
        description: "There was a problem processing your request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: subscription.id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Subscription canceled",
          description:
            "Your subscription has been canceled. You will be downgraded to the Free plan at the end of your billing period.",
        })

        // Refresh the subscription data
        const subResponse = await fetch("/api/stripe/subscription")
        const subData = await subResponse.json()
        setSubscription(subData.subscription)
      } else {
        throw new Error("Failed to cancel subscription")
      }
    } catch (error) {
      console.error("Error canceling subscription:", error)
      toast({
        title: "Error",
        description: "There was a problem canceling your subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowCancelDialog(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information.</p>
      </div>
      <Separator />

      {isLoadingSubscription ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !isStripeReady ? (
        <Card className="bg-yellow-50 dark:bg-yellow-900/30">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Stripe Configuration Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 dark:text-yellow-300">
              Subscription features are currently unavailable. Please contact support if you need to manage your
              subscription.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto">
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6 mt-6">
            {subscription && subscription.status === "active" && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    Current Subscription
                    {subscription.cancel_at ? (
                      <Badge
                        variant="outline"
                        className="ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                      >
                        Canceling
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      >
                        Active
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Plan:</span>
                    <span>{subscription.product_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Price:</span>
                    <span>
                      {formatPrice(subscription.price_amount)} / {subscription.price_interval}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Current period ends:</span>
                    <span>{new Date(subscription.current_period_end).toLocaleDateString()}</span>
                  </div>
                  {subscription.cancel_at && (
                    <div className="flex items-center mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-md">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Your subscription will be canceled on {new Date(subscription.cancel_at).toLocaleDateString()}.
                        You'll be downgraded to the Free plan after this date.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {!subscription.cancel_at && (
                    <Button variant="outline" onClick={() => setShowCancelDialog(true)}>
                      Cancel Subscription
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )}

            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative ${plan.popular ? "border-purple-500 shadow-lg" : ""} ${selectedPlan === plan.id ? "ring-2 ring-purple-500" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/2">
                      <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
                    </div>
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}

                      {plan.limitations && plan.limitations.length > 0 && (
                        <>
                          <li className="pt-2">
                            <span className="text-muted-foreground text-sm">Limitations:</span>
                          </li>
                          {plan.limitations.map((limitation, i) => (
                            <li key={`limit-${i}`} className="flex items-center text-muted-foreground">
                              <span className="h-5 w-5 text-center mr-2 flex-shrink-0">•</span>
                              <span>{limitation}</span>
                            </li>
                          ))}
                        </>
                      )}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className={`w-full ${plan.popular ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                      variant={selectedPlan === plan.id ? "outline" : "default"}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {selectedPlan === plan.id ? "Current Selection" : `Select ${plan.name}`}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Upgrade Your Plan</CardTitle>
                <CardDescription>Select a plan above and click the button below to upgrade.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  You have selected the <Badge>{plans.find((p) => p.id === selectedPlan)?.name}</Badge> plan.
                  {subscription &&
                    subscription.status === "active" &&
                    !subscription.cancel_at &&
                    " You already have an active subscription. Upgrading will change your plan immediately."}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  onClick={handleUpgrade}
                  disabled={
                    isLoading ||
                    (subscription?.status === "active" &&
                      selectedPlan ===
                        (subscription.product_name.toLowerCase().includes("pro")
                          ? "pro"
                          : subscription.product_name.toLowerCase().includes("premium") ||
                              subscription.product_name.toLowerCase().includes("enterprise")
                            ? "enterprise"
                            : "free"))
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      {selectedPlan === "free"
                        ? "Downgrade to Free"
                        : subscription?.status === "active"
                          ? "Change Subscription"
                          : "Upgrade Subscription"}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Update your payment information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription?.status === "active" ? (
                  <div className="rounded-md border p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-muted p-2 rounded-md">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium">Card ending in ****</p>
                        <p className="text-sm text-muted-foreground">Expires **/**</p>
                      </div>
                    </div>
                    <Badge>Default</Badge>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No payment method on file.</p>
                )}

                <div className="flex gap-2">
                  <Button variant="outline">Add Payment Method</Button>
                  {subscription?.status === "active" && <Button variant="outline">Edit</Button>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View your recent billing history and download invoices.</CardDescription>
              </CardHeader>
              <CardContent>
                {subscription?.status === "active" ? (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 p-4 font-medium border-b">
                      <div>Date</div>
                      <div>Amount</div>
                      <div>Status</div>
                      <div className="text-right">Invoice</div>
                    </div>
                    <div className="grid grid-cols-4 p-4">
                      <div>{new Date().toLocaleDateString()}</div>
                      <div>{formatPrice(subscription.price_amount)}</div>
                      <div>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        >
                          Paid
                        </Badge>
                      </div>
                      <div className="text-right">
                        <Button variant="link" size="sm">
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No billing history available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You'll still have access to your current plan until the
              end of your billing period.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Cancel Subscription"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
