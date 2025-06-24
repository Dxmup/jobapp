import { createServerClient } from "@/lib/supabase/server"

export async function getUserProfile() {
  const supabase = createServerClient()

  try {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("user_first_name, last_name, full_name")
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      return { firstName: "the candidate", lastName: "" }
    }

    const firstName = profileData.user_first_name || profileData.full_name?.split(" ")[0] || "the candidate"
    const lastName = profileData.last_name || ""

    return { firstName, lastName }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { firstName: "the candidate", lastName: "" }
  }
}
