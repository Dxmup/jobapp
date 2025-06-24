"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast"
import { Document, Page, Text, View, StyleSheet, PDFViewer, Font } from "@react-pdf/renderer"

// Import necessary libraries for speech-to-text and text-to-speech
// For speech-to-text, you might use the Web Speech API or a library like 'react-speech-recognition'
// For text-to-speech, you might use the Web Speech API or a library like 'responsivevoice.js'

// Define context types
interface ResumeContextType {
  name: string
  email: string
  phone: string
  linkedin: string
  github: string
  objective: string
  skills: string[]
  experience: {
    title: string
    company: string
    dates: string
    description: string
  }[]
  education: {
    institution: string
    degree: string
    dates: string
    description: string
  }[]
  projects: {
    name: string
    description: string
    technologies: string[]
  }[]
}

// Create context
const ResumeContext = createContext<ResumeContextType | null>(null)

// Provider component
interface ResumeProviderProps {
  children: React.ReactNode
}

const ResumeProvider: React.FC<ResumeProviderProps> = ({ children }) => {
  const [resumeData, setResumeData] = useState<ResumeContextType>({
    name: "liveInterviewContext candidate", // Changed from "the candidate"
    email: "candidate@example.com",
    phone: "123-456-7890",
    linkedin: "linkedin.com/in/candidate",
    github: "github.com/candidate",
    objective: "To obtain a challenging position where I can utilize my skills and contribute to the company's growth.",
    skills: ["JavaScript", "React", "Node.js", "HTML", "CSS"],
    experience: [
      {
        title: "Software Engineer",
        company: "Tech Company",
        dates: "2020-2022",
        description: "Developed and maintained web applications using React and Node.js.",
      },
    ],
    education: [
      {
        institution: "University of Example",
        degree: "Bachelor of Science in Computer Science",
        dates: "2016-2020",
        description: "Relevant coursework included data structures, algorithms, and software engineering.",
      },
    ],
    projects: [
      {
        name: "Personal Website",
        description: "A personal website built with React and hosted on Netlify.",
        technologies: ["React", "Netlify"],
      },
    ],
  })

  return <ResumeContext.Provider value={resumeData}>{children}</ResumeContext.Provider>
}

// Custom hook to consume context
const useResume = () => {
  const context = useContext(ResumeContext)
  if (!context) {
    throw new Error("useResume must be used within a ResumeProvider")
  }
  return context
}

interface LiveInterviewProps {
  job: any // Replace 'any' with the actual type of 'job'
  resume: any // Replace 'any' with the actual type of 'resume'
  questions: any // Replace 'any' with the actual type of 'questions'
  interviewType?: string
  isPreloaded?: boolean
  userFirstName?: string
}

