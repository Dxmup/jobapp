import { Brain, FileText, MessageSquare, Target, Zap, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function LandingFeatures() {
  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI Resume Optimization",
      description:
        "Transform your resume with AI-powered suggestions that match job requirements and beat ATS systems.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Smart Cover Letters",
      description: "Generate personalized cover letters that highlight your strengths and match the company culture.",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Interview Preparation",
      description: "Practice with AI-generated interview questions tailored to your target role and industry.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Job Matching",
      description: "Find the perfect opportunities with our intelligent job matching algorithm.",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Instant Results",
      description: "Get optimized resumes and cover letters in seconds, not hours.",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Privacy First",
      description: "Your data is encrypted and secure. We never share your information with third parties.",
      gradient: "from-indigo-500 to-purple-500",
    },
  ]

  return (
    <section
      id="features"
      className="py-32 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/30"
    >
      <div className="container">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Powerful AI Features
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
            Everything you need to land your dream job, powered by cutting-edge AI technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <CardHeader>
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white flex items-center justify-center mb-4 shadow-lg`}
                >
                  {feature.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
