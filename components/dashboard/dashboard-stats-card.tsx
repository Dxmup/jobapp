"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Calendar, FileText, FolderKanban, TrendingUp } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <CardDescription className="flex items-center mt-1">
          {trend && (
            <span className={`mr-1 ${trend.isPositive ? "text-green-500" : "text-red-500"} flex items-center`}>
              <TrendingUp className={`h-3 w-3 mr-1 ${!trend.isPositive && "rotate-180"}`} />
              {trend.value}%
            </span>
          )}
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  )
}

export function DashboardStatsCard() {
  const [period, setPeriod] = useState("week")

  // This would be fetched from an API in a real application
  const stats = {
    week: [
      {
        title: "Total Applications",
        value: 12,
        description: "from last week",
        icon: <FolderKanban className="h-4 w-4" />,
        trend: { value: 16, isPositive: true },
      },
      {
        title: "Interviews",
        value: 3,
        description: "from last week",
        icon: <Calendar className="h-4 w-4" />,
        trend: { value: 5, isPositive: true },
      },
      {
        title: "Resumes Created",
        value: 4,
        description: "from last week",
        icon: <FileText className="h-4 w-4" />,
        trend: { value: 12, isPositive: true },
      },
      {
        title: "Response Rate",
        value: "24%",
        description: "from last week",
        icon: <BarChart className="h-4 w-4" />,
        trend: { value: 2, isPositive: false },
      },
    ],
    month: [
      {
        title: "Total Applications",
        value: 42,
        description: "from last month",
        icon: <FolderKanban className="h-4 w-4" />,
        trend: { value: 23, isPositive: true },
      },
      {
        title: "Interviews",
        value: 8,
        description: "from last month",
        icon: <Calendar className="h-4 w-4" />,
        trend: { value: 14, isPositive: true },
      },
      {
        title: "Resumes Created",
        value: 12,
        description: "from last month",
        icon: <FileText className="h-4 w-4" />,
        trend: { value: 8, isPositive: true },
      },
      {
        title: "Response Rate",
        value: "28%",
        description: "from last month",
        icon: <BarChart className="h-4 w-4" />,
        trend: { value: 5, isPositive: true },
      },
    ],
    year: [
      {
        title: "Total Applications",
        value: 156,
        description: "from last year",
        icon: <FolderKanban className="h-4 w-4" />,
        trend: { value: 42, isPositive: true },
      },
      {
        title: "Interviews",
        value: 32,
        description: "from last year",
        icon: <Calendar className="h-4 w-4" />,
        trend: { value: 18, isPositive: true },
      },
      {
        title: "Resumes Created",
        value: 45,
        description: "from last year",
        icon: <FileText className="h-4 w-4" />,
        trend: { value: 15, isPositive: true },
      },
      {
        title: "Response Rate",
        value: "31%",
        description: "from last year",
        icon: <BarChart className="h-4 w-4" />,
        trend: { value: 7, isPositive: true },
      },
    ],
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Application Statistics</CardTitle>
          <Tabs defaultValue="week" value={period} onValueChange={setPeriod} className="w-[240px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats[period as keyof typeof stats].map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
