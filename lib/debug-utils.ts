import { createServerSupabaseClient } from "./supabase/server"
import { cookies } from "next/headers"

export async function debugJobAccess(jobId: string) {
  const debugInfo: Record<string, any> = {
    timestamp: new Date().toISOString(),
    jobId,
  }

  try {
    // Get authentication info
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    debugInfo.authInfo = {
      hasSession: !!session,
      sessionId: session?.id || "none",
      userId: session?.user?.id || "none",
      userEmail: session?.user?.email || "none",
    }

    // Get cookie info
    const cookieStore = cookies()
    const cookieUserId = cookieStore.get("user_id")?.value
    const supabaseAuthCookie = cookieStore.get("sb-auth-token")?.value

    debugInfo.cookieInfo = {
      hasUserIdCookie: !!cookieUserId,
      cookieUserId: cookieUserId || "none",
      hasSupabaseAuthCookie: !!supabaseAuthCookie,
    }

    // Try to get the job directly without user filtering
    const { data: directJob, error: directJobError } = await supabase
      .from("jobs")
      .select("id, user_id, userId, title, company")
      .eq("id", jobId)
      .single()

    debugInfo.directJobQuery = {
      success: !directJobError,
      error: directJobError ? directJobError.message : null,
      job: directJob || null,
    }

    // If we found a job, check user ownership
    if (directJob) {
      const jobUserId = directJob.user_id || directJob.userId
      const currentUserId = session?.user?.id || cookieUserId

      debugInfo.ownershipCheck = {
        jobUserId,
        currentUserId,
        isOwner: jobUserId === currentUserId,
        userIdField: directJob.user_id ? "user_id" : directJob.userId ? "userId" : "neither",
      }

      // Try to get all jobs for the current user
      if (currentUserId) {
        // Try with user_id field
        const { data: userJobs, error: userJobsError } = await supabase
          .from("jobs")
          .select("id, title")
          .eq("user_id", currentUserId)
          .limit(5)

        // Try with userId field
        const { data: altUserJobs, error: altUserJobsError } = await supabase
          .from("jobs")
          .select("id, title")
          .eq("userId", currentUserId)
          .limit(5)

        debugInfo.userJobs = {
          withUserIdField: {
            success: !userJobsError,
            count: userJobs?.length || 0,
            jobs: userJobs || [],
            error: userJobsError ? userJobsError.message : null,
          },
          withUserIdField2: {
            success: !altUserJobsError,
            count: altUserJobs?.length || 0,
            jobs: altUserJobs || [],
            error: altUserJobsError ? altUserJobsError.message : null,
          },
        }
      }
    }

    // Check database schema
    const { data: jobColumns, error: jobColumnsError } = await supabase.rpc("get_table_columns", {
      table_name: "jobs",
    })

    if (!jobColumnsError && jobColumns) {
      debugInfo.tableSchema = {
        success: true,
        columns: jobColumns,
      }
    } else {
      // Fallback method to check columns
      try {
        const { data: sampleJob, error: sampleJobError } = await supabase.from("jobs").select("*").limit(1).single()

        if (!sampleJobError && sampleJob) {
          debugInfo.tableSchema = {
            success: true,
            inferredColumns: Object.keys(sampleJob),
          }
        } else {
          debugInfo.tableSchema = {
            success: false,
            error: sampleJobError ? sampleJobError.message : "No jobs found",
          }
        }
      } catch (error) {
        debugInfo.tableSchema = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        }
      }
    }

    return {
      success: true,
      debugInfo,
    }
  } catch (error) {
    return {
      success: false,
      debugInfo: {
        ...debugInfo,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "No stack trace available",
      },
    }
  }
}
