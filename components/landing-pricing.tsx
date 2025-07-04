"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Crown, Rocket } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with your job search",
    icon: Zap,
    features: [
      "3 resume optimizations per month",
      "5 cover letters per month",
      "Basic interview questions",
      "Job application tracking",
      "Email support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "Everything you need for an active job search",
    icon: Crown,
    features: [
      "Unlimited resume optimizations",
      "Unlimited cover letters",
      "Advanced interview prep",
      "Priority job matching",
      "Analytics & insights",
      "Priority support",
      "ATS optimization",
      "LinkedIn profile optimization",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Premium",
    price: "$39",
    period: "per month",
    description: "For serious job seekers who want maximum results",
    icon: Rocket,
    features: [
      "Everything in Pro",
      "1-on-1 career coaching",
      "Salary negotiation guidance",
      "Personal brand development",
      "Network building strategies",
      "Interview coaching sessions",
      "Custom job search strategy",
      "White-glove support",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export function LandingPricing() {
  return (
    <section id="pricing" className="py-24 bg-white dark:bg-slate-950">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            Simple Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 dark:from-slate-100 dark:via-purple-100 dark:to-slate-100 bg-clip-text text-transparent">
            Choose your plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start free and upgrade as your job search accelerates. All plans include our core AI features.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <Card
                className={`h-full ${plan.popular ? "border-purple-200 dark:border-purple-800 shadow-xl scale-105" : "border-slate-200 dark:border-slate-800"} transition-all duration-300 hover:shadow-lg`}
              >
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    <div
                      className={`p-3 rounded-2xl ${plan.popular ? "bg-gradient-to-r from-purple-600 to-cyan-500" : "bg-slate-100 dark:bg-slate-800"}`}
                    >
                      <plan.icon
                        className={`h-6 w-6 ${plan.popular ? "text-white" : "text-slate-600 dark:text-slate-400"}`}
                      />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2 text-base">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${plan.popular ? "bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/signup">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">
            All plans come with a 14-day free trial. No credit card required.
          </p>
          <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
            <span>✓ Cancel anytime</span>
            <span>✓ 30-day money back guarantee</span>
            <span>✓ 24/7 support</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
