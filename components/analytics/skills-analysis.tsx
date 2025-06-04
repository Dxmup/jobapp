"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type Skill = {
  name: string
  count: number
  trend: "up" | "down" | "stable"
}

type GapSkill = {
  name: string
  importance: number
}

export function SkillsAnalysis() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [gapSkills, setGapSkills] = useState<GapSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSkillsData() {
      try {
        setLoading(true)
        const response = await fetch("/api/analytics/skills")

        if (!response.ok) {
          throw new Error(`Failed to fetch skills data: ${response.status}`)
        }

        const data = await response.json()
        setSkills(data.skills || [])
        setGapSkills(data.gapSkills || [])
      } catch (err) {
        console.error("Error fetching skills data:", err)
        setError("Failed to load skills analysis")
      } finally {
        setLoading(false)
      }
    }

    fetchSkillsData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>

        <div className="pt-4">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // If no skills data yet, show placeholder message
  if (skills.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Most In-Demand Skills</h3>
          <p className="text-sm text-muted-foreground">Add more job applications to see skill analysis</p>
        </div>

        <div className="p-8 text-center text-muted-foreground">
          As you add more job applications, we'll analyze the job descriptions to identify the most in-demand skills for
          your target roles.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Most In-Demand Skills</h3>
        <p className="text-sm text-muted-foreground">Based on analysis of your target job descriptions</p>
      </div>

      <div className="space-y-4">
        {skills.map((skill) => (
          <div key={skill.name} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{skill.name}</span>
              <span className="text-sm text-muted-foreground flex items-center">
                {skill.count}%{skill.trend === "up" && <span className="text-green-500 ml-1">↑</span>}
                {skill.trend === "down" && <span className="text-red-500 ml-1">↓</span>}
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-purple-600" style={{ width: `${skill.count}%` }} />
            </div>
          </div>
        ))}
      </div>

      {gapSkills.length > 0 && (
        <div className="pt-4">
          <h3 className="text-lg font-medium mb-2">Skills Gap Analysis</h3>
          <div className="border rounded-md p-4">
            <p className="text-sm mb-4">Based on your profile and target jobs, consider developing these skills:</p>
            <ul className="space-y-2">
              {gapSkills.map((skill) => (
                <li key={skill.name} className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-purple-600"></span>
                  {skill.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
