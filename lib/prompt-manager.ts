interface Prompt {
  id?: string
  name: string
  category: string
  description?: string
  content: string
  variables: string[]
  is_active: boolean
  created_at?: string
  updated_at?: string
  fallback?: boolean
}

class PromptManager {
  private cache = new Map<string, { prompt: Prompt; timestamp: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.CACHE_TTL
  }

  private extractVariables(content: string): string[] {
    const variableRegex = /\{([^}]+)\}/g
    const variables = new Set<string>()
    let match

    while ((match = variableRegex.exec(content)) !== null) {
      variables.add(match[1])
    }

    return Array.from(variables)
  }

  private processVariables(content: string, variables: Record<string, string>): string {
    let processedContent = content

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{${key}\\}`, "g")
      processedContent = processedContent.replace(regex, value || `{${key}}`)
    }

    return processedContent
  }

  async getPrompt(name: string): Promise<Prompt | null> {
    try {
      // Check cache first
      const cached = this.cache.get(name)
      if (cached && !this.isExpired(cached.timestamp)) {
        return cached.prompt
      }

      // Try to fetch from API
      const response = await fetch(`/api/prompts?name=${encodeURIComponent(name)}`)

      if (response.ok) {
        const data = await response.json()
        if (data.prompt) {
          // Cache the result
          this.cache.set(name, {
            prompt: data.prompt,
            timestamp: Date.now(),
          })
          return data.prompt
        }
      }

      console.warn(`Prompt '${name}' not found`)
      return null
    } catch (error) {
      console.error(`Error fetching prompt '${name}':`, error)
      return null
    }
  }

  async getPromptsByCategory(category: string): Promise<Prompt[]> {
    try {
      const response = await fetch(`/api/prompts?category=${encodeURIComponent(category)}`)

      if (response.ok) {
        const data = await response.json()
        return data.prompts || []
      }

      console.warn(`No prompts found for category '${category}'`)
      return []
    } catch (error) {
      console.error(`Error fetching prompts for category '${category}':`, error)
      return []
    }
  }

  async processPrompt(name: string, variables: Record<string, string>): Promise<string | null> {
    const prompt = await this.getPrompt(name)

    if (!prompt) {
      return null
    }

    return this.processVariables(prompt.content, variables)
  }

  clearCache(): void {
    this.cache.clear()
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// Export singleton instance
export const promptManager = new PromptManager()

// Export the class for testing
export { PromptManager }
export type { Prompt }
