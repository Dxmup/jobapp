export interface TextChange {
  original: string
  improved: string
  type: "addition" | "modification" | "enhancement" | "language" | "structure"
  explanation: string
}

export function detectActualChanges(original: string, optimized: string): TextChange[] {
  const changes: TextChange[] = []

  // Simple diff detection - you can enhance this with a proper diff library
  const originalLines = original.split("\n").filter((line) => line.trim())
  const optimizedLines = optimized.split("\n").filter((line) => line.trim())

  // Look for significant additions
  if (optimizedLines.length > originalLines.length) {
    changes.push({
      original: "Basic resume structure",
      improved: "Enhanced professional formatting with clear sections",
      type: "structure",
      explanation: "Added professional structure and organization",
    })
  }

  // Look for quantified achievements
  const hasNumbers = /\d+[%$]?/.test(optimized) && !/\d+[%$]?/.test(original)
  if (hasNumbers) {
    changes.push({
      original: "Generic accomplishments",
      improved: "Quantified achievements with specific metrics",
      type: "enhancement",
      explanation: "Added measurable results to demonstrate impact",
    })
  }

  // Look for action verbs
  const actionVerbs = ["Led", "Managed", "Developed", "Implemented", "Optimized", "Architected"]
  const hasActionVerbs =
    actionVerbs.some((verb) => optimized.includes(verb)) && !actionVerbs.some((verb) => original.includes(verb))

  if (hasActionVerbs) {
    changes.push({
      original: "Passive language",
      improved: "Strong action verbs and active voice",
      type: "language",
      explanation: "Replaced weak language with powerful action verbs",
    })
  }

  return changes.slice(0, 3) // Limit to 3 changes
}
