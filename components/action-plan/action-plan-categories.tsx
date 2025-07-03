"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FileText, Briefcase, MessageSquare, Calendar, Search } from "lucide-react"

interface CategoryItem {
  id: string
  name: string
  progress: number
  color: string
  count: {
    completed: number
    total: number
  }
}

export function ActionPlanCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        const response = await fetch("/api/action-plan/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case "resume":
        return <FileText className="h-5 w-5" />
      case "applications":
        return <Briefcase className="h-5 w-5" />
      case "interviews":
        return <MessageSquare className="h-5 w-5" />
      case "followups":
        return <Calendar className="h-5 w-5" />
      case "research":
        return <Search className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-muted rounded-full"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-muted rounded w-8"></div>
                </div>
                <div className="h-1.5 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No category data available.</p>
            <p className="text-sm mt-1">Start using the platform to see your progress.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-full ${category.color.replace("bg-", "bg-opacity-20 ")}`}>
                      {getCategoryIcon(category.id)}
                    </div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {category.count.completed}/{category.count.total}
                  </span>
                </div>
                <Progress value={category.progress} className="h-1.5" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
