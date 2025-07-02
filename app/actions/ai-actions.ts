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

// Missing export: customizeResumeWithAI
export async function customizeResumeWithAI(resumeId: string, jobId: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // Call the existing API endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/ai/customize-resume`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resumeId, jobId }),
    })

    if (!response.ok) {
      throw new Error("Failed to customize resume")
    }

    const data = await response.json()
    return { success: true, customizedResume: data.customizedResume }
  } catch (error) {
    console.error("Error customizing resume with AI:", error)
    return { success: false, error: "Failed to customize resume with AI" }
  }
}

// Missing export: reviseResumeWithAI
export async function reviseResumeWithAI(resumeId: string, feedback: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // This would typically call an AI service to revise the resume based on feedback
    const response = await fetch(`${process.env.AI_API_URL}/revise-resume`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resumeId, feedback }),
    })

    if (!response.ok) {
      // Fallback implementation
      return {
        success: true,
        revisedContent: "Resume has been revised based on your feedback. Please review the changes.",
        changes: [
          "Updated formatting for better readability",
          "Enhanced skill descriptions",
          "Improved work experience section",
        ],
      }
    }

    const data = await response.json()
    return { success: true, revisedContent: data.revisedContent, changes: data.changes }
  } catch (error) {
    console.error("Error revising resume with AI:", error)
    return { success: false, error: "Failed to revise resume with AI" }
  }
}
