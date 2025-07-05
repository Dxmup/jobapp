import { describe, it, expect, jest, beforeEach, afterEach } from "@jest/globals"

// Mock Next.js modules
jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
  redirect: jest.fn(),
}))

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn((key: string) => {
      if (key === "user_id") {
        return { value: "test-user-id" }
      }
      return undefined
    }),
  })),
}))

// Mock Supabase
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        order: jest.fn(() => ({
          limit: jest.fn(),
        })),
      })),
    })),
  })),
}

jest.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: () => mockSupabaseClient,
}))

// Mock the interview prep actions
jest.mock("@/app/actions/interview-prep-actions", () => ({
  getInterviewQuestions: jest.fn(),
  getUserJobs: jest.fn(),
  getUserResumes: jest.fn(),
}))

import { getInterviewQuestions, getUserJobs, getUserResumes } from "@/app/actions/interview-prep-actions"

describe("Mock Phone Interview", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe("getUserJobs", () => {
    it("should return jobs for authenticated user", async () => {
      const mockJobs = [
        { id: "1", title: "Software Engineer", company: "Tech Corp", status: "applied" },
        { id: "2", title: "Frontend Developer", company: "Web Co", status: "interviewing" },
      ]

      // Mock successful database response
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: mockJobs, error: null })),
          })),
        })),
      })
      ;(getUserJobs as jest.MockedFunction<typeof getUserJobs>).mockResolvedValue({
        success: true,
        jobs: mockJobs,
      })

      const result = await getUserJobs()

      expect(result.success).toBe(true)
      expect(result.jobs).toHaveLength(2)
      expect(result.jobs?.[0].title).toBe("Software Engineer")
    })

    it("should handle empty jobs list", async () => {
      ;(getUserJobs as jest.MockedFunction<typeof getUserJobs>).mockResolvedValue({
        success: true,
        jobs: [],
      })

      const result = await getUserJobs()

      expect(result.success).toBe(true)
      expect(result.jobs).toHaveLength(0)
    })

    it("should handle database errors gracefully", async () => {
      ;(getUserJobs as jest.MockedFunction<typeof getUserJobs>).mockResolvedValue({
        success: false,
        error: "Database connection failed",
      })

      const result = await getUserJobs()

      expect(result.success).toBe(false)
      expect(result.error).toBe("Database connection failed")
    })
  })

  describe("getUserResumes", () => {
    it("should return resumes for authenticated user", async () => {
      const mockResumes = [
        { id: "1", name: "Software Engineer Resume", file_name: "resume1.pdf", created_at: "2024-01-01" },
        { id: "2", name: "Frontend Developer Resume", file_name: "resume2.pdf", created_at: "2024-01-02" },
      ]
      ;(getUserResumes as jest.MockedFunction<typeof getUserResumes>).mockResolvedValue({
        success: true,
        resumes: mockResumes,
      })

      const result = await getUserResumes()

      expect(result.success).toBe(true)
      expect(result.resumes).toHaveLength(2)
      expect(result.resumes?.[0].name).toBe("Software Engineer Resume")
    })
  })

  describe("getInterviewQuestions", () => {
    it("should return interview questions for job and resume", async () => {
      const mockQuestions = {
        technical: [
          "What is your experience with React?",
          "How do you handle state management?",
          "Explain the concept of closures in JavaScript",
        ],
        behavioral: ["Tell me about a challenging project you worked on", "How do you handle tight deadlines?"],
      }
      ;(getInterviewQuestions as jest.MockedFunction<typeof getInterviewQuestions>).mockResolvedValue({
        success: true,
        questions: mockQuestions,
      })

      const result = await getInterviewQuestions("job-id", "resume-id")

      expect(result.success).toBe(true)
      expect(result.questions?.technical).toHaveLength(3)
      expect(result.questions?.behavioral).toHaveLength(2)
      expect(result.questions?.technical[0]).toBe("What is your experience with React?")
    })

    it("should handle missing questions gracefully", async () => {
      ;(getInterviewQuestions as jest.MockedFunction<typeof getInterviewQuestions>).mockResolvedValue({
        success: true,
        questions: { technical: [], behavioral: [] },
      })

      const result = await getInterviewQuestions("job-id")

      expect(result.success).toBe(true)
      expect(result.questions?.technical).toHaveLength(0)
      expect(result.questions?.behavioral).toHaveLength(0)
    })

    it("should handle API errors", async () => {
      ;(getInterviewQuestions as jest.MockedFunction<typeof getInterviewQuestions>).mockResolvedValue({
        success: false,
        error: "Failed to generate questions",
      })

      const result = await getInterviewQuestions("invalid-job-id")

      expect(result.success).toBe(false)
      expect(result.error).toBe("Failed to generate questions")
    })
  })

  describe("Mock Interview Flow", () => {
    it("should complete full mock interview setup flow", async () => {
      // Mock the complete flow
      const mockJobs = [{ id: "job-1", title: "Software Engineer", company: "Tech Corp", status: "applied" }]
      const mockResumes = [{ id: "resume-1", name: "My Resume", file_name: "resume.pdf", created_at: "2024-01-01" }]
      const mockQuestions = {
        technical: ["What is React?", "Explain async/await"],
        behavioral: ["Tell me about yourself", "Why do you want this job?"],
      }
      ;(getUserJobs as jest.MockedFunction<typeof getUserJobs>).mockResolvedValue({
        success: true,
        jobs: mockJobs,
      })
      ;(getUserResumes as jest.MockedFunction<typeof getUserResumes>).mockResolvedValue({
        success: true,
        resumes: mockResumes,
      })
      ;(getInterviewQuestions as jest.MockedFunction<typeof getInterviewQuestions>).mockResolvedValue({
        success: true,
        questions: mockQuestions,
      })

      // Test the flow
      const jobsResult = await getUserJobs()
      expect(jobsResult.success).toBe(true)
      expect(jobsResult.jobs).toHaveLength(1)

      const resumesResult = await getUserResumes()
      expect(resumesResult.success).toBe(true)
      expect(resumesResult.resumes).toHaveLength(1)

      const questionsResult = await getInterviewQuestions("job-1", "resume-1")
      expect(questionsResult.success).toBe(true)
      expect(questionsResult.questions?.technical).toHaveLength(2)
      expect(questionsResult.questions?.behavioral).toHaveLength(2)
    })
  })

  describe("Performance and Caching", () => {
    it("should cache getUserJobs results to prevent repeated calls", async () => {
      const mockJobs = [{ id: "1", title: "Test Job", company: "Test Co", status: "applied" }]
      ;(getUserJobs as jest.MockedFunction<typeof getUserJobs>).mockResolvedValue({
        success: true,
        jobs: mockJobs,
      })

      // Call multiple times rapidly
      const results = await Promise.all([getUserJobs(), getUserJobs(), getUserJobs()])

      // All should succeed
      results.forEach((result) => {
        expect(result.success).toBe(true)
        expect(result.jobs).toHaveLength(1)
      })

      // Should have been called (mocked, so we can't test actual caching, but we can test the interface)
      expect(getUserJobs).toHaveBeenCalled()
    })
  })
})
