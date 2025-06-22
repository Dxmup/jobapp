"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, FileText, Calendar, Zap, Target, ArrowRight, Sparkles, BarChart3, PlusCircle } from "lucide-react"
import Link from "next/link"
import { JobsCarousel } from "./jobs-carousel"

interface DashboardStats {
  totalApplications: number
  activeApplications: number
  interviewsScheduled: number
  responseRate: number
  weeklyGoal: number
  weeklyProgress: number
}

export function EnhancedDashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState<string>("")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log("Fetching dashboard stats from API...")
        const response = await fetch("/api/dashboard/stats")
        console.log("Dashboard stats response status:", response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("Dashboard stats data received:", data)
          setStats(data)
        } else {
          console.error("Dashboard stats API error:", response.status, response.statusText)
          // Fallback to zeros if API fails
          setStats({
            totalApplications: 0,
            activeApplications: 0,
            interviewsScheduled: 0,
            responseRate: 0,
            weeklyGoal: 5,
            weeklyProgress: 0,
          })
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
        // Fallback to zeros
        setStats({
          totalApplications: 0,
          activeApplications: 0,
          interviewsScheduled: 0,
          responseRate: 0,
          weeklyGoal: 5,
          weeklyProgress: 0,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()

    // Fetch user name
    const fetchUserName = async () => {
      try {
        const response = await fetch("/api/user/profile")
        if (response.ok) {
          const userData = await response.json()
          const name = userData.full_name || userData.first_name || userData.email?.split("@")[0] || ""
          setUserName(name)
        }
      } catch (error) {
        console.error("Failed to fetch user name:", error)
      }
    }

    fetchUserName()
  }, [])

  const quickActions = [
    {
      title: "Add New Job",
      description: "Track a new application",
      icon: PlusCircle,
      href: "/dashboard/jobs/new",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Build Resume",
      description: "Create or customize",
      icon: FileText,
      href: "/dashboard/build-resume",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Interview Prep",
      description: "Practice questions",
      icon: Target,
      href: "/dashboard/interview-prep",
      gradient: "from-purple-500 to-violet-500",
    },
    {
      title: "Schedule Event",
      description: "Add to calendar",
      icon: Calendar,
      href: "/dashboard/schedule",
      gradient: "from-orange-500 to-red-500",
    },
  ]

  if (isLoading || !stats) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6 lg:space-y-8 max-w-full overflow-hidden">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border border-white/10 p-4 sm:p-6 lg:p-8 max-w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-cyan-500/5 to-purple-600/10" />
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 lg:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl lg:rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                Welcome back{userName ? `'s ${userName}` : ""}!
              </h1>
              <p className="text-white/60 text-sm sm:text-base">Ready to land your dream job?</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mt-4 lg:mt-6 max-w-full">
            {[
              { label: "Applications", value: stats.totalApplications, icon: FileText },
              { label: "Active", value: stats.activeApplications, icon: TrendingUp },
              { label: "Interviews", value: stats.interviewsScheduled, icon: Calendar },
              { label: "Response Rate", value: `${stats.responseRate}%`, icon: BarChart3 },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-lg lg:rounded-xl p-2 sm:p-3 lg:p-4 border border-white/10 min-w-0"
              >
                <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md lg:rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <stat.icon className="w-3 h-3 sm:w-4 sm:h-4 text-white/70" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-white truncate">
                      {stat.value}
                    </p>
                    <p className="text-xs text-white/60 truncate">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs Carousel */}
      <JobsCarousel />

      {/* Quick Actions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Quick Actions</h2>
          <Badge className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0 w-fit">
            <Zap className="w-3 h-3 mr-1" />
            Boost productivity
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href} className="block">
              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm hover:from-white/10 hover:to-white/5 transition-all duration-300 hover:scale-105 hover:shadow-2xl h-full">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
                <CardContent className="relative p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg lg:rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}
                    >
                      <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors ml-auto" />
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-foreground transition-colors text-sm sm:text-base">
                    {action.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Weekly Progress */}
      <Card className="border-0 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
                Weekly Goal Progress
              </CardTitle>
              <CardDescription className="text-sm">
                {stats.weeklyProgress} of {stats.weeklyGoal} applications this week
              </CardDescription>
            </div>
            <Badge
              className={`${
                stats.weeklyProgress >= stats.weeklyGoal
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-orange-500 to-red-500"
              } text-white border-0 w-fit`}
            >
              {stats.weeklyProgress && stats.weeklyGoal
                ? Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100)
                : 0}
              %
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-4">
            <div className="h-2 sm:h-3 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${stats.weeklyProgress && stats.weeklyGoal ? Math.min((stats.weeklyProgress / stats.weeklyGoal) * 100, 100) : 0}%`,
                }}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                {stats.weeklyGoal && stats.weeklyProgress
                  ? stats.weeklyGoal - stats.weeklyProgress > 0
                    ? `${stats.weeklyGoal - stats.weeklyProgress} more to reach your goal`
                    : "Goal achieved! 🎉"
                  : "No goal set"}
              </span>
              <Button variant="outline" size="sm" asChild className="w-fit">
                <Link href="/dashboard/jobs/new">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Application
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="h-32 sm:h-40 lg:h-48 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-muted/50 to-muted/20 animate-pulse" />
      <div className="h-24 sm:h-32 rounded-xl bg-muted/50 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 sm:h-32 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
      <div className="h-32 sm:h-40 rounded-xl bg-muted/50 animate-pulse" />
    </div>
  )
}
