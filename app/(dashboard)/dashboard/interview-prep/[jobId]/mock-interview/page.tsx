import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import type React from "react"
import { db } from "@/lib/db"
import { PreloadedMockInterview } from "./_components/preloaded-mock-interview"

interface MockInterviewPageProps {
  params: {
    jobId: string
  }
  searchParams: {
    resumeId?: string
    preload?: string
    interviewType?: "phone-screener" | "first-interview"
  }
}

const MockInterviewPage: React.FC<MockInterviewPageProps> = async ({ params: { jobId }, searchParams }) => {
  const { userId } = auth()

  if (!userId) {
    return redirect("/")
  }

  const { resumeId, preload, interviewType = "first-interview" } = searchParams

  if (!jobId) {
    return redirect("/dashboard")
  }

  const job = await db.job.findUnique({
    where: {
      id: jobId,
      userId,
    },
  })

  if (!job) {
    return redirect("/dashboard")
  }

  if (!resumeId) {
    return redirect(`/dashboard/interview-prep/${jobId}`)
  }

  const resume = await db.resume.findUnique({
    where: {
      id: resumeId,
      userId,
    },
  })

  if (!resume) {
    return redirect(`/dashboard/interview-prep/${jobId}`)
  }

  const shouldPreload = preload === "true"

  return (
    <div className="p-4">
      <PreloadedMockInterview job={job} resume={resume} shouldPreload={shouldPreload} interviewType={interviewType} />
    </div>
  )
}

export default MockInterviewPage
