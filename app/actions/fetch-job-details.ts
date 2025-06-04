"use server"

type JobDetails = {
  jobTitle: string
  company: string
  location: string
  jobDescription: string
  error?: string
}

export async function fetchJobDetails(url: string): Promise<JobDetails> {
  // Instead of trying to fetch directly, we'll return a flag
  // that tells the client to use its own API endpoint
  return {
    jobTitle: "",
    company: "",
    location: "",
    jobDescription: "",
    error: "USE_CLIENT_API", // Special flag to indicate client should use its API
  }
}
