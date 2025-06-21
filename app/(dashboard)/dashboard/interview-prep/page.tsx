"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

const InterviewPrepPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)

  useEffect(() => {
    // Retrieve job and resume IDs from local storage or other state management
    const jobId = localStorage.getItem("selectedJobId")
    const resumeId = localStorage.getItem("selectedResumeId")

    setSelectedJobId(jobId)
    setSelectedResumeId(resumeId)
  }, [])

  const handleStartMockInterview = () => {
    if (selectedJobId) {
      let url = `/dashboard/interview-prep/${selectedJobId}/mock-interview`
      if (selectedResumeId) {
        url += `?resumeId=${selectedResumeId}`
      }
      router.push(url)
    } else {
      // Handle case where job ID is not selected (e.g., display an error message)
      alert("Please select a job before starting a mock interview.")
    }
  }

  return (
    <div>
      <h1>Interview Preparation</h1>
      {selectedJobId ? (
        <div>
          <p>Selected Job ID: {selectedJobId}</p>
          {selectedResumeId && <p>Selected Resume ID: {selectedResumeId}</p>}
          <button onClick={handleStartMockInterview}>Start Mock Interview</button>
        </div>
      ) : (
        <p>Please select a job to begin preparing for your interview.</p>
      )}
    </div>
  )
}

export default InterviewPrepPage
