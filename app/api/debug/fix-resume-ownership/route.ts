/**
 * Fix Resume Ownership API Route
 *
 * This API route allows transferring ownership of a resume from one user to another.
 * It's intended for fixing data issues where resumes are associated with the wrong user.
 *
 * @route POST /api/debug/fix-resume-ownership
 */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { fixResumeOwnership } from "../index"

/**
 * POST handler for the fix-resume-ownership API route.
 *
 * Transfers ownership of a resume to the current user.
 *
 * @param request - The incoming request object containing the resume ID
 * @returns NextResponse with the result of the ownership transfer
 */
export async function POST(request: Request) {
  try {
    // Get the current user ID from cookies
    const cookieStore = cookies()
    const currentUserId = cookieStore.get("user_id")?.value

    if (!currentUserId) {
      return NextResponse.json({ error: "User ID not found in cookies" }, { status: 401 })
    }

    // Get the resume ID to transfer
    const body = await request.json()
    const { resumeId } = body

    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID is required" }, { status: 400 })
    }

    // Update the resume's user_id to the current user
    const { data, error } = await fixResumeOwnership(resumeId, currentUserId)

    if (error) {
      console.error("Error updating resume ownership:", error)
      return NextResponse.json({ error: "Failed to update resume ownership" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Resume ownership updated successfully",
      data,
    })
  } catch (error) {
    console.error("Error in fix-resume-ownership API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
