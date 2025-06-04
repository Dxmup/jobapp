"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ApplicationsChart } from "@/components/analytics/applications-chart"
import { ResponseRateChart } from "@/components/analytics/response-rate-chart"
import { InterviewsChart } from "@/components/analytics/interviews-chart"
import { SkillsAnalysis } from "@/components/analytics/skills-analysis"
import { ApplicationsTable } from "@/components/analytics/applications-table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Track your job application performance and insights.</p>
      </div>
      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
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
                    <div className="text-2xl font-bold">{analyticsData?.totalApplications || 0}</div>
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

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
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
                    <div className="text-2xl font-bold">{analyticsData ? `${analyticsData.responseRate}%` : "0%"}</div>
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

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Interviews</CardTitle>
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
                    <div className="text-2xl font-bold">{analyticsData?.interviews || 0}</div>
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
            <Card className="col-span-1">
              <CardHeader>
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
                            <div className="text-2xl font-bold">{analyticsData?.totalApplications || 0}</div>
                            <div className="text-sm text-muted-foreground">Total Applications</div>
                          </div>
                        </div>
                        {analyticsData && analyticsData.totalApplications > 0 ? (
                          <svg width="250" height="250" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="15" />
                            {/* Calculate stroke dasharray and offset based on real data */}
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
                        <span className="text-sm">Drafting ({analyticsData?.applicationsByStatus.drafting || 0})</span>
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
                        <span className="text-sm">Rejected ({analyticsData?.applicationsByStatus.rejected || 0})</span>
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

            <Card className="col-span-1">
              <CardHeader>
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
                        {/* This would be replaced with real data in a production app */}
                        {Array(12)
                          .fill(0)
                          .map((_, i) => (
                            <div
                              key={i}
                              className={`${i === 11 ? "bg-purple-600 dark:bg-purple-600" : "bg-purple-200 dark:bg-purple-900"} rounded-t`}
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

          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Your most recent job applications and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <ApplicationsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="mt-6">
          <Card>
            <CardHeader>
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
                  <p className="text-muted-foreground">
                    Detailed application analytics will appear here as you add more job applications.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviews" className="mt-6">
          <Card>
            <CardHeader>
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
                  <p className="text-muted-foreground">
                    Interview analytics will appear here as you complete more interviews.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <Card>
            <CardHeader>
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
  )
}
