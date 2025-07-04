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
    throw new Error("Unauthorized")
  }

  try {
    // This would integrate with AI service to customize resume
    const customizedContent = `${resumeContent}

[AI-customized sections based on job description would be added here]

Skills tailored for this position:
- Relevant skill 1
- Relevant skill 2
- Relevant skill 3

Experience highlights:
- Achievement 1 relevant to job
- Achievement 2 relevant to job
- Achievement 3 relevant to job`

    return {
      success: true,
      customizedResume: customizedContent,
      changes: ["Added relevant skills section", "Highlighted relevant experience", "Optimized keywords for ATS"],
    }
  } catch (error) {
    console.error("Error customizing resume with AI:", error)
    return {
      success: false,
      error: "Failed to customize resume",
    }
  }
}

export async function reviseResumeWithAI(resumeContent: string, feedback: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  try {
    // This would integrate with AI service to revise resume based on feedback
    const revisedContent = `${resumeContent}

[AI-revised sections based on feedback would be applied here]

Improvements made:
- Enhanced professional summary
- Strengthened action verbs
- Improved formatting and structure
- Added quantifiable achievements`

    return {
      success: true,
      revisedResume: revisedContent,
      changes: [
        "Enhanced professional summary",
        "Strengthened action verbs",
        "Improved formatting",
        "Added quantifiable achievements",
      ],
    }
  } catch (error) {
    console.error("Error revising resume with AI:", error)
    return {
      success: false,
      error: "Failed to revise resume",
    }
  }
}