// LiveInterview component
const LiveInterview = ({
  job,
  resume,
  questions: initialQuestions,
  interviewType = "first-interview",
  isPreloaded = false,
  userFirstName,
}: LiveInterviewProps) => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState(initialQuestions)
  const [hasEnoughQuestions, setHasEnoughQuestions] = useState(true)
  const [interviewState, setInterviewState] = useState("idle")

  // Debug logging
  useEffect(() => {
    console.log("🔍 TRACE: LiveInterview props received:", {
      technical: questions.technical.length,
      behavioral: questions.behavioral.length,
      total: questions.technical.length + questions.behavioral.length,
      interviewType,
      hasEnoughQuestions,
      isPreloaded,
      userFirstName: userFirstName || "NOT PROVIDED",
      jobTitle: job?.title,
      resumeName: resume?.name,
    })
  }, [questions, interviewType, hasEnoughQuestions, isPreloaded, userFirstName, job?.title, resume?.name])

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    const fetchUserProfile = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/user/profile`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setUserProfile(data)
      } catch (e: any) {
        setError(e.message)
        toast.error(`Error fetching profile: ${e.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [session, status, router])

  const fetchUserProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/user/profile`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const profileData = await response.json()
      setUserProfile(profileData)

      // Extract user's first name from profile data
      const userFirstNameLocal =
        profileData?.first_name || profileData?.name?.split(" ")[0] || "liveInterview candidate"

      // Create resume context with the fetched user data
      createResumeContext(userFirstNameLocal, profileData?.email || "candidate@example.com")
    } catch (e: any) {
      setError(e.message)
      toast.error(`Error fetching profile: ${e.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const createResumeContext = (userFirstName: string, userEmail: string) => {
    // Set default values or fetch from userProfile as needed
    const newResumeData: ResumeContextType = {
      name: userFirstName || "liveInterviewContext candidate", // Changed from "the candidate"
      email: userEmail || "candidate@example.com",
      phone: "123-456-7890",
      linkedin: "linkedin.com/in/candidate",
      github: "github.com/candidate",
      objective:
        "To obtain a challenging position where I can utilize my skills and contribute to the company's growth.",
      skills: ["JavaScript", "React", "Node.js", "HTML", "CSS"],
      experience: [
        {
          title: "Software Engineer",
          company: "Tech Company",
          dates: "2020-2022",
          description: "Developed and maintained web applications using React and Node.js.",
        },
      ],
      education: [
        {
          institution: "University of Example",
          degree: "Bachelor of Science in Computer Science",
          dates: "2016-2020",
          description: "Relevant coursework included data structures, algorithms, and software engineering.",
        },
      ],
      projects: [
        {
          name: "Personal Website",
          description: "A personal website built with React and hosted on Netlify.",
          technologies: ["React", "Netlify"],
        },
      ],
    }
    setResumeData(newResumeData)
  }

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [spokenText, setSpokenText] = useState("")

  const startSpeaking = () => {
    setIsSpeaking(true)
    // Implement speech-to-text logic here
    // Update spokenText state with the transcribed text
  }

  const stopSpeaking = () => {
    setIsSpeaking(false)
    // Implement stop speech-to-text logic here
  }

  const speakText = (text: string) => {
    // Implement text-to-speech logic here
    // Use the Web Speech API or a library like 'responsivevoice.js' to speak the text
  }

  // PDF styles
  Font.register({
    family: "Oswald",
    src: "https://fonts.gstatic.com/s/oswald/v13/Y_TKV6K6pT9gSkPiGxziMA.ttf",
  })

  const styles = StyleSheet.create({
    page: {
      flexDirection: "row",
      backgroundColor: "#E4E4E4",
    },
    section: {
      margin: 10,
      padding: 10,
      flexGrow: 1,
    },
    viewer: {
      width: "100%",
      height: "100vh",
    },
    title: {
      fontSize: 24,
      textAlign: "center",
      fontFamily: "Oswald",
    },
    body: {
      fontSize: 12,
      textAlign: "justify",
    },
  })

  // PDF Document
  const MyDocument = () => {
    const resume = useResume()

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.title}>{resume.name}</Text>
            <Text style={styles.body}>{resume.objective}</Text>
            <Text style={styles.title}>Experience</Text>
            {resume.experience.map((exp, index) => (
              <View key={index}>
                <Text>{exp.title}</Text>
                <Text>{exp.company}</Text>
                <Text>{exp.dates}</Text>
                <Text>{exp.description}</Text>
              </View>
            ))}
          </View>
          <View style={styles.section}>
            <Text style={styles.title}>Education</Text>
            {resume.education.map((edu, index) => (
              <View key={index}>
                <Text>{edu.institution}</Text>
                <Text>{edu.degree}</Text>
                <Text>{edu.dates}</Text>
                <Text>{edu.description}</Text>
              </View>
            ))}
          </View>
        </Page>
      </Document>
    )
  }

  const startConversationalInterview = async () => {
    try {
      setError(null)
      setInterviewState("initializing")

      // Prepare job and resume context
      const jobContext = {
        company: job.company,
        title: job.title,
        description: job.description,
      }

      const resumeContext = {
        name: userFirstName || "liveInterview candidate", // Changed from "the candidate"
        title: resume?.title,
        experience: resume?.experience,
      }

      console.log("🔍 TRACE: startConversationalInterview contexts:", {
        jobContext,
        resumeContext,
        userFirstNameProp: userFirstName || "NOT PROVIDED",
        finalCandidateName: resumeContext.name,
      })

      // ... rest of function ...
    } catch (error: any) {
      console.error("❌ Failed to start conversational interview:", error)
      setError(`Failed to start interview: ${error.message}`)
      setInterviewState("error")
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <ResumeProvider>
      <div>
        <h1>Live Interview</h1>
        {userProfile && (
          <div>
            <p>Welcome, {userProfile.name || "Candidate"}!</p>
            {/* Display other user profile information here */}
          </div>
        )}

        {/* Speech-to-text and text-to-speech controls */}
        <button onClick={startSpeaking} disabled={isSpeaking}>
          Start Speaking
        </button>
        <button onClick={stopSpeaking} disabled={!isSpeaking}>
          Stop Speaking
        </button>
        <p>Spoken Text: {spokenText}</p>
        <button onClick={() => speakText("Hello, how are you today?")}>Speak Example Text</button>

        {/* PDF Viewer */}
        <PDFViewer style={styles.viewer}>
          <MyDocument />
        </PDFViewer>
      </div>
    </ResumeProvider>
  )
}

export default LiveInterview
