import { FileText, FileEdit, FolderKanban, BarChart, Sparkles, Clock } from "lucide-react"

export function LandingFeatures() {
  const features = [
    {
      icon: <FileText className="h-10 w-10 text-purple-600" />,
      title: "AI Resume Optimization",
      description:
        "Upload your resume and our AI will optimize it for each job application, highlighting relevant skills and experience.",
    },
    {
      icon: <FileEdit className="h-10 w-10 text-cyan-500" />,
      title: "Custom Cover Letters",
      description:
        "Generate tailored cover letters in seconds. Adjust tone, length, and formality to match the company culture.",
    },
    {
      icon: <FolderKanban className="h-10 w-10 text-purple-600" />,
      title: "Job Application Tracking",
      description: "Organize your job applications by status: drafting, applied, interviewing, offer, or rejected.",
    },
    {
      icon: <BarChart className="h-10 w-10 text-cyan-500" />,
      title: "Application Analytics",
      description: "Track your application success rate and get insights to improve your job search strategy.",
    },
    {
      icon: <Sparkles className="h-10 w-10 text-purple-600" />,
      title: "Dual AI Engines",
      description: "Leverage custom AIs for resume revisions and cover letter generation for optimal results.",
    },
    {
      icon: <Clock className="h-10 w-10 text-cyan-500" />,
      title: "Smart Document Management",
      description: "All your documents are organized by job title and automatically archived.",
    },
  ]

  return (
    <section id="features" className="py-20 bg-muted/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Supercharge Your Job Search</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered tools help you create professional application materials tailored to each job opportunity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-background rounded-lg border p-6 transition-all hover:shadow-md hover:-translate-y-1"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
