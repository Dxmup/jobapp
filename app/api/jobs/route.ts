import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getJobs, createJob } from "@/lib/jobs"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const jobs = await getJobs(userId)

    return NextResponse.json({ success: true, jobs })
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch jobs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    if (!data.title || !data.company) {
      return NextResponse.json({ success: false, error: "Job title and company are required" }, { status: 400 })
    }

    const job = await createJob({
      userId,
      title: data.title,
      company: data.company,
      location: data.location,
      description: data.description,
      status: data.status,
      url: data.url,
    })

    return NextResponse.json({ success: true, job })
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json({ success: false, error: "Failed to create job" }, { status: 500 })
  }
}
