"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function LandingPricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with your job search",
      features: [
        "3 resume optimizations per month",
        "5 cover letters per month",
        "Basic interview questions",
        "Job application tracking",
        "Email support",
      ],
      cta: "Get Started",
      href: "/signup",
      popular: false,
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      description: "Everything you need for an active job search",
      features: [
        "Unlimited resume optimizations",
        "Unlimited cover letters",
        "Advanced interview prep",
        "Priority support",
        "Analytics dashboard",
        "Custom AI prompts",
        "Export to multiple formats",
      ],
      cta: "Start Pro Trial",
      href: "/signup?plan=pro",
      popular: true,
    },
    {
      name: "Premium",
      price: "$39",
      period: "per month",
      description: "For serious job seekers who want every advantage",
      features: [
        "Everything in Pro",
        "1-on-1 career coaching session",
        "LinkedIn profile optimization",
        "Salary negotiation guidance",
        "Mock interview sessions",
        "Personal branding consultation",
        "Direct recruiter connections",
      ],
      cta: "Start Premium Trial",
      href: "/signup?plan=premium",
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Choose the plan that fits your job search needs. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className={`relative h-full ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-foreground/60 ml-1">/{plan.period}</span>
                  </div>
                  <CardDescription className="mt-4">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </CardContent>

                <CardFooter>
                  <Button asChild className="w-full" variant={plan.popular ? "default" : "outline"}>
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-foreground/60">All plans include a 14-day free trial. No credit card required.</p>
        </div>
      </div>
    </section>
  )
}
