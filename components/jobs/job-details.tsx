import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, Calendar, LinkIcon, Mail, User } from "lucide-react"

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
            <h3 className="text-sm font-medium text-muted-foreground">Company</h3>
            <p>{job.company}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
            <p>{job.location}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Created On</h3>
            <p className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(job.createdAt)}
            </p>
          </div>
          {job.url && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Job Posting URL</h3>
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate"
                >
                  {job.url}
                </a>
              </div>
            </div>
          )}
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
          {job.contactName ? (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Contact Name</h3>
              <p>{job.contactName}</p>
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Contact Name</h3>
              <p className="text-muted-foreground italic">Not specified</p>
            </div>
          )}

          {job.contactEmail ? (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Contact Email</h3>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${job.contactEmail}`} className="text-primary hover:underline">
                  {job.contactEmail}
                </a>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Contact Email</h3>
              <p className="text-muted-foreground italic">Not specified</p>
            </div>
          )}

          <div className="pt-4">
            <Button variant="outline" className="w-full">
              Add Contact Information
            </Button>
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
