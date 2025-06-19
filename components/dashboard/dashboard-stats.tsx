import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Eye, Heart, Send } from "lucide-react"

export function DashboardStats() {
  const stats = [
    {
      title: "Applications Sent",
      value: "12",
      icon: Send,
      description: "This month",
    },
    {
      title: "Profile Views",
      value: "48",
      icon: Eye,
      description: "Last 30 days",
    },
    {
      title: "Saved Jobs",
      value: "6",
      icon: Heart,
      description: "In your list",
    },
    {
      title: "Interview Requests",
      value: "3",
      icon: Briefcase,
      description: "Pending",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
