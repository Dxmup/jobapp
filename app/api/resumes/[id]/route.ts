import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getResumeById, updateResume, deleteResume } from "@/lib/resumes"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const resume = await getResumeById(params.id)

    if (!resume) {
      return NextResponse.json({ success: false, error: "Resume not found" }, { status: 404 })
    }

    // Check if the resume belongs to the user
    if (resume.userId !== userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ success: true, resume })
  } catch (error) {
    console.error("Error fetching resume:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch resume" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const resume = await getResumeById(params.id)

    if (!resume) {
      return NextResponse.json({ success: false, error: "Resume not found" }, { status: 404 })
    }

    // Check if the resume belongs to the user
    if (resume.userId !== userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const data = await request.json()

    const updatedResume = await updateResume(params.id, {
      name: data.name,
      content: data.content,
      jobTitle: data.jobTitle,
      company: data.company,
      jobId: data.jobId,
      versionName: data.versionName,
    })

    return NextResponse.json({ success: true, resume: updatedResume })
  } catch (error) {
    console.error("Error updating resume:", error)
    return NextResponse.json({ success: false, error: "Failed to update resume" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const resume = await getResumeById(params.id)

    if (!resume) {
      return NextResponse.json({ success: false, error: "Resume not found" }, { status: 404 })
    }

    // Check if the resume belongs to the user
    if (resume.userId !== userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    // Delete the resume from the database
    await deleteResume(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting resume:", error)
    return NextResponse.json({ success: false, error: "Failed to delete resume" }, { status: 500 })
  }
}
