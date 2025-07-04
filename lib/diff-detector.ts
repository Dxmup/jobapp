export interface TextChange {
  original: string
  improved: string
  type: string
  explanation: string
}

export function detectActualChanges(originalText: string, optimizedText: string): TextChange[] {
  // Simple diff detection for demo purposes
  const changes: TextChange[] = []

  // Basic word-level comparison
  const originalWords = originalText.split(/\s+/)
  const optimizedWords = optimizedText.split(/\s+/)

  // Find simple replacements
  for (let i = 0; i < Math.min(originalWords.length, optimizedWords.length); i++) {
    if (originalWords[i] !== optimizedWords[i]) {
      changes.push({
        original: originalWords[i],
        improved: optimizedWords[i],
        type: "improvement",
        explanation: "Enhanced word choice for better impact",
      })

      if (changes.length >= 2) break // Limit to 2 changes for demo
    }
  }

  // If no changes found, provide generic examples
  if (changes.length === 0) {
    changes.push(
      {
        original: "responsible for",
        improved: "managed and delivered",
        type: "action",
        explanation: "Replaced passive language with strong action verbs",
      },
      {
        original: "worked on projects",
        improved: "led cross-functional initiatives resulting in 25% efficiency gains",
        type: "impact",
        explanation: "Added quantifiable results and leadership emphasis",
      },
    )
  }

  return changes
}

export function mergeChanges(changes: TextChange[]): string {
  return changes.map((change) => `${change.original} → ${change.improved}`).join("; ")
}
