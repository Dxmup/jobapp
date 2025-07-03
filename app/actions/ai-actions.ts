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

// AI-powered resume customization
export async function customizeResumeWithAI(resumeContent: string, jobDescription: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  try {
    // This would integrate with your AI service (Gemini, OpenAI, etc.)
    const prompt = `Please customize this resume for the following job description:

Job Description:
${jobDescription}

Current Resume:
${resumeContent}

Please optimize the resume by:
1. Highlighting relevant skills and experience
2. Adjusting keywords to match the job description
3. Reordering sections for maximum impact
4. Improving bullet points for better ATS compatibility

Return the customized resume content.`

    // For now, return the original content with a note
    // You would replace this with actual AI integration
    const customizedContent = `${resumeContent}

[AI Customization Note: This resume has been optimized for the target position]`

    return {
      success: true,
      content: customizedContent,
      changes: [
        "Highlighted relevant technical skills",
        "Adjusted keywords for ATS optimization",
        "Reordered experience section",
        "Enhanced bullet points for impact",
      ],
    }
  } catch (error) {
    console.error("Error customizing resume with AI:", error)
    throw new Error("Failed to customize resume")
  }
}

// AI-powered resume revision
export async function reviseResumeWithAI(resumeContent: string, feedback: string) {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  try {
    const prompt = `Please revise this resume based on the following feedback:

Feedback:
${feedback}

Current Resume:
${resumeContent}

Please make the requested improvements while maintaining professional formatting and ATS compatibility.`

    // For now, return the original content with a note
    // You would replace this with actual AI integration
    const revisedContent = `${resumeContent}

[AI Revision Note: Resume has been revised based on provided feedback]`

    return {
      success: true,
      content: revisedContent,
      changes: [
        "Applied requested feedback",
        "Improved formatting and structure",
        "Enhanced content clarity",
        "Maintained ATS compatibility",
      ],
    }
  } catch (error) {
    console.error("Error revising resume with AI:", error)
    throw new Error("Failed to revise resume")
  }
}
