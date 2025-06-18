import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/authClient";

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } },
) {
  try {
    const jobId = params.jobId;
    console.log(`Timeline API: Processing request for job ${jobId}`);

    const supabase = createRouteClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.log("Timeline API: No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If we have a session, proceed with normal flow
    const authUserId = session.user.id;
    console.log(`Timeline API: Auth user ID: ${authUserId}`);

    // Get the database user ID from the auth ID
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", authUserId)
      .single();

    if (userError) {
      console.log(`Timeline API: User error: ${userError.message}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userData.id;
    console.log(`Timeline API: Database user ID: ${userId}`);

    // Check if the job exists and belongs to the user
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, user_id")
      .eq("id", jobId)
      .single();

    if (jobError) {
      console.log(`Timeline API: Job error: ${jobError.message}`);
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Verify ownership
    if (job.user_id !== userId) {
      console.log(
        `Timeline API: Job user ID (${job.user_id}) doesn't match user ID (${userId})`,
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Try to fetch events
    try {
      const { data: events, error: eventsError } = await supabase
        .from("job_events")
        .select("*")
        .eq("job_id", jobId)
        .order("date", { ascending: false });

      if (eventsError) {
        // If table doesn't exist, return empty array
        if (
          eventsError.message.includes("relation") &&
          eventsError.message.includes("does not exist")
        ) {
          console.log("Timeline API: job_events table doesn't exist");
          return NextResponse.json({ events: [] });
        }

        console.log(`Timeline API: Events error: ${eventsError.message}`);
        return NextResponse.json(
          { error: "Error fetching events" },
          { status: 500 },
        );
      }

      return NextResponse.json({ events: events || [] });
    } catch (error) {
      console.error("Timeline API events fetch error:", error);
      return NextResponse.json(
        { error: "Error fetching events" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Timeline API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
