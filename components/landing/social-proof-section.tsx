"use client"
import { SuccessStoriesTicker } from "../animations/success-stories-ticker"
import { ScrollReveal } from "../animations/scroll-reveal"
import { Star, Users, Briefcase, TrendingUp, Award, Target } from "lucide-react"

export function SocialProofSection() {
  const stats = [
    {
      icon: <Users className="h-8 w-8" />,
      value: 12547,
      suffix: "+",
      label: "Job Seekers Helped",
      color: "text-blue-600",
    },
    {
      icon: <Briefcase className="h-8 w-8" />,
      value: 8932,
      suffix: "+",
      label: "Successful Hires",
      color: "text-green-600",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      value: 340,
      suffix: "%",
      label: "More Interviews",
      color: "text-purple-600",
    },
    { icon: <Star className="h-8 w-8" />, value: 4.9, suffix: "/5", label: "User Rating", color: "text-yellow-600" },
    { icon: <Award className="h-8 w-8" />, value: 95, suffix: "%", label: "Success Rate", color: "text-orange-600" },
    {
      icon: <Target className="h-8 w-8" />,
      value: 7,
      suffix: " days",
      label: "Avg. Time to Hire",
      color: "text-cyan-600",
    },
  ]

  return (
    <section className="py-32 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] opacity-20" />
      </div>

      <div className="container relative z-10">
        <ScrollReveal className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Join Thousands Who've Already
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Landed Their Dream Jobs
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
            Real results from real people who transformed their job search with AI
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.8}>
          <SuccessStoriesTicker />
        </ScrollReveal>

        {/* Testimonial highlight */}
        <ScrollReveal className="mt-20" delay={1}>
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-2xl md:text-3xl font-medium text-white mb-6 leading-relaxed">
                "JobCraft AI didn't just help me get a job—it helped me land my dream role. The AI-optimized practice interviews gave me the confidence I needed to crush my interviews."erviews."terviews."terviews">
                  SM
                </div>
                <div className="text-left">
                  <div className="text-white font-semibold">Sarah Martinez</div>
                  <div className="text-slate-300">Software Engineer at Google</div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </dSoftware Engineer
