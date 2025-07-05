import { type NextRequest, NextResponse } from "next/server"

// Sample data to use when extraction fails
const SAMPLE_DATA = {
  jobTitle: "Software Developer",
  company: "Example Tech",
  location: "Remote / New York",
  jobDescription:
    "This is a placeholder job description. We couldn't automatically extract the job details from the provided URL due to website restrictions. Please copy and paste the job details manually from the original posting.\n\nTypical responsibilities might include:\n- Developing and maintaining software applications\n- Collaborating with cross-functional teams\n- Writing clean, maintainable code\n- Troubleshooting and debugging issues",
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    console.log("Fetch job request for URL:", url)

    // For now, return sample data to avoid web scraping issues
    // This can be enhanced later with proper job board APIs
    return NextResponse.json({
      ...SAMPLE_DATA,
      url: url,
      note: "Automatic extraction is temporarily disabled. Please manually enter job details.",
    })
  } catch (error: any) {
    console.error("Error in fetch-job API route:", error)
    return NextResponse.json(
      {
        ...SAMPLE_DATA,
        error: "An error occurred while processing the request.",
      },
      { status: 200 },
    )
  }
}
