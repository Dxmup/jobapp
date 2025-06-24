"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { useUser } from "@clerk/nextjs"

interface ResumeContextType {
  name: string
  email: string
  phone: string
  linkedin: string
  github: string
  objective: string
  experience: any[]
  education: any[]
  skills: string[]
  projects: any[]
  awards: any[]
}

const defaultResumeContext: ResumeContextType = {
  name: "the candidate",
  email: "candidate@example.com",
  phone: "123-456-7890",
  linkedin: "linkedin.com/in/candidate",
  github: "github.com/candidate",
  objective:
    "To obtain a challenging position where I can utilize my skills and experience to contribute to the growth of the organization.",
  experience: [
    {
      title: "Software Engineer",
      company: "Example Company",
      location: "New York, NY",
      startDate: "2020-01-01",
      endDate: "2022-12-31",
      description: "Developed and maintained web applications using React, Node.js, and MongoDB.",
    },
  ],
  education: [
    {
      school: "Example University",
      degree: "Bachelor of Science in Computer Science",
      location: "New York, NY",
      startDate: "2016-09-01",
      endDate: "2020-05-31",
    },
  ],
  skills: ["JavaScript", "React", "Node.js", "MongoDB", "HTML", "CSS"],
  projects: [
    {
      name: "Personal Website",
      description: "A personal website built with React and Next.js.",
      url: "example.com",
    },
  ],
  awards: [
    {
      name: "Employee of the Month",
      date: "2022-01-01",
      description: "Recognized for outstanding performance and contribution to the team.",
    },
  ],
}

const ResumeContext = createContext<ResumeContextType>(defaultResumeContext)

interface ResumeProviderProps {
  children: React.ReactNode
}

export const ResumeProvider: React.FC<ResumeProviderProps> = ({ children }) => {
  const [resumeData, setResumeData] = useState<ResumeContextType>(defaultResumeContext)
  const { userId, getToken } = useAuth()
  const { user } = useUser()

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userId) {
        try {
          const token = await getToken({ template: "supabase" })
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/user_profiles?user_id=eq.${userId}`,
            {
              headers: {
                apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
                Prefer: "return=representation",
              },
            },
          )

          if (response.ok) {
            const data = await response.json()
            if (data && data.length > 0) {
              const profileData = data[0]
              const userFirstName =
                profileData?.first_name || profileData?.name?.split(" ")[0] || "preloadedMock candidate"
              setResumeData(createResumeContext(profileData, userFirstName))
            } else {
              setResumeData(createResumeContext())
            }
          } else {
            console.error("Failed to fetch user profile:", response.status)
            setResumeData(createResumeContext())
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
          setResumeData(createResumeContext())
        }
      } else {
        setResumeData(createResumeContext())
      }
    }

    fetchUserProfile()
  }, [userId, getToken, user])

  const createResumeContext = (profileData: any = null, userFirstName: string | null = null): ResumeContextType => {
    return {
      name: userFirstName || "createResumeContext candidate", // Changed from "the candidate"
      email: profileData?.email || "candidate@example.com",
      phone: profileData?.phone || "123-456-7890",
      linkedin: profileData?.linkedin || "linkedin.com/in/candidate",
      github: profileData?.github || "github.com/candidate",
      objective:
        profileData?.objective ||
        "To obtain a challenging position where I can utilize my skills and experience to contribute to the growth of the organization.",
      experience: profileData?.experience || [
        {
          title: "Software Engineer",
          company: "Example Company",
          location: "New York, NY",
          startDate: "2020-01-01",
          endDate: "2022-12-31",
          description: "Developed and maintained web applications using React, Node.js, and MongoDB.",
        },
      ],
      education: profileData?.education || [
        {
          school: "Example University",
          degree: "Bachelor of Science in Computer Science",
          location: "New York, NY",
          startDate: "2016-09-01",
          endDate: "2020-05-31",
        },
      ],
      skills: profileData?.skills || ["JavaScript", "React", "Node.js", "MongoDB", "HTML", "CSS"],
      projects: profileData?.projects || [
        {
          name: "Personal Website",
          description: "A personal website built with React and Next.js.",
          url: "example.com",
        },
      ],
      awards: profileData?.awards || [
        {
          name: "Employee of the Month",
          date: "2022-01-01",
          description: "Recognized for outstanding performance and contribution to the team.",
        },
      ],
    }
  }

  return <ResumeContext.Provider value={resumeData}>{children}</ResumeContext.Provider>
}

export const useResume = () => useContext(ResumeContext)
