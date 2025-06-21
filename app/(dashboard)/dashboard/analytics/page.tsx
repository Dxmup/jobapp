"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApplicationsChart } from "@/components/analytics/applications-chart"
import { ResponseRateChart } from "@/components/analytics/response-rate-chart"
import { InterviewsChart } from "@/components/analytics/interviews-chart"
import { SkillsAnalysis } from "@/components/analytics/skills-analysis"
import { ApplicationsTable } from "@/components/analytics/applications-table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, BarChart3, TrendingUp, Target, Users, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type AnalyticsData = {
  totalApplications: number
  responseRate: number
  interviews: number
  applicationsByStatus: {
    drafting: number
    applied: number
    interviewing: number
    offer: number
    rejected: number
    noResponse: number
  }
  applicationTrend: number
  responseRateTrend: number
  interviewsTrend: number
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/analytics/overview?period=${dateRange}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch analytics data: ${response.status}`)
        }

        const data = await response.json()
        setAnalyticsData(data)
      } catch (err) {
        console.error("Error fetching analytics data:", err)
        setError("Failed to load analytics data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [dateRange])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Analytics</h1>
                </div>
                <p className="text-lg text-white/90 max-w-2xl">
                  Track your job application performance and insights. Monitor your progress and optimize your job
                  search strategy.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-white/80" />
                    <span className="text-sm text-white/80">Applications</span>
                  </div>
                  <div className="text-2xl font-bold">{analyticsData?.totalApplications || 0}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-white/80" />
                    <span className="text-sm text-white/80">Response Rate</span>
                  </div>
                  <div className="text-2xl font-bold">{analyticsData?.responseRate || 0}%</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-white/80" />
                    <span className="text-sm text-white/80">Interviews</span>
                  </div>
                  <div className="text-2xl font-bold">{analyticsData?.interviews || 0}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-white/80" />
                    <span className="text-sm text-white/80">Period</span>
                  </div>
                  <div className="text-lg font-bold">{dateRange} days</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Controls */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="h-10 rounded-lg border border-white/20 bg-white/50 px-3 py-2 text-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                    <option value="all">All time</option>
                  </select>
                </div>
                <Badge variant="outline" className="bg-white/50">
                  Analytics Dashboard
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="mb-8">
            <Alert variant="destructive" className="bg-red-50/80 backdrop-blur-sm border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <Tabs defaultValue="overview">
          <div className="mb-6">
            <TabsList className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="applications"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                Applications
              </TabsTrigger>
              <TabsTrigger
                value="interviews"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                Interviews
              </TabsTrigger>
              <TabsTrigger
                value="skills"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                Skills
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-600" />
                    Total Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-[60px] w-full mt-4" />
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-gray-900">{analyticsData?.totalApplications || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {analyticsData && analyticsData.applicationTrend > 0 ? (
                          <span className="text-green-500">+{analyticsData.applicationTrend}%</span>
                        ) : analyticsData && analyticsData.applicationTrend < 0 ? (
                          <span className="text-red-500">{analyticsData.applicationTrend}%</span>
                        ) : (
                          <span>No change</span>
                        )}{" "}
                        from previous period
                      </p>
                      <div className="mt-4 h-[60px]">
                        <ApplicationsChart />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                    Response Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-[60px] w-full mt-4" />
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-gray-900">
                        {analyticsData ? `${analyticsData.responseRate}%` : "0%"}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {analyticsData && analyticsData.responseRateTrend > 0 ? (
                          <span className="text-green-500">+{analyticsData.responseRateTrend}%</span>
                        ) : analyticsData && analyticsData.responseRateTrend < 0 ? (
                          <span className="text-red-500">{analyticsData.responseRateTrend}%</span>
                        ) : (
                          <span>No change</span>
                        )}{" "}
                        from previous period
                      </p>
                      <div className="mt-4 h-[60px]">
                        <ResponseRateChart />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-cyan-600" />
                    Interviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-[60px] w-full mt-4" />
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-gray-900">{analyticsData?.interviews || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {analyticsData && analyticsData.interviewsTrend > 0 ? (
                          <span className="text-green-500">+{analyticsData.interviewsTrend}</span>
                        ) : analyticsData && analyticsData.interviewsTrend < 0 ? (
                          <span className="text-red-500">{analyticsData.interviewsTrend}</span>
                        ) : (
                          <span>No change</span>
                        )}{" "}
                        from previous period
                      </p>
                      <div className="mt-4 h-[60px]">
                        <InterviewsChart />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="col-span-1 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-white/20">
                  <CardTitle>Application Status</CardTitle>
                  <CardDescription>Distribution of your job applications by status</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="w-[250px] h-[250px] relative">
                        <Skeleton className="w-full h-full rounded-full" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-[300px]">
                      <div className="flex items-center justify-center h-full">
                        <div className="w-[250px] h-[250px] relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">
                                {analyticsData?.totalApplications || 0}
                              </div>
                              <div className="text-sm text-muted-foreground">Total Applications</div>
                            </div>
                          </div>
                          {analyticsData && analyticsData.totalApplications > 0 ? (
                            <svg width="250" height="250" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="15" />
                              {analyticsData.applicationsByStatus.drafting > 0 && (
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  fill="none"
                                  stroke="#c084fc"
                                  strokeWidth="15"
                                  strokeDasharray={`${(analyticsData.applicationsByStatus.drafting / analyticsData.totalApplications) * 251.2} 251.2`}
                                  strokeDashoffset="0"
                                />
                              )}
                              {analyticsData.applicationsByStatus.applied > 0 && (
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  fill="none"
                                  stroke="#60a5fa"
                                  strokeWidth="15"
                                  strokeDasharray={`${(analyticsData.applicationsByStatus.applied / analyticsData.totalApplications) * 251.2} 251.2`}
                                  strokeDashoffset={`-${(analyticsData.applicationsByStatus.drafting / analyticsData.totalApplications) * 251.2}`}
                                />
                              )}
                              {analyticsData.applicationsByStatus.interviewing > 0 && (
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  fill="none"
                                  stroke="#a855f7"
                                  strokeWidth="15"
                                  strokeDasharray={`${(analyticsData.applicationsByStatus.interviewing / analyticsData.totalApplications) * 251.2} 251.2`}
                                  strokeDashoffset={`-${((analyticsData.applicationsByStatus.drafting + analyticsData.applicationsByStatus.applied) / analyticsData.totalApplications) * 251.2}`}
                                />
                              )}
                              {analyticsData.applicationsByStatus.offer > 0 && (
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  fill="none"
                                  stroke="#4ade80"
                                  strokeWidth="15"
                                  strokeDasharray={`${(analyticsData.applicationsByStatus.offer / analyticsData.totalApplications) * 251.2} 251.2`}
                                  strokeDashoffset={`-${((analyticsData.applicationsByStatus.drafting + analyticsData.applicationsByStatus.applied + analyticsData.applicationsByStatus.interviewing) / analyticsData.totalApplications) * 251.2}`}
                                />
                              )}
                              {analyticsData.applicationsByStatus.rejected > 0 && (
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  fill="none"
                                  stroke="#f87171"
                                  strokeWidth="15"
                                  strokeDasharray={`${(analyticsData.applicationsByStatus.rejected / analyticsData.totalApplications) * 251.2} 251.2`}
                                  strokeDashoffset={`-${((analyticsData.applicationsByStatus.drafting + analyticsData.applicationsByStatus.applied + analyticsData.applicationsByStatus.interviewing + analyticsData.applicationsByStatus.offer) / analyticsData.totalApplications) * 251.2}`}
                                />
                              )}
                            </svg>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <p className="text-muted-foreground">No application data available</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center">
                          <span className="h-3 w-3 rounded-full bg-[#c084fc] mr-2"></span>
                          <span className="text-sm">
                            Drafting ({analyticsData?.applicationsByStatus.drafting || 0})
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="h-3 w-3 rounded-full bg-[#60a5fa] mr-2"></span>
                          <span className="text-sm">Applied ({analyticsData?.applicationsByStatus.applied || 0})</span>
                        </div>
                        <div className="flex items-center">
                          <span className="h-3 w-3 rounded-full bg-[#a855f7] mr-2"></span>
                          <span className="text-sm">
                            Interviewing ({analyticsData?.applicationsByStatus.interviewing || 0})
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="h-3 w-3 rounded-full bg-[#4ade80] mr-2"></span>
                          <span className="text-sm">Offer ({analyticsData?.applicationsByStatus.offer || 0})</span>
                        </div>
                        <div className="flex items-center">
                          <span className="h-3 w-3 rounded-full bg-[#f87171] mr-2"></span>
                          <span className="text-sm">
                            Rejected ({analyticsData?.applicationsByStatus.rejected || 0})
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="h-3 w-3 rounded-full bg-[#f3f4f6] mr-2"></span>
                          <span className="text-sm">
                            No Response ({analyticsData?.applicationsByStatus.noResponse || 0})
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="col-span-1 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-white/20">
                  <CardTitle>Application Timeline</CardTitle>
                  <CardDescription>Your job application activity over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-[300px]">
                      <Skeleton className="w-full h-full" />
                    </div>
                  ) : (
                    <div className="h-[300px]">
                      <div className="flex flex-col h-full">
                        <div className="flex-1 grid grid-cols-12 gap-2 items-end pb-6">
                          {Array(12)
                            .fill(0)
                            .map((_, i) => (
                              <div
                                key={i}
                                className={`${i === 11 ? "bg-gradient-to-t from-purple-600 to-indigo-600" : "bg-gradient-to-t from-purple-200 to-indigo-200"} rounded-t`}
                                style={{ height: `${Math.max(15, Math.floor(Math.random() * 85))}%` }}
                              ></div>
                            ))}
                        </div>

                        <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground">
                          {["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"].map(
                            (month, i) => (
                              <div key={i} className="text-center">
                                {month}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-white/20">
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Your most recent job applications and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <ApplicationsTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="mt-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-white/20">
                <CardTitle>Application Analytics</CardTitle>
                <CardDescription>Detailed analysis of your job applications</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[400px] space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-[350px] w-full" />
                  </div>
                ) : (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                        <BarChart3 className="h-8 w-8 text-purple-600" />
                      </div>
                      <p className="text-muted-foreground">
                        Detailed application analytics will appear here as you add more job applications.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interviews" className="mt-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-white/20">
                <CardTitle>Interview Analytics</CardTitle>
                <CardDescription>Track your interview performance and outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[400px] space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-[350px] w-full" />
                  </div>
                ) : (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                        <Users className="h-8 w-8 text-purple-600" />
                      </div>
                      <p className="text-muted-foreground">
                        Interview analytics will appear here as you complete more interviews.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="mt-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-white/20">
                <CardTitle>Skills Analysis</CardTitle>
                <CardDescription>Analyze which skills are most in-demand for your target roles</CardDescription>
              </CardHeader>
              <CardContent>
                <SkillsAnalysis />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
