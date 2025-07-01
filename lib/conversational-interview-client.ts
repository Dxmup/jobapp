import { promptManager } from "./prompt-manager"

interface InterviewConfig {
  jobTitle: string
  companyName: string
  interviewerName: string
  userFirstName: string
  phoneScreenerInstructions: string
}

interface InterviewQuestion {
  id: string
  text: string
  category: string
  followUp?: string
}

export class ConversationalInterviewClient {
  private config: InterviewConfig
  private questions: InterviewQuestion[] = []
  private currentQuestionIndex = 0

  constructor(config: InterviewConfig) {
    this.config = config
  }

  async generateIntroduction(): Promise<string> {
    const introText = `Hello ${this.config.userFirstName}, this is ${this.config.interviewerName} from ${this.config.companyName}. Thank you for taking the time to speak with me today about the ${this.config.jobTitle} position. I'm excited to learn more about your background and experience.`

    const variables = {
      interviewerName: this.config.interviewerName,
      companyName: this.config.companyName,
      phoneScreenerInstructions: this.config.phoneScreenerInstructions,
      introText,
      userFirstName: this.config.userFirstName,
    }

    const processedPrompt = await promptManager.getProcessedPrompt("interview-introduction", variables)

    if (!processedPrompt) {
      // Fallback if prompt system fails
      return introText
    }

    return processedPrompt
  }

  async generateQuestion(questionText: string): Promise<string> {
    const variables = {
      interviewerName: this.config.interviewerName,
      interviewType: "phone screening",
      jobTitle: this.config.jobTitle,
      companyName: this.config.companyName,
      phoneScreenerInstructions: this.config.phoneScreenerInstructions,
      userFirstName: this.config.userFirstName,
      questionText,
    }

    const processedPrompt = await promptManager.getProcessedPrompt("interview-question", variables)

    if (!processedPrompt) {
      // Fallback if prompt system fails
      return `${questionText}`
    }

    return processedPrompt
  }

  async generateClosing(): Promise<string> {
    const closingText = `Thank you so much for your time today, ${this.config.userFirstName}. I really enjoyed our conversation and learning more about your experience. We'll be in touch soon with next steps. Have a great rest of your day!`

    const variables = {
      interviewerName: this.config.interviewerName,
      closingText,
      userFirstName: this.config.userFirstName,
    }

    const processedPrompt = await promptManager.getProcessedPrompt("interview-closing", variables)

    if (!processedPrompt) {
      // Fallback if prompt system fails
      return closingText
    }

    return processedPrompt
  }

  setQuestions(questions: InterviewQuestion[]) {
    this.questions = questions
    this.currentQuestionIndex = 0
  }

  getCurrentQuestion(): InterviewQuestion | null {
    if (this.currentQuestionIndex >= this.questions.length) {
      return null
    }
    return this.questions[this.currentQuestionIndex]
  }

  moveToNextQuestion(): boolean {
    this.currentQuestionIndex++
    return this.currentQuestionIndex < this.questions.length
  }

  hasMoreQuestions(): boolean {
    return this.currentQuestionIndex < this.questions.length
  }

  getProgress(): { current: number; total: number; percentage: number } {
    const current = Math.min(this.currentQuestionIndex + 1, this.questions.length)
    const total = this.questions.length
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0

    return { current, total, percentage }
  }

  reset() {
    this.currentQuestionIndex = 0
  }
}
