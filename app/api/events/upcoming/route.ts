import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/authClient";

export async function GET() {
  try {
    const supabase = createRouteClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user?.id;

    if (!userId) {
      console.log("Upcoming Events API: No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Upcoming Events API: Authenticated user", userId);

    // Get today's and tomorrow's date in ISO format
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // First, get all jobs for this user
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, title, company")
      .eq("user_id", userId);

    if (jobsError) {
      console.error("Error fetching user jobs:", jobsError);
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500 },
      );
    }

    if (!jobs || jobs.length === 0) {
      console.log("Upcoming Events API: No jobs found for user", userId);
      return NextResponse.json({ events: [] });
    }

    const jobIds = jobs.map((job) => job.id);

    // Now query for events for these jobs
    const { data: events, error } = await supabase
      .from("job_events")
      .select("*")
      .in("job_id", jobIds)
      .gte("date", today.toISOString())
      .lt("date", dayAfterTomorrow.toISOString())
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching upcoming events:", error);
      return NextResponse.json(
        { error: "Failed to fetch events" },
        { status: 500 },
      );
    }

    // Format the events to include job title and company
    const formattedEvents = events.map((event) => {
      const job = jobs.find((j) => j.id === event.job_id);
      return {
        id: event.id,
        jobId: event.job_id,
        eventType: event.event_type,
        title: event.title,
        description: event.description,
        date: event.date,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        jobTitle: job?.title || "Unknown Job",
        company: job?.company || "Unknown Company",
      };
    });

    console.log(
      `Upcoming Events API: Found ${formattedEvents.length} events for user ${userId}`,
    );
    return NextResponse.json({ events: formattedEvents });
  } catch (error) {
    console.error("Error in upcoming events API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
