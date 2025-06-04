/**
 * All Resumes Debug API Route
 *
 * This API route provides information about all resumes in the system,
 * including which users own them. It's intended for debugging and
 * administrative purposes.
 *
 * @route GET /api/debug/all-resumes
 */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAllResumesForUser, getUsersWithResumes } from "../index"

/**
 * GET handler for the all-resumes debug API route.
 *
 * Retrieves information about all resumes in the system and which users own them.
 *
 * @returns NextResponse with resume and user information
 */
export async function GET() {
  try {
    // Get user ID from cookie
    const cookieStore = cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "User ID not found in cookies" }, { status: 401 })
    }

    // Get all resumes for the current user
    const { data: userResumes, error: userResumesError } = await getAllResumesForUser(userId)

    if (userResumesError) {
      console.error("Error fetching user resumes:", userResumesError)
      return NextResponse.json({ error: "Failed to fetch user resumes" }, { status: 500 })
    }

    // Get all users with resumes
    const { data: usersWithResumes, error: usersError } = await getUsersWithResumes()

    if (usersError) {
      console.error("Error fetching users with resumes:", usersError)
      return NextResponse.json({ error: "Failed to fetch users with resumes" }, { status: 500 })
    }

    return NextResponse.json({
      currentUserId: userId,
      userResumes: userResumes || [],
      userResumeCount: userResumes?.length || 0,
      usersWithResumes: usersWithResumes || [],
    })
  } catch (error) {
    console.error("Error in all-resumes API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
