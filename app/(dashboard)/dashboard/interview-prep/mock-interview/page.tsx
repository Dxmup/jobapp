"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@clerk/nextjs"
import { api } from "~/trpc/react"

const MockInterviewPage = () => {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useUser()
  const [firstName, setFirstName] = useState<string>("the candidate")

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const profileResult = await api.profile.getProfile.query()

          if (profileResult && profileResult.profile) {
            const firstName =
              profileResult.profile?.first_name || profileResult.profile?.fullName?.split(" ")[0] || "the candidate"
            setFirstName(firstName)
            console.log(
              "👤 User first name extracted:",
              firstName,
              "from first_name:",
              profileResult.profile?.first_name,
            )
          } else {
            console.log("No profile data found for the user.")
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error)
          toast({
            title: "Error fetching profile",
            description: "There was an error fetching your profile. Please try again.",
            variant: "destructive",
          })
        }
      }
    }

    fetchUserProfile()
  }, [user, toast])

  const handleStartInterview = () => {
    router.push("/(dashboard)/dashboard/interview-prep/mock-interview/interview")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-4">Welcome to Mock Interview, {firstName}!</h1>
      <p className="mb-4">Practice makes perfect! Use this space to hone your interview skills.</p>
      <Button onClick={handleStartInterview}>Start Interview</Button>
    </div>
  )
}

export default MockInterviewPage
