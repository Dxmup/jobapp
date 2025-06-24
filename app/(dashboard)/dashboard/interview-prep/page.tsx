"use client"

import { useState, useEffect } from "react"
import { useUser } from "@auth0/nextjs-auth0/client"
import { Skeleton } from "@/components/ui/skeleton"

const InterviewPrepPage = () => {
  const { user, isLoading, error } = useUser()
  const [firstName, setFirstName] = useState<string>("the candidate")

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const response = await fetch("/api/profile")
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const profileResult = await response.json()

          const firstName =
            profileResult.profile?.first_name || profileResult.profile?.fullName?.split(" ")[0] || "the candidate"
          setFirstName(firstName)
          console.log("👤 User first name extracted:", firstName, "from first_name:", profileResult.profile?.first_name)
        } catch (e: any) {
          console.error("Could not fetch user profile", e?.message)
        }
      }
    }

    fetchUserProfile()
  }, [user])

  if (isLoading)
    return (
      <div>
        <Skeleton className="h-4 w-[250px]" />
      </div>
    )
  if (error) return <div>Error loading user.</div>

  return (
    <div>
      <h1>Hello, {firstName}!</h1>
      <p>Welcome to the Interview Prep page.</p>
    </div>
  )
}

export default InterviewPrepPage
