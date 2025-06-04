import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function uploadResumeFile(file: File, userId: string): Promise<string> {
  try {
    const supabase = createServerSupabaseClient()

    // Create a unique file name
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage.from("user-files").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Error uploading file:", error)
      throw new Error(`Failed to upload file: ${error.message}`)
    }

    // Get public URL for the file
    const {
      data: { publicUrl },
    } = supabase.storage.from("user-files").getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error("Error in uploadResumeFile:", error)
    throw error
  }
}

export async function deleteResumeFile(fileUrl: string): Promise<void> {
  try {
    const supabase = createServerSupabaseClient()

    // Extract the path from the URL
    const url = new URL(fileUrl)
    const pathParts = url.pathname.split("/")
    const filePath = pathParts.slice(pathParts.indexOf("user-files") + 1).join("/")

    const { error } = await supabase.storage.from("user-files").remove([filePath])

    if (error) {
      console.error("Error deleting file:", error)
      throw new Error(`Failed to delete file: ${error.message}`)
    }
  } catch (error) {
    console.error("Error in deleteResumeFile:", error)
    throw error
  }
}
