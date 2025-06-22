"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  TrendingUp,
  Calendar,
  FileText,
  Target,
  Sparkles,
  Plus,
  ArrowRight,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
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

interface UserProfile {
  full_name?: string
  first_name?: string
  last_name?: string
  email?: string
}

export function EnhancedDashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, profileRes, jobsRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/user/profile"),
          fetch("/api/jobs"),
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setUserProfile(profileData)
        }

        if (jobsRes.ok) {
          const jobsData = await jobsRes.json()
          setJobs(Array.isArray(jobsData) ? jobsData : jobsData.jobs || [])
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getUserDisplayName = () => {
    if (!userProfile) return ""

    if (userProfile.full_name) {
      return userProfile.full_name
    }

    if (userProfile.first_name || userProfile.last_name) {
      return `${userProfile.first_name || ""} ${userProfile.last_name || ""}`.trim()
    }

    if (userProfile.email) {
      return userProfile.email.split("@")[0]
    }

    return ""
  }

  const userName = getUserDisplayName()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 sm:p-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 sm:p-8 border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-cyan-600/20" />
        <div className="absolute top-4 right-4 opacity-20">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                Welcome back{userName ? `, ${userName}` : ""}!
              </h1>
              <p className="text-white/60 text-sm sm:text-base">Ready to land your dream job?</p>
              {!userName && (
                <Link href="/dashboard/profile">
                  <Button variant="link" className="text-cyan-400 hover:text-cyan-300 p-0 h-auto text-sm">
                    Complete your profile →
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalApplications || 0}</div>
            <p className="text-xs text-white/60">{stats?.activeApplications || 0} active</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.interviewsScheduled || 0}</div>
            <p className="text-xs text-white/60">scheduled this month</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.responseRate || 0}%</div>
            <p className="text-xs text-white/60">above average</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Weekly Goal</CardTitle>
            <Target className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats?.weeklyProgress || 0}/{stats?.weeklyGoal || 5}
            </div>
            <Progress value={((stats?.weeklyProgress || 0) / (stats?.weeklyGoal || 5)) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Jobs Carousel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Recent Applications</h2>
          <Link href="/dashboard/jobs">
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <JobsCarousel jobs={jobs} />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/10 bg-gradient-to-br from-purple-900/20 to-purple-800/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/jobs/new">
              <Button className="w-full justify-start" variant="ghost">
                Add New Job
              </Button>
            </Link>
            <Link href="/dashboard/resumes">
              <Button className="w-full justify-start" variant="ghost">
                Upload Resume
              </Button>
            </Link>
            <Link href="/dashboard/interview-prep">
              <Button className="w-full justify-start" variant="ghost">
                Practice Interview
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-gradient-to-br from-cyan-900/20 to-cyan-800/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm text-white/80">2 applications sent</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-400" />
                <span className="text-sm text-white/80">1 interview tomorrow</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-white/80">3 follow-ups due</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-gradient-to-br from-green-900/20 to-green-800/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/80">Weekly Applications</span>
                  <span className="text-white">
                    {stats?.weeklyProgress || 0}/{stats?.weeklyGoal || 5}
                  </span>
                </div>
                <Progress value={((stats?.weeklyProgress || 0) / (stats?.weeklyGoal || 5)) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/80">Interview Rate</span>
                  <span className="text-white">{stats?.responseRate || 0}%</span>
                </div>
                <Progress value={stats?.responseRate || 0} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
