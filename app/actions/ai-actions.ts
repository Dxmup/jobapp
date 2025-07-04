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

export async function customizeResumeWithAI(resumeContent: string, jobDescription: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // Placeholder for AI customization logic
    const customizedResume = `${resumeContent}\n\n[AI-customized content based on job description]`

    return { success: true, customizedResume }
  } catch (error) {
    console.error("Error customizing resume with AI:", error)
    return { success: false, error: "Failed to customize resume" }
  }
}

export async function reviseResumeWithAI(resumeContent: string, feedback: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // Placeholder for AI revision logic
    const revisedResume = `${resumeContent}\n\n[AI-revised content based on feedback]`

    return { success: true, revisedResume }
  } catch (error) {
    console.error("Error revising resume with AI:", error)
    return { success: false, error: "Failed to revise resume" }
  }
}
