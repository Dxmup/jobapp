import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function LandingPricing() {
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
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      description: "Advanced tools for serious job seekers",
      features: [
        "Unlimited job applications",
        "Custom Interview questions",
        "Phone interview preparation",
        "Offer Letter Review",
      ],
      cta: "Upgrade to Pro",
      popular: true,
    },
    {
      name: "Premium",
      price: "$49",
      period: "per month",
      description: "Complete solution for career professionals",
      features: ["Everything in Pro", "LinkedIn optimization", "Plain language benefits explanation"],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your job search needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative flex flex-col ${plan.popular ? "border-purple-500 shadow-lg" : ""}`}>
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
              <CardContent className="flex-grow">
                <ul className="space-y-2 h-[200px]">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center h-8">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className={`w-full ${plan.popular ? "bg-purple-600 hover:bg-purple-700" : ""}`} asChild>
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
