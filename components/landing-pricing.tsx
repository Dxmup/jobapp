"use client"

import { Check, Star, Zap, Crown } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ScrollReveal } from "./animations/scroll-reveal"

export default function LandingPricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Basic tools to get started with your job search",
      features: [
        "3 job applications",
        "Basic resume optimization",
        "Standard cover letter generation",
        "Email support",
      ],
      cta: "Get Started",
      popular: false,
      icon: <Star className="h-6 w-6" />,
      gradient: "from-slate-500 to-slate-600",
      bgGradient: "from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800",
    },
    {
      name: "Pro",
      price: "$25",
      period: "per month",
      description: "Advanced tools for serious job seekers",
      features: [
        "Unlimited job applications",
        "Advanced resume revisions",
        "Unlimited job specific interview questions",
        "Five hours phone interview preparation",
        "Thank you letter generation",
        "Priority support",
      ],
      cta: "Upgrade to Pro",
      popular: true,
      icon: <Zap className="h-6 w-6" />,
      gradient: "from-purple-600 to-cyan-600",
      bgGradient: "from-purple-50 to-cyan-50 dark:from-purple-950/20 dark:to-cyan-950/20",
    },
    {
      name: "Premium",
      price: "$49",
      period: "per month",
      description: "Complete solution for career professionals",
      features: [
        "Everything in Pro",
        "LinkedIn optimization",
        "Ten Hours of Phone Interview Practice",
        "Interview Question Answers",
        "Thoughtful Questions to ask at the Interview",
        "TikTok/Insta Customized Scripts",
        "LinkedIn Post Generator",
      ],
      cta: "Contact Sales",
      popular: false,
      icon: <Crown className="h-6 w-6" />,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
    },
  ]

  return (
    <section
      id="pricing"
      className="py-32 bg-gradient-to-br from-white via-purple-50/30 to-cyan-50/30 dark:from-slate-900 dark:via-purple-950/20 dark:to-cyan-950/20 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <ScrollReveal className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
            Choose the plan that fits your job search needs. Upgrade or downgrade anytime.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <ScrollReveal key={index} delay={index * 0.2} className="h-full">
              <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ duration: 0.3 }} className="h-full">
                <Card
                  className={`relative flex flex-col h-full bg-gradient-to-br ${plan.bgGradient} border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden ${plan.popular ? "ring-2 ring-purple-500 ring-offset-4 ring-offset-background" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0">
                      <div className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-center py-2 text-sm font-bold">
                        🔥 MOST POPULAR
                      </div>
                    </div>
                  )}

                  <CardHeader className={`${plan.popular ? "pt-12" : "pt-8"} pb-4`}>
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${plan.gradient} text-white flex items-center justify-center mb-4 shadow-lg`}
                    >
                      {plan.icon}
                    </div>

                    <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">{plan.name}</CardTitle>

                    <div className="mt-4">
                      <span className="text-5xl font-black bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-slate-600 dark:text-slate-400 ml-2 text-lg">{plan.period}</span>
                      )}
                    </div>

                    <CardDescription className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-grow px-8">
                    <ul className="space-y-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <div className={`p-1 rounded-full bg-gradient-to-r ${plan.gradient} mr-3 flex-shrink-0`}>
                            <Check className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 text-lg">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="p-8 pt-4">
                    <Button
                      className={`w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${
                        plan.popular
                          ? "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0"
                          : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                      asChild
                    >
                      <Link href="/signup">{plan.cta}</Link>
                    </Button>
                  </CardFooter>

                  {/* Hover effect overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-0 hover:opacity-5 transition-opacity duration-500 pointer-events-none`}
                  />
                </Card>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
