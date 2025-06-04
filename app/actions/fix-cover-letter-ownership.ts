"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/types/database"

export async function fixCoverLetterOwnership() {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Get the current user's ID
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { success: false, message: "Not authenticated" }
  }

  const currentUserId = session.user.id

  try {
    // First, find all cover letters that are visible in job details but not owned by the current user
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, cover_letters(*)")
      .eq("user_id", currentUserId)

    if (jobsError) {
      return { success: false, message: `Error fetching jobs: ${jobsError.message}` }
    }

    // Extract cover letters from jobs that don't belong to the current user
    const coverLettersToFix: string[] = []

    jobs?.forEach((job) => {
      if (job.cover_letters && job.cover_letters.length > 0) {
        job.cover_letters.forEach((letter: any) => {
          if (letter.user_id !== currentUserId) {
            coverLettersToFix.push(letter.id)
          }
        })
      }
    })

    if (coverLettersToFix.length === 0) {
      return { success: true, message: "No cover letters need fixing", fixed: 0 }
    }

    // Update the user_id for these cover letters
    const { data, error } = await supabase
      .from("cover_letters")
      .update({ user_id: currentUserId })
      .in("id", coverLettersToFix)

    if (error) {
      return { success: false, message: `Error updating cover letters: ${error.message}` }
    }

    return {
      success: true,
      message: `Fixed ownership for ${coverLettersToFix.length} cover letters`,
      fixed: coverLettersToFix.length,
    }
  } catch (error) {
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
