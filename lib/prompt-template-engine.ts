export interface PromptVariable {
  name: string
  type: "string" | "text" | "number" | "boolean" | "select"
  required: boolean
  description?: string
  default?: any
  options?: string[] // For select type
  min?: number // For number type
  max?: number // For number type
  validation?: string // Regex pattern for string validation
}

export interface PromptTemplate {
  id: string
  name: string
  description?: string
  type: string
  content: string
  variables: PromptVariable[]
  metadata: Record<string, any>
  is_active: boolean
  version: number
  usage_count: number
  created_at: string
  updated_at: string
}

export class PromptTemplateEngine {
  /**
   * Process a prompt template with provided variables
   */
  static processTemplate(
    template: string,
    variables: Record<string, any>,
    variableDefinitions: PromptVariable[],
  ): string {
    // Validate variables first
    this.validateVariables(variables, variableDefinitions)

    let processed = template

    // Replace simple variables {{variable_name}}
    processed = processed.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      if (variables.hasOwnProperty(varName)) {
        return String(variables[varName])
      }
      // Check if variable has a default value
      const varDef = variableDefinitions.find((v) => v.name === varName)
      if (varDef?.default !== undefined) {
        return String(varDef.default)
      }
      return match // Keep original if no value found
    })

    // Process conditional blocks {{#if variable}}...{{/if}}
    processed = processed.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, varName, content) => {
      const value = variables[varName]
      if (value && value !== "" && value !== false && value !== 0) {
        // Process the content inside the if block for variables
        return this.processTemplate(content, variables, variableDefinitions)
      }
      return ""
    })

    return processed.trim()
  }

  /**
   * Validate variables against their definitions
   */
  static validateVariables(variables: Record<string, any>, definitions: PromptVariable[]): void {
    const errors: string[] = []

    for (const def of definitions) {
      const value = variables[def.name]

      // Check required variables
      if (def.required && (value === undefined || value === null || value === "")) {
        errors.push(`Required variable '${def.name}' is missing`)
        continue
      }

      // Skip validation if variable is not provided and not required
      if (value === undefined || value === null) continue

      // Type validation
      switch (def.type) {
        case "number":
          if (typeof value !== "number" || isNaN(value)) {
            errors.push(`Variable '${def.name}' must be a number`)
          } else {
            if (def.min !== undefined && value < def.min) {
              errors.push(`Variable '${def.name}' must be at least ${def.min}`)
            }
            if (def.max !== undefined && value > def.max) {
              errors.push(`Variable '${def.name}' must be at most ${def.max}`)
            }
          }
          break

        case "boolean":
          if (typeof value !== "boolean") {
            errors.push(`Variable '${def.name}' must be a boolean`)
          }
          break

        case "select":
          if (def.options && !def.options.includes(value)) {
            errors.push(`Variable '${def.name}' must be one of: ${def.options.join(", ")}`)
          }
          break

        case "string":
        case "text":
          if (typeof value !== "string") {
            errors.push(`Variable '${def.name}' must be a string`)
          } else if (def.validation) {
            const regex = new RegExp(def.validation)
            if (!regex.test(value)) {
              errors.push(`Variable '${def.name}' does not match required format`)
            }
          }
          break
      }
    }

    if (errors.length > 0) {
      throw new Error(`Variable validation failed: ${errors.join(", ")}`)
    }
  }

  /**
   * Extract variable names from a template
   */
  static extractVariables(template: string): string[] {
    const variables = new Set<string>()

    // Extract simple variables {{variable_name}}
    const simpleMatches = template.match(/\{\{(\w+)\}\}/g)
    if (simpleMatches) {
      simpleMatches.forEach((match) => {
        const varName = match.replace(/\{\{|\}\}/g, "")
        variables.add(varName)
      })
    }

    // Extract variables from conditional blocks {{#if variable}}
    const conditionalMatches = template.match(/\{\{#if\s+(\w+)\}\}/g)
    if (conditionalMatches) {
      conditionalMatches.forEach((match) => {
        const varName = match.replace(/\{\{#if\s+|\}\}/g, "")
        variables.add(varName)
      })
    }

    return Array.from(variables)
  }

  /**
   * Estimate token count for a processed template
   */
  static estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4)
  }

  /**
   * Get template preview with sample data
   */
  static getPreview(template: string, variableDefinitions: PromptVariable[]): string {
    const sampleVariables: Record<string, any> = {}

    // Generate sample data for each variable
    variableDefinitions.forEach((def) => {
      switch (def.type) {
        case "string":
          sampleVariables[def.name] = def.default || `[${def.name}]`
          break
        case "text":
          sampleVariables[def.name] = def.default || `[${def.description || def.name}]`
          break
        case "number":
          sampleVariables[def.name] = def.default || def.min || 1
          break
        case "boolean":
          sampleVariables[def.name] = def.default !== undefined ? def.default : true
          break
        case "select":
          sampleVariables[def.name] = def.default || def.options?.[0] || `[${def.name}]`
          break
        default:
          sampleVariables[def.name] = def.default || `[${def.name}]`
      }
    })

    try {
      return this.processTemplate(template, sampleVariables, variableDefinitions)
    } catch (error) {
      return `Preview error: ${error instanceof Error ? error.message : "Unknown error"}`
    }
  }
}
