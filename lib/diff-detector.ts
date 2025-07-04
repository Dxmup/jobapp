export interface ResumeChange {
  type: "addition" | "modification" | "removal"
  section: string
  original?: string
  modified?: string
  description: string
}

export function detectActualChanges(originalResume: string, optimizedResume: string): ResumeChange[] {
  const changes: ResumeChange[] = []

  // Simple diff detection - in a real implementation, you'd use a more sophisticated diff algorithm
  const originalLines = originalResume.split("\n").filter((line) => line.trim())
  const optimizedLines = optimizedResume.split("\n").filter((line) => line.trim())

  // Find additions
  optimizedLines.forEach((line, index) => {
    if (!originalLines.includes(line)) {
      changes.push({
        type: "addition",
        section: "Content",
        modified: line,
        description: `Added: ${line.substring(0, 50)}...`,
      })
    }
  })

  // Find removals
  originalLines.forEach((line, index) => {
    if (!optimizedLines.includes(line)) {
      changes.push({
        type: "removal",
        section: "Content",
        original: line,
        description: `Removed: ${line.substring(0, 50)}...`,
      })
    }
  })

  return changes
}

export function mergeChanges(changes: ResumeChange[]): string {
  return changes.map((change) => change.description).join("\n")
}
