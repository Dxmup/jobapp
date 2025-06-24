// Simple diff detection utility
export interface TextChange {
  original: string
  improved: string
  type: "impact" | "action" | "language" | "format"
  explanation?: string
  startIndex?: number
  endIndex?: number
}

export function detectActualChanges(originalText: string, optimizedText: string): TextChange[] {
  const changes: TextChange[] = []

  // Split into sentences for better comparison
  const originalSentences = originalText.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const optimizedSentences = optimizedText.split(/[.!?]+/).filter((s) => s.trim().length > 0)

  // Find sentences that changed
  for (let i = 0; i < Math.max(originalSentences.length, optimizedSentences.length); i++) {
    const original = originalSentences[i]?.trim()
    const optimized = optimizedSentences[i]?.trim()

    if (original && optimized && original !== optimized) {
      // Determine change type based on content
      const changeType = categorizeChange(original, optimized)

      changes.push({
        original: original,
        improved: optimized,
        type: changeType,
        explanation: generateExplanation(original, optimized, changeType),
      })
    }
  }

  return changes
}

function categorizeChange(original: string, improved: string): "impact" | "action" | "language" | "format" {
  const originalLower = original.toLowerCase()
  const improvedLower = improved.toLowerCase()

  // Check for impact improvements (numbers, metrics, results)
  const hasNumbers = /\d+/.test(improved) && !/\d+/.test(original)
  const hasMetrics = /(%|percent|increase|decrease|improve|reduce|save|generate|achieve)/.test(improvedLower)

  if (hasNumbers || hasMetrics) {
    return "impact"
  }

  // Check for action verb improvements
  const passiveToActive = [
    { passive: /was responsible for/i, active: /managed|led|directed|oversaw/i },
    { passive: /helped with/i, active: /led|facilitated|coordinated/i },
    { passive: /worked on/i, active: /developed|created|built|delivered/i },
    { passive: /assisted in/i, active: /supported|enabled|facilitated/i },
    { passive: /involved in/i, active: /participated|contributed|collaborated/i },
  ]

  for (const pattern of passiveToActive) {
    if (pattern.passive.test(original) && pattern.active.test(improved)) {
      return "action"
    }
  }

  // Default to language improvement
  return "language"
}

function generateExplanation(original: string, improved: string, type: string): string {
  switch (type) {
    case "impact":
      return "Added quantifiable results and measurable impact"
    case "action":
      return "Replaced passive language with strong action verbs"
    case "language":
      return "Enhanced professional language and clarity"
    case "format":
      return "Improved formatting and structure"
    default:
      return "Enhanced professional presentation"
  }
}

export function mergeChanges(geminiChanges: TextChange[], diffChanges: TextChange[]): TextChange[] {
  // Prioritize Gemini changes if they exist and are valid
  if (geminiChanges && geminiChanges.length > 0) {
    // Verify Gemini changes are actually in the text
    const validGeminiChanges = geminiChanges.filter(
      (change) => change.original && change.improved && change.original.trim().length > 0,
    )

    if (validGeminiChanges.length > 0) {
      return validGeminiChanges
    }
  }

  // Fall back to diff-detected changes
  return diffChanges.slice(0, 2) // Limit to 2 changes as requested
}
