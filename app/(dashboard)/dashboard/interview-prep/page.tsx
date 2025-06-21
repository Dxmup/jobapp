"use client"

import { Phone, Video } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const jobs = [
  {
    id: "1",
    title: "Software Engineer",
    company: "Google",
    status: "applied",
    location: "Mountain View, CA",
  },
  {
    id: "2",
    title: "Frontend Developer",
    company: "Facebook",
    status: "interviewing",
    location: "Menlo Park, CA",
  },
  {
    id: "3",
    title: "Backend Engineer",
    company: "Amazon",
    status: "offer",
    location: "Seattle, WA",
  },
]

export default function InterviewPrepPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Interview Preparation</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{job.title}</CardTitle>
              <CardDescription>{job.company}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>
                    Status: <span className="capitalize">{job.status}</span>
                  </p>
                  {job.location && <p>Location: {job.location}</p>}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Select Interview Type:</h4>
                  <div className="grid gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start h-auto p-3"
                      onClick={() => router.push(`/dashboard/interview-prep/${job.id}?interviewType=phone-screener`)}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">Phone Screener</div>
                        <div className="text-xs text-muted-foreground">15 min • Basic qualifications</div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start h-auto p-3"
                      onClick={() => router.push(`/dashboard/interview-prep/${job.id}?interviewType=first-interview`)}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">First Interview</div>
                        <div className="text-xs text-muted-foreground">30 min • In-depth questions</div>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
