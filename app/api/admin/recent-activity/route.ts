import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAdminUser } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  try {
    console.log("Recent activity API called")

    const adminUser = await getAdminUser()
    if (!adminUser) {
      console.log("Admin authentication failed")
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    console.log("Admin user authenticated:", adminUser.email)

    const supabase = createClient()
    const activities = []

    // Recent user registrations
    try {
      const { data: recentUsers, error } = await supabase
        .from("users")
        .select("id, name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(3)

      if (error) {
        console.error("Error fetching recent users for activity:", error)
      } else if (recentUsers) {
        recentUsers.forEach((user) => {
          activities.push({
            id: `user_${user.id}`,
            user_name: user.name || "New User",
            user_email: user.email,
            action: "registered an account",
            target: "",
            created_at: user.created_at,
            type: "user_registered",
          })
        })
      }
    } catch (error) {
      console.error("Error processing recent users:", error)
    }

    // Recent job applications
    try {
      const { data: recentJobs, error } = await supabase
        .from("jobs")
        .select("id, title, company, created_at, user_id, userId")
        .order("created_at", { ascending: false })
        .limit(3)

      if (error) {
        console.error("Error fetching recent jobs for activity:", error)
      } else if (recentJobs) {
        for (const job of recentJobs) {
          try {
            const userId = job.user_id || job.userId
            if (userId) {
              const { data: userData } = await supabase.from("users").select("name, email").eq("id", userId).single()

              if (userData) {
                activities.push({
                  id: `job_${job.id}`,
                  user_name: userData.name || "User",
                  user_email: userData.email,
                  action: "created a job application for",
                  target: `${job.title} at ${job.company}`,
                  created_at: job.created_at,
                  type: "job_created",
                })
              }
            }
          } catch (userError) {
            console.error("Error fetching user data for job:", userError)
          }
        }
      }
    } catch (error) {
      console.error("Error processing recent jobs:", error)
    }

    // Recent resumes
    try {
      const { data: recentResumes, error } = await supabase
        .from("resumes")
        .select("id, title, created_at, user_id, userId")
        .order("created_at", { ascending: false })
        .limit(2)

      if (error) {
        console.error("Error fetching recent resumes for activity:", error)
      } else if (recentResumes) {
        for (const resume of recentResumes) {
          try {
            const userId = resume.user_id || resume.userId
            if (userId) {
              const { data: userData } = await supabase.from("users").select("name, email").eq("id", userId).single()

              if (userData) {
                activities.push({
                  id: `resume_${resume.id}`,
                  user_name: userData.name || "User",
                  user_email: userData.email,
                  action: "created a resume",
                  target: resume.title || "Untitled Resume",
                  created_at: resume.created_at,
                  type: "content_created",
                })
              }
            }
          } catch (userError) {
            console.error("Error fetching user data for resume:", userError)
          }
        }
      }
    } catch (error) {
      console.error("Error processing recent resumes:", error)
    }

    // Sort all activities by date and take the most recent 10
    const sortedActivities = activities
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)

    console.log("Returning activities:", sortedActivities.length)
    return NextResponse.json({ activities: sortedActivities })
  } catch (error) {
    console.error("Error in recent activity API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch recent activity",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
