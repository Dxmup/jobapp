import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getCurrentUserIdOptional } from "@/lib/auth-cookie"
import { isUserAdmin } from "@/lib/auth-service"

export async function POST() {
  try {
    const userId = await getCurrentUserIdOptional()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = await isUserAdmin(userId)
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const supabase = createServerSupabaseClient()

    // Find accounts that are past their deletion date
    const { data: accountsToDelete, error: fetchError } = await supabase
      .from("users")
      .select("id, email, name, deletion_date")
      .eq("marked_for_deletion", true)
      .lt("deletion_date", new Date().toISOString())

    if (fetchError) {
      console.error("Error fetching accounts to delete:", fetchError)
      return NextResponse.json({ error: "Failed to fetch accounts for deletion" }, { status: 500 })
    }

    if (!accountsToDelete || accountsToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No accounts ready for deletion",
        deleted_count: 0,
      })
    }

    let deletedCount = 0
    const errors: string[] = []

    for (const account of accountsToDelete) {
      try {
        // Delete all user data in the correct order to handle foreign key constraints

        // 1. Delete job events
        await supabase.from("job_events").delete().eq("user_id", account.id)

        // 2. Delete job-resume associations
        await supabase.from("job_resumes").delete().eq("user_id", account.id)

        // 3. Delete cover letters
        await supabase.from("cover_letters").delete().eq("user_id", account.id)

        // 4. Delete resumes and associated files
        const { data: resumes } = await supabase.from("resumes").select("file_url").eq("user_id", account.id)

        if (resumes) {
          // Delete files from storage
          for (const resume of resumes) {
            if (resume.file_url) {
              try {
                const url = new URL(resume.file_url)
                const pathParts = url.pathname.split("/")
                const filePath = pathParts.slice(pathParts.indexOf("user-files") + 1).join("/")
                await supabase.storage.from("user-files").remove([filePath])
              } catch (fileError) {
                console.error("Error deleting file:", fileError)
              }
            }
          }
        }

        await supabase.from("resumes").delete().eq("user_id", account.id)

        // 5. Delete jobs
        await supabase.from("jobs").delete().eq("user_id", account.id)

        // 6. Delete user profile
        await supabase.from("user_profiles").delete().eq("user_id", account.id)

        // 7. Delete user roles
        await supabase.from("user_roles").delete().eq("user_id", account.id)

        // 8. Anonymize audit logs (keep for compliance but remove identifiable info)
        const anonymizedUserId = `deleted_${account.id.slice(-8)}`
        await supabase.from("audit_logs").update({ user_id: anonymizedUserId }).eq("user_id", account.id)

        // 9. Finally delete the user account
        await supabase.from("users").delete().eq("id", account.id)

        // Log the permanent deletion
        await supabase.from("audit_logs").insert({
          user_id: anonymizedUserId,
          action: "account_permanently_deleted",
          resource: "user_account",
          resource_id: anonymizedUserId,
          details: {
            original_email: account.email,
            original_name: account.name,
            deletion_date: account.deletion_date,
            permanent_deletion_date: new Date().toISOString(),
          },
          ip_address: "system",
          user_agent: "cleanup_job",
          created_at: new Date().toISOString(),
        })

        deletedCount++
        console.log(`Successfully deleted account: ${account.email}`)
      } catch (error) {
        console.error(`Error deleting account ${account.email}:`, error)
        errors.push(`Failed to delete ${account.email}: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Account cleanup completed. ${deletedCount} accounts permanently deleted.`,
      deleted_count: deletedCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("Exception in cleanup-deleted-accounts:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
