class ConversationalInterviewClient {
  private job: any
  private resume: any | null
  private preloadedQuestions: any | null
  private shouldPreload: boolean
  private maxDuration: number
  private warningTime: number
  private interviewType: "phone-screener" | "first-interview"

  constructor(
    job: any,
    resume: any | null,
    preloadedQuestions: any | null = null,
    shouldPreload = false,
    interviewType: "phone-screener" | "first-interview" = "first-interview",
  ) {
    this.job = job
    this.resume = resume
    this.preloadedQuestions = preloadedQuestions
    this.shouldPreload = shouldPreload

    // Set duration based on interview type
    this.maxDuration = interviewType === "phone-screener" ? 15 * 60 * 1000 : 30 * 60 * 1000 // 15 or 30 minutes
    this.warningTime = interviewType === "phone-screener" ? 12 * 60 * 1000 : 27 * 60 * 1000 // 12 or 27 minutes

    // Store interview type for prompt generation
    this.interviewType = interviewType
  }

  private generateSystemPrompt(): string {
    const phoneScreenerInstructions =
      this.interviewType === "phone-screener"
        ? `

IMPORTANT: The questions provided are designed for in-depth interviews, but this is a brief phone screening. You must adapt each question to be:

- More concise: Reduce complex multi-part questions to single, focused questions
- Screen-appropriate: Focus on basic qualifications, interest level, and major red flags  
- Time-efficient: Ask for brief examples rather than detailed stories
- High-level: Cover broad topics rather than deep technical details

Adaptation Examples:
- Instead of: "Walk me through a complex project where you had to overcome significant challenges..."
  Ask: "Can you briefly describe a recent project you're proud of?"
- Instead of: "Describe your approach to conflict resolution with detailed examples..."
  Ask: "How do you typically handle workplace disagreements?"

Remember: Save detailed behavioral questions and technical deep-dives for later interview rounds. Focus on screening basics: qualifications, genuine interest, communication skills, and availability.

`
        : ""

    return `You are conducting a ${this.interviewType === "phone-screener" ? "phone screening interview" : "first-round interview"} for the position of ${this.job.title} at ${this.job.company}.

${phoneScreenerInstructions}
`
  }
}
