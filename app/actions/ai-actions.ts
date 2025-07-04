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

export async function customizeResumeWithAI(resumeId: string, jobDescription: string) {
  // Placeholder implementation for landing page deployment
  return {
    success: true,
    customizedResume: {
      id: resumeId,
      content: "AI-customized resume content",
      jobDescription,
    },
  }
}

export async function reviseResumeWithAI(resumeId: string, feedback: string) {
  // Placeholder implementation for landing page deployment
  return {
    success: true,
    revisedResume: {
      id: resumeId,
      content: "AI-revised resume content",
      feedback,
    },
  }
}
