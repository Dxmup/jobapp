import { Check, Star, Zap, Crown } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function LandingPricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Basic tools to get started",
      features: ["3 job applications", "Basic resume optimization", "Standard cover letters", "Email support"],
      cta: "Get Started",
      popular: false,
      icon: <Star className="h-6 w-6" />,
    },
    {
      name: "Pro",
      price: "$25",
      period: "per month",
      description: "Advanced tools for serious job seekers",
      features: [
        "Unlimited applications",
        "Advanced resume revisions",
        "Custom cover letters",
        "Interview prep",
        "Priority support",
      ],
      cta: "Upgrade to Pro",
      popular: true,
      icon: <Zap className="h-6 w-6" />,
    },
    {
      name: "Premium",
      price: "$49",
      period: "per month",
      description: "Complete career solution",
      features: [
        "Everything in Pro",
        "LinkedIn optimization",
        "Personal career coach",
        "Salary negotiation",
        "1-on-1 sessions",
      ],
      cta: "Contact Sales",
      popular: false,
      icon: <Crown className="h-6 w-6" />,
    },
  ]

  return (
    <section
      id="pricing"
      className="py-32 bg-gradient-to-br from-white via-purple-50/30 to-cyan-50/30 dark:from-slate-900 dark:via-purple-950/20 dark:to-cyan-950/20"
    >
      <div className="container">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto">
            Choose the plan that fits your job search needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative flex flex-col h-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 ${plan.popular ? "ring-2 ring-purple-500 scale-105" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </div>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white flex items-center justify-center mx-auto mb-4">
                  {plan.icon}
                </div>
                <CardTitle className="text-3xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-black">{plan.price}</span>
                  {plan.period && <span className="text-slate-600 dark:text-slate-400 ml-2">{plan.period}</span>}
                </div>
                <CardDescription className="mt-4 text-lg">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <div className="p-1 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 mr-3">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full ${plan.popular ? "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white" : ""}`}
                  asChild
                >
                  <Link href="/signup">{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
