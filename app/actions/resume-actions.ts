import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addResume(formData: FormData) {
  "use server"

  const supabase = createServerSupabaseClient()

  const resume = {
    title: formData.get("title") as string,
  }

  const { data, error } = await supabase.from("resumes").insert(resume).select()

  if (error) {
    console.log(error)
    return { message: "Error creating resume" }
  }

  revalidatePath("/resumes")
  return { message: "Resume created successfully" }
}

export async function updateResume(id: string, formData: FormData) {
  "use server"

  const supabase = createServerSupabaseClient()

  const resume = {
    title: formData.get("title") as string,
  }

  const { data, error } = await supabase.from("resumes").update(resume).eq("id", id).select()

  if (error) {
    console.log(error)
    return { message: "Error updating resume" }
  }

  revalidatePath("/resumes")
  return { message: "Resume updated successfully" }
}

export async function deleteResume(id: string) {
  "use server"

  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("resumes").delete().eq("id", id)

  if (error) {
    console.log(error)
    return { message: "Error deleting resume" }
  }

  revalidatePath("/resumes")
  return { message: "Resume deleted successfully" }
}
