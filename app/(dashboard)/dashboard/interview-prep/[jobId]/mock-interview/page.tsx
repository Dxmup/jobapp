"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { toast } from "react-hot-toast"

import { useSearchParams } from "next/navigation"
import type { Job } from "@/types"
import { getJob } from "@/lib/actions/job.actions"
import MockInterviewComponent from "@/components/MockInterviewComponent"

const MockInterviewPage = () => {
  const router = useRouter()
  const { userId, getToken } = useAuth()
  const searchParams = useSearchParams()
  const jobId = searchParams.get("jobId")

  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [firstName, setFirstName] = useState<string>("the candidate")

  useEffect(() => {
    if (!jobId) {
      toast.error("Job ID is missing.")
      router.push("/(dashboard)/dashboard/interview-prep")
      return
    }

    const fetchJobDetails = async () => {
      setIsLoading(true)
      try {
        const jobDetails = await getJob(jobId)
        if (jobDetails) {
          setJob(jobDetails)
        } else {
          toast.error("Failed to fetch job details.")
          router.push("/(dashboard)/dashboard/interview-prep")
        }
      } catch (error: any) {
        console.error("Error fetching job details:", error)
        toast.error(error.message || "An error occurred while fetching job details.")
        router.push("/(dashboard)/dashboard/interview-prep")
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobDetails()
  }, [jobId, router])

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        return
      }

      try {
        const token = await getToken({ template: "supabase" })

        const res = await fetch("/api/getUserProfile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        })

        if (res.ok) {
          const profileResult = await res.json()
          const firstName =
            profileResult.profile?.first_name || profileResult.profile?.fullName?.split(" ")[0] || "the candidate"
          setFirstName(firstName)
          console.log("👤 User first name extracted:", firstName, "from first_name:", profileResult.profile?.first_name)
        } else {
          console.error("Failed to fetch user profile")
          setFirstName("the candidate")
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
        setFirstName("the candidate")
      }
    }

    fetchUserProfile()
  }, [userId, getToken])

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!job) {
    return <div className="flex justify-center items-center h-screen">Job not found.</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Mock Interview for {job.title}</h1>
      <MockInterviewComponent jobId={jobId} jobTitle={job.title} candidateFirstName={firstName} />
    </div>
  )
}

export default MockInterviewPage
