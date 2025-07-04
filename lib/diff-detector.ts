export interface TextChange {
  original: string
  improved: string
  type: "impact" | "action" | "clarity" | "keyword"
  explanation: string
}

export function detectChanges(original: string, improved: string): TextChange[] {
  // Simple diff detection for demo purposes
  const changes: TextChange[] = []

  // Split into sentences for comparison
  const originalSentences = original.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const improvedSentences = improved.split(/[.!?]+/).filter((s) => s.trim().length > 0)

  // Find differences (simplified approach)
  for (let i = 0; i < Math.min(originalSentences.length, improvedSentences.length); i++) {
    const origSentence = originalSentences[i].trim()
    const impSentence = improvedSentences[i].trim()

    if (origSentence !== impSentence) {
      // Determine change type based on content
      let type: TextChange["type"] = "clarity"
      let explanation = "Improved clarity and readability"

      if (impSentence.match(/\d+%|\d+\+|increased|improved|reduced/i)) {
        type = "impact"
        explanation = "Added quantifiable impact and results"
      } else if (impSentence.match(/led|managed|developed|created|implemented/i)) {
        type = "action"
        explanation = "Used stronger action verbs"
      } else if (impSentence.length > origSentence.length * 1.2) {
        type = "keyword"
        explanation = "Added relevant keywords and details"
      }

      changes.push({
        original: origSentence,
        improved: impSentence,
        type,
        explanation,
      })
    }
  }

  return changes.slice(0, 3) // Limit to 3 changes for demo
}
