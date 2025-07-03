import { getCurrentUserId } from "@/lib/auth-cookie"

// Remove the old getCurrentUserId function - now using centralized auth

export async function generateTitle(prompt: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const response = await fetch(`${process.env.AI_API_URL}/generate-title`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate title")
  }

  const data = await response.json()
  return data.title
}

export async function generateSummary(title: string, content: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const response = await fetch(`${process.env.AI_API_URL}/generate-summary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, content }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate summary")
  }

  const data = await response.json()
  return data.summary
}

// Add missing customizeResumeWithAI function
export async function customizeResumeWithAI(resumeContent: string, jobDescription: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/ai/customize-resume`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resumeContent,
        jobDescription,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to customize resume")
    }

    const data = await response.json()
    return {
      success: true,
      customizedResume: data.customizedResume,
      changes: data.changes || [],
    }
  } catch (error) {
    console.error("Error customizing resume:", error)
    return {
      success: false,
      error: "Failed to customize resume with AI",
    }
  }
}

// Add missing reviseResumeWithAI function
export async function reviseResumeWithAI(resumeContent: string, feedback: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/ai/revise-resume`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resumeContent,
        feedback,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to revise resume")
    }

    const data = await response.json()
    return {
      success: true,
      revisedResume: data.revisedResume,
      changes: data.changes || [],
    }
  } catch (error) {
    console.error("Error revising resume:", error)
    return {
      success: false,
      error: "Failed to revise resume with AI",
    }
  }
}
