interface PromptVariables {
  [key: string]: string | number | boolean
}

interface Prompt {
  id?: string
  name: string
  content: string
  variables: string[]
  fallback?: boolean
}

export class PromptManager {
  private static cache = new Map<string, Prompt>()
  private static cacheExpiry = new Map<string, number>()
  private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  static async getPrompt(name: string): Promise<Prompt | null> {
    // Check cache first
    const cached = this.getCachedPrompt(name)
    if (cached) {
      return cached
    }

    try {
      const response = await fetch(`/api/prompts?name=${encodeURIComponent(name)}`)
      if (!response.ok) {
        console.error(`Failed to fetch prompt ${name}:`, response.statusText)
        return null
      }

      const data = await response.json()
      const prompt = data.prompt

      if (prompt) {
        // Cache the prompt
        this.setCachedPrompt(name, prompt)
        return prompt
      }

      return null
    } catch (error) {
      console.error(`Error fetching prompt ${name}:`, error)
      return null
    }
  }

  static async getPromptsByCategory(category: string): Promise<Prompt[]> {
    try {
      const response = await fetch(`/api/prompts?category=${encodeURIComponent(category)}`)
      if (!response.ok) {
        console.error(`Failed to fetch prompts for category ${category}:`, response.statusText)
        return []
      }

      const data = await response.json()
      return data.prompts || []
    } catch (error) {
      console.error(`Error fetching prompts for category ${category}:`, error)
      return []
    }
  }

  static processPrompt(prompt: Prompt, variables: PromptVariables): string {
    let processedContent = prompt.content

    // Replace all variables in the format {variableName}
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`
      processedContent = processedContent.replace(new RegExp(placeholder, "g"), String(value))
    }

    // Log any unresolved variables for debugging
    const unresolvedVariables = processedContent.match(/\{([^}]+)\}/g)
    if (unresolvedVariables) {
      console.warn(`Unresolved variables in prompt ${prompt.name}:`, unresolvedVariables)
    }

    return processedContent
  }

  static async getProcessedPrompt(name: string, variables: PromptVariables): Promise<string | null> {
    const prompt = await this.getPrompt(name)
    if (!prompt) {
      return null
    }

    return this.processPrompt(prompt, variables)
  }

  private static getCachedPrompt(name: string): Prompt | null {
    const cached = this.cache.get(name)
    const expiry = this.cacheExpiry.get(name)

    if (cached && expiry && Date.now() < expiry) {
      return cached
    }

    // Clean up expired cache
    if (cached) {
      this.cache.delete(name)
      this.cacheExpiry.delete(name)
    }

    return null
  }

  private static setCachedPrompt(name: string, prompt: Prompt): void {
    this.cache.set(name, prompt)
    this.cacheExpiry.set(name, Date.now() + this.CACHE_DURATION)
  }

  static clearCache(): void {
    this.cache.clear()
    this.cacheExpiry.clear()
  }

  static extractVariables(content: string): string[] {
    const matches = content.match(/\{([^}]+)\}/g)
    return matches ? [...new Set(matches.map((match) => match.slice(1, -1)))] : []
  }
}
