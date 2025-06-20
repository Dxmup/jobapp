"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Calendar, LinkIcon, Mail, User } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"

interface JobDetailsProps {
  job: {
    id: string
    title: string
    company: string
    location: string
    description: string
    url?: string
    contactName?: string
    contactEmail?: string
    createdAt: string
  }
}

export function JobDetails({ job }: JobDetailsProps) {
  const [company, setCompany] = useState(job.company || "")
  const [location, setLocation] = useState(job.location || "")
  const [url, setUrl] = useState(job.url || "")
  const [contactName, setContactName] = useState(job.contactName || "")
  const [contactEmail, setContactEmail] = useState(job.contactEmail || "")
  const [isSaving, setIsSaving] = useState(false)

  const saveField = async (field: string, value: string) => {
    if (isSaving) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [field]: value }),
      })

      if (!response.ok) {
        throw new Error("Failed to save changes")
      }
    } catch (error) {
      console.error("Error saving job details:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Company</h3>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              onBlur={() => company !== job.company && saveField("company", company)}
              placeholder="Enter company name"
              disabled={isSaving}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Location</h3>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onBlur={() => location !== job.location && saveField("location", location)}
              placeholder="Enter location"
              disabled={isSaving}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Created On</h3>
            <p className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(job.createdAt)}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Job Posting URL</h3>
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={() => url !== job.url && saveField("url", url)}
                placeholder="Enter job posting URL"
                className="flex-1"
                disabled={isSaving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Name</h3>
            <Input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              onBlur={() => contactName !== job.contactName && saveField("contactName", contactName)}
              placeholder="Enter contact name"
              disabled={isSaving}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Email</h3>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                onBlur={() => contactEmail !== job.contactEmail && saveField("contactEmail", contactEmail)}
                placeholder="Enter contact email"
                className="flex-1"
                disabled={isSaving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
          <CardDescription>The original job posting description</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <p>{job.description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
