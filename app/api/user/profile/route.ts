import { type NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/authClient";

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profileData = await request.json();

    // Insert or update user profile
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert({
        user_id: userId,
        full_name: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        zip_code: profileData.zipCode,
        professional_title: profileData.professionalTitle,
        linkedin_url: profileData.linkedinUrl,
        portfolio_url: profileData.portfolioUrl,
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Error saving profile:", error);
      return NextResponse.json(
        { error: "Failed to save profile" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in profile API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching profile:", error);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: data || null });
  } catch (error) {
    console.error("Error in profile API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
