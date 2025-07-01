interface Prompt {
  id: string
  name: string
  category: string
  description: string
  content: string
  variables: string[]
  version: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface PromptCache {
  [key: string]: {
    prompt: Prompt
    timestamp: number
  }
}

// Hardcoded fallback prompts
const FALLBACK_PROMPTS: Record<string, string> = {
  "interview-introduction": `ROLE: You are {interviewerName}, a professional phone interviewer from {companyName}.
{phoneScreenerInstructions}
INSTRUCTION: Deliver this introduction naturally and warmly as if starting a phone interview. Speak clearly and professionally.

INTRODUCTION: "{introText}"

DELIVERY REQUIREMENTS:
1. Speak this introduction with a warm, welcoming tone
2. Include natural pauses and inflection
3. Sound genuinely pleased to be speaking with {userFirstName}
4. DO NOT include any stage directions, parenthetical instructions, or descriptions like "(pause)", "(short pause)", "small pause", etc.
5. DO NOT narrate your actions - only speak the actual words you would say

OUTPUT: Speak the introduction directly without any stage directions or descriptions of how to speak it.`,

  "interview-question": `ROLE: You are {interviewerName}, a professional phone interviewer conducting a {interviewType} for {jobTitle} at {companyName}.
{phoneScreenerInstructions}
INSTRUCTION: Ask this interview question naturally and professionally. Speak as if you're genuinely interested in hearing {userFirstName}'s response.

QUESTION: "{questionText}"

DELIVERY REQUIREMENTS:
1. Ask this question with a professional, encouraging tone
2. Include natural pauses and speak clearly for phone audio quality
3. Sound engaged and interested in {userFirstName}'s response
4. DO NOT include any stage directions, parenthetical instructions, or descriptions like "(pause)", "(short pause)", "small pause", etc.
5. DO NOT narrate your actions - only speak the actual words you would say

OUTPUT: Ask the question directly without any stage directions or descriptions.`,

  "interview-closing": `ROLE: You are {interviewerName}, a professional phone interviewer concluding a screening interview.

INSTRUCTION: Deliver this closing statement naturally and professionally as if ending a phone interview.

CLOSING: "{closingText}"

DELIVERY REQUIREMENTS:
1. Speak with a warm, professional tone
2. Sound genuinely appreciative of {userFirstName}'s time
3. Speak clearly for phone audio quality
4. DO NOT include any stage directions, parenthetical instructions, or descriptions like "(pause)", "(short pause)", "small pause", etc.
5. DO NOT narrate your actions - only speak the actual words you would say

OUTPUT: Speak the closing statement directly without any stage directions or descriptions.`,

  "resume-optimization": `You are an expert resume optimization specialist. Your task is to enhance a resume to better match a specific job posting while maintaining authenticity and accuracy.

JOB POSTING:
{jobDescription}

CURRENT RESUME:
{resumeContent}

OPTIMIZATION REQUIREMENTS:
1. Enhance keywords and phrases that match the job requirements
2. Reorganize content to highlight relevant experience first
3. Quantify achievements where possible
4. Ensure ATS compatibility
5. Maintain truthfulness - do not add false information
6. Keep the same overall structure and format
7. Focus on skills and experience that align with {jobTitle} at {companyName}

Please provide an optimized version of the resume that better matches this job posting.`,

  "cover-letter-generation": `You are a professional cover letter writer. Create a compelling, personalized cover letter based on the provided information.

JOB POSTING:
{jobDescription}

CANDIDATE INFORMATION:
Name: {candidateName}
Resume: {resumeContent}
Company: {companyName}
Position: {jobTitle}

COVER LETTER REQUIREMENTS:
1. Professional tone and format
2. Specific examples from the candidate's experience
3. Clear connection between candidate skills and job requirements
4. Enthusiasm for the role and company
5. Call to action in closing
6. Length: 3-4 paragraphs
7. Personalized to {companyName} and {jobTitle}

Please write a compelling cover letter that showcases why {candidateName} is an excellent fit for this position.`,
}

class PromptManager {
  private cache: PromptCache = {}
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTimeout
  }

  async getPrompt(name: string): Promise<Prompt | null> {
    // Check cache first
    const cached = this.cache[name]
    if (cached && this.isCacheValid(cached.timestamp)) {
      console.log(`✅ Using cached prompt for ${name}`)
      return cached.prompt
    }

    try {
      const response = await fetch(`/api/prompts?name=${encodeURIComponent(name)}`)
      if (!response.ok) {
        console.warn(`Failed to fetch prompt ${name}, using fallback`)
        return this.getFallbackPrompt(name)
      }

      const data = await response.json()
      const prompt = data.prompt

      if (prompt) {
        // Cache the result
        this.cache[name] = {
          prompt,
          timestamp: Date.now(),
        }
        console.log(`✅ Fetched and cached prompt for ${name}`)
        return prompt
      }

      return this.getFallbackPrompt(name)
    } catch (error) {
      console.error(`Error fetching prompt ${name}:`, error)
      return this.getFallbackPrompt(name)
    }
  }

  private getFallbackPrompt(name: string): Prompt | null {
    const fallbackContent = FALLBACK_PROMPTS[name]
    if (!fallbackContent) {
      console.error(`No fallback prompt found for ${name}`)
      return null
    }

    console.log(`⚠️ Using fallback prompt for ${name}`)

    // Extract variables from fallback content
    const variables = this.extractVariables(fallbackContent)

    return {
      id: `fallback-${name}`,
      name,
      category: "fallback",
      description: `Fallback prompt for ${name}`,
      content: fallbackContent,
      variables,
      version: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  private extractVariables(content: string): string[] {
    const matches = content.match(/\{([^}]+)\}/g)
    if (!matches) return []
    return [...new Set(matches.map((match) => match.slice(1, -1)))]
  }

  async getProcessedPrompt(name: string, variables: Record<string, string> = {}): Promise<string | null> {
    const prompt = await this.getPrompt(name)
    if (!prompt) return null

    let processedContent = prompt.content

    // Replace variables in the content
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{${key}\\}`, "g")
      processedContent = processedContent.replace(regex, value || "")
    }

    // Log any unresolved variables for debugging
    const unresolvedVariables = processedContent.match(/\{([^}]+)\}/g)
    if (unresolvedVariables) {
      console.warn(`Unresolved variables in prompt ${name}:`, unresolvedVariables)
    }

    return processedContent
  }

  async getPromptsByCategory(category: string): Promise<Prompt[]> {
    try {
      const response = await fetch(`/api/prompts?category=${encodeURIComponent(category)}`)
      if (!response.ok) {
        console.warn(`Failed to fetch prompts for category ${category}`)
        return []
      }

      const data = await response.json()
      return data.prompts || []
    } catch (error) {
      console.error(`Error fetching prompts for category ${category}:`, error)
      return []
    }
  }

  clearCache(): void {
    this.cache = {}
    console.log("🧹 Prompt cache cleared")
  }

  clearCacheForPrompt(name: string): void {
    delete this.cache[name]
    console.log(`🧹 Cache cleared for prompt: ${name}`)
  }
}

// Export singleton instance
export const promptManager = new PromptManager()
