import { createServerClient } from "@/lib/supabase/authClient";

/**
 * Ensures that the authenticated user exists in the database
 * If the user doesn't exist in the users table, it creates a new record
 *
 * User identity is derived solely from the Supabase session.
 *
 * @returns An object with success status, userId if successful, and error message if failed
 */
export async function ensureUserExists() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;
  const userEmail = user?.email;

  console.log("Auth check - Session user:", userId);

  if (!userId) {
    console.error("No user ID found in session");
    return { success: false, error: "No authenticated user found" };
  }

  try {
    // Check if the user exists in the users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (userError) {
      console.log("User not found in users table, creating record");

      // If we don't have an email but have a userId, try to fetch the user's email
      let emailToUse = userEmail;
      if (!emailToUse && userId) {
        const { data: userRecord } = await supabase
          .from("users")
          .select("email")
          .eq("auth_id", userId)
          .single();
        emailToUse = userRecord?.email || `user-${userId}@example.com`;
      }

      // Create a user record if it doesn't exist
      const { error: insertError } = await supabase.from("users").insert({
        id: userId,
        email: emailToUse,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Error creating user record:", insertError);
        return { success: false, error: "Failed to create user record" };
      }
    }

    return { success: true, userId };
  } catch (error) {
    console.error("Error ensuring user exists:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error ensuring user exists",
    };
  }
}
