"use server";

import { createServerClient } from "@/lib/supabase/authClient";
import { revalidatePath } from "next/cache";

// Helper function to get the current user ID
async function getCurrentUserId(): Promise<string> {
  const supabase = createServerClient();

  // Try to get user from session first
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user?.id) {
    return session.user.id;
  }

  throw new Error("User not authenticated");
}

// Get all resumes for the current user
export async function getUserResumes() {
  try {
    const supabase = createServerClient();
    const userId = await getCurrentUserId();

    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching resumes:", error);
      return { success: false, error: "Failed to fetch resumes" };
    }

    return { success: true, resumes: data || [] };
  } catch (error) {
    console.error("Error in getUserResumes:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getJobResumes(jobId: string) {
  try {
    const supabase = createServerClient();
    const userId = await getCurrentUserId();

    // Verify the job belongs to the user
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", userId)
      .single();

    if (jobError) {
      console.error("Error verifying job:", jobError);
      return { success: false, error: "Failed to verify job access" };
    }

    // IMPORTANT: We need to check both direct resumes and job_resumes table
    // First, get resumes directly associated with the job
    const { data: directResumes, error: directResumesError } = await supabase
      .from("resumes")
      .select("*")
      .eq("job_id", jobId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (directResumesError) {
      console.error("Error fetching direct job resumes:", directResumesError);
      return { success: false, error: "Failed to fetch direct resumes" };
    }

    // Next, get resume IDs from the job_resumes association table
    // Don't filter by user_id in job_resumes table since the column might not exist yet
    const { data: jobResumes, error: jobResumesError } = await supabase
      .from("job_resumes")
      .select("resume_id")
      .eq("job_id", jobId);

    if (jobResumesError) {
      console.error(
        "Error fetching job_resumes associations:",
        jobResumesError,
      );
      return { success: false, error: "Failed to fetch resume associations" };
    }

    // If there are no associated resumes in the job_resumes table, return just the direct resumes
    if (!jobResumes || jobResumes.length === 0) {
      return { success: true, resumes: directResumes || [] };
    }

    // Get the resume IDs from the job_resumes table
    const resumeIds = jobResumes.map((jr) => jr.resume_id);

    // Fetch the associated resumes - make sure to filter by user_id here
    // This ensures we only get resumes that belong to the current user
    const { data: associatedResumes, error: associatedResumesError } =
      await supabase
        .from("resumes")
        .select("*")
        .in("id", resumeIds)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (associatedResumesError) {
      console.error(
        "Error fetching associated resumes:",
        associatedResumesError,
      );
      return { success: false, error: "Failed to fetch associated resumes" };
    }

    // Combine both sets of resumes and remove duplicates
    const allResumes = [...(directResumes || []), ...(associatedResumes || [])];
    const uniqueResumes = allResumes.filter(
      (resume, index, self) =>
        index === self.findIndex((r) => r.id === resume.id),
    );

    return { success: true, resumes: uniqueResumes };
  } catch (error) {
    console.error("Error in getJobResumes:", error);
    return {
      success: false,
      error: `Failed to fetch resumes: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function removeResumeFromJob(resumeId: string, jobId: string) {
  try {
    const supabase = createServerClient();
    const userId = await getCurrentUserId();

    // Verify the job belongs to the user
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", userId)
      .single();

    if (jobError) {
      console.error("Error verifying job:", jobError);
      return { success: false, error: "Failed to verify job access" };
    }

    // Verify the resume belongs to the user
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", userId)
      .single();

    if (resumeError) {
      console.error("Error verifying resume:", resumeError);
      return { success: false, error: "Failed to verify resume access" };
    }

    // Check if this is a direct association (job_id in resumes table)
    if (resume.job_id === jobId) {
      // Update the resume to remove the job_id
      const { error: updateError } = await supabase
        .from("resumes")
        .update({ job_id: null })
        .eq("id", resumeId)
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating resume:", updateError);
        return { success: false, error: "Failed to remove job association" };
      }
    } else {
      // Otherwise, delete from the job_resumes table - don't filter by user_id
      const { error: deleteError } = await supabase
        .from("job_resumes")
        .delete()
        .eq("job_id", jobId)
        .eq("resume_id", resumeId);

      if (deleteError) {
        console.error("Error deleting job_resume association:", deleteError);
        return { success: false, error: "Failed to remove resume from job" };
      }
    }

    // Revalidate the job page
    revalidatePath(`/jobs/${jobId}`);

    return { success: true };
  } catch (error) {
    console.error("Error in removeResumeFromJob:", error);
    return {
      success: false,
      error: `Failed to remove resume: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function associateResumeWithJob(resumeId: string, jobId: string) {
  try {
    const supabase = createServerClient();
    const userId = await getCurrentUserId();

    // Verify the job belongs to the user
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", userId)
      .single();

    if (jobError) {
      console.error("Error verifying job:", jobError);
      return { success: false, error: "Failed to verify job access" };
    }

    // Verify the resume belongs to the user
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", userId)
      .single();

    if (resumeError) {
      console.error("Error verifying resume:", resumeError);
      return { success: false, error: "Failed to verify resume access" };
    }

    // Check if the association already exists in job_resumes - don't filter by user_id
    const { data: existingAssoc, error: checkError } = await supabase
      .from("job_resumes")
      .select("*")
      .eq("job_id", jobId)
      .eq("resume_id", resumeId)
      .single();

    if (!checkError && existingAssoc) {
      // Association already exists
      return {
        success: true,
        message: "Resume already associated with this job",
      };
    }

    // Create the association - don't include user_id yet
    const { error: insertError } = await supabase.from("job_resumes").insert({
      job_id: jobId,
      resume_id: resumeId,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Error creating association:", insertError);
      return { success: false, error: "Failed to associate resume with job" };
    }

    // Revalidate the job page
    revalidatePath(`/jobs/${jobId}`);

    return { success: true };
  } catch (error) {
    console.error("Error in associateResumeWithJob:", error);
    return {
      success: false,
      error: `Failed to associate resume: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
