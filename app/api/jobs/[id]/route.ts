import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getJobById, updateJob, deleteJob } from "@/lib/jobs"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const job = await getJobById(params.id)

    if (!job) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 })
    }

    // Check if the job belongs to the user
    if (job.userId !== userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ success: true, job })
  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch job" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const job = await getJobById(params.id)

    if (!job) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 })
    }

    // Check if the job belongs to the user
    if (job.userId !== userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const data = await request.json()

    const updatedJob = await updateJob(params.id, {
      title: data.title,
      company: data.company,
      location: data.location,
      description: data.description,
      status: data.status,
      url: data.url,
      appliedAt: data.appliedAt,
    })

    return NextResponse.json({ success: true, job: updatedJob })
  } catch (error) {
    console.error("Error updating job:", error)
    return NextResponse.json({ success: false, error: "Failed to update job" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const job = await getJobById(params.id)

    if (!job) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 })
    }

    // Check if the job belongs to the user
    if (job.userId !== userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    // Delete the job
    await deleteJob(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting job:", error)
    return NextResponse.json({ success: false, error: "Failed to delete job" }, { status: 500 })
  }
}
