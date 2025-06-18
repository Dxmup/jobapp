import type { User } from "@/types/auth";
import { getUserById } from "@/lib/auth-service";
import { createServerClient } from "@/lib/supabase/authClient";

export async function getUserIdentity(): Promise<User | null> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("No authenticated user found in session");
    return null;
  }

  try {
    const profile = await getUserById(user.id);
    if (profile) {
      console.log("User found in database:", profile.id);
      return profile;
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      console.error("Error fetching user from Supabase:", error);
      return null;
    }

    console.log("User found in Supabase:", data.id);
    return data as User;
  } catch (error) {
    console.error("Error in getUserIdentity:", error);
    return null;
  }
}

export async function getAllUserIds(): Promise<string[]> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("No authenticated user found for getAllUserIds");
    return [];
  }

  return [user.id];
}
