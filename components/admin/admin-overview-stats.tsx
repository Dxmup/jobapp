"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, Users, FileText, CreditCard, Zap } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type AdminStats = {
  totalUsers: number
  totalApplications: number
  totalRevenue: number
  aiTokensUsed: number
  userGrowth: number
  applicationGrowth: number
  revenueGrowth: number
  activeSubscriptions: number
  totalResumes: number
  totalCoverLetters: number
}

export function AdminOverviewStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAdminStats() {
      try {
        console.log("Fetching admin stats...")
        const response = await fetch("/api/admin/stats")
        console.log("Response status:", response.status)

        if (!response.ok) {
          const errorData = await response.json()
          console.error("API error:", errorData)
          throw new Error(errorData.error || "Failed to fetch admin stats")
        }

        const data = await response.json()
        console.log("Stats data:", data)
        setStats(data.stats)
      } catch (err) {
        console.error("Error fetching admin stats:", err)
        setError(err instanceof Error ? err.message : "Failed to load statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchAdminStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-500 mb-2">Error loading statistics</div>
              <div className="text-sm text-muted-foreground">{error}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className={`flex items-center ${stats?.userGrowth >= 0 ? "text-green-500" : "text-red-500"}`}>
              <ArrowUpRight className="h-3 w-3" /> {Math.abs(stats?.userGrowth || 0)}%
            </span>
            from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Job Applications</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className={`flex items-center ${stats?.applicationGrowth >= 0 ? "text-green-500" : "text-red-500"}`}>
              <ArrowUpRight className="h-3 w-3" /> {Math.abs(stats?.applicationGrowth || 0)}%
            </span>
            from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div>
          <p className="text-xs text-muted-foreground">${stats?.totalRevenue || 0} revenue</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Content Created</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(stats?.totalResumes || 0) + (stats?.totalCoverLetters || 0)}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.totalResumes || 0} resumes, {stats?.totalCoverLetters || 0} cover letters
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
