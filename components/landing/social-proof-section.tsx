"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer",
    company: "Google",
    avatar: "/placeholder-user.jpg",
    content:
      "JobCraft AI helped me land my dream job at Google. The resume optimization was incredible - I got 3x more interviews!",
    rating: 5,
    badge: "Hired at Google",
  },
  {
    name: "Marcus Johnson",
    role: "Product Manager",
    company: "Microsoft",
    avatar: "/placeholder-user.jpg",
    content:
      "The interview prep feature was a game-changer. I felt confident and prepared for every question they threw at me.",
    rating: 5,
    badge: "Hired at Microsoft",
  },
  {
    name: "Emily Rodriguez",
    role: "UX Designer",
    company: "Airbnb",
    avatar: "/placeholder-user.jpg",
    content:
      "I was struggling to get responses to my applications. After using JobCraft AI, I had 5 interviews in 2 weeks!",
    rating: 5,
    badge: "Hired at Airbnb",
  },
  {
    name: "David Kim",
    role: "Data Scientist",
    company: "Netflix",
    avatar: "/placeholder-user.jpg",
    content:
      "The AI-generated cover letters were so personalized and compelling. It saved me hours and got me better results.",
    rating: 5,
    badge: "Hired at Netflix",
  },
  {
    name: "Lisa Wang",
    role: "DevOps Engineer",
    company: "Stripe",
    avatar: "/placeholder-user.jpg",
    content: "JobCraft AI transformed my job search. From struggling to get interviews to multiple offers in a month!",
    rating: 5,
    badge: "Hired at Stripe",
  },
  {
    name: "Alex Thompson",
    role: "Frontend Developer",
    company: "Shopify",
    avatar: "/placeholder-user.jpg",
    content:
      "The resume optimization feature highlighted skills I didn't even know were valuable. Incredible AI insights!",
    rating: 5,
    badge: "Hired at Shopify",
  },
]

const companies = [
  { name: "Google", logo: "/placeholder-logo.svg" },
  { name: "Microsoft", logo: "/placeholder-logo.svg" },
  { name: "Apple", logo: "/placeholder-logo.svg" },
  { name: "Amazon", logo: "/placeholder-logo.svg" },
  { name: "Meta", logo: "/placeholder-logo.svg" },
  { name: "Netflix", logo: "/placeholder-logo.svg" },
  { name: "Airbnb", logo: "/placeholder-logo.svg" },
  { name: "Stripe", logo: "/placeholder-logo.svg" },
]

export function SocialProofSection() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900">
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
            Success Stories
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 dark:from-slate-100 dark:via-purple-100 dark:to-slate-100 bg-clip-text text-transparent">
            Join thousands who landed their dream jobs
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real people, real results. See how JobCraft AI has transformed careers across the tech industry.
          </p>
        </motion.div>

        {/* Company Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-16"
        >
          <p className="text-center text-sm text-muted-foreground mb-8">
            Our users have been hired at top companies including:
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {companies.map((company, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
                <span className="font-medium text-slate-600 dark:text-slate-400">{company.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {testimonial.badge}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </p>
                      <div className="flex items-center mt-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <Quote className="absolute -top-2 -left-2 w-6 h-6 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm leading-relaxed pl-4">{testimonial.content}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-1">10,000+</div>
              <div className="text-sm text-muted-foreground">Success Stories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-1">85%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-1">3x</div>
              <div className="text-sm text-muted-foreground">More Interviews</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-1">50%</div>
              <div className="text-sm text-muted-foreground">Faster Hiring</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
