"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, FileUp, Upload } from "lucide-react"
import Link from "next/link"

export default function UploadResumePage({ params }: { params: { id: string } }) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [resumeName, setResumeName] = useState("My Resume")
  const router = useRouter()
  const { toast } = useToast()
  const jobId = params.id

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)

      // Auto-set resume name based on file name
      const fileName = file.name.replace(/\.[^/.]+$/, "") // Remove extension
      setResumeName(fileName)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("name", resumeName)
      formData.append("jobId", jobId)

      const response = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload resume")
      }

      toast({
        title: "Resume uploaded",
        description: "Your resume has been uploaded successfully.",
      })

      router.push(`/dashboard/jobs/${jobId}`)
    } catch (error) {
      console.error("Error uploading resume:", error)
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/jobs/${jobId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Upload Resume</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleUpload}>
          <CardHeader>
            <CardTitle>Upload Your Resume</CardTitle>
            <CardDescription>Upload your existing resume to use for this job application.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="resumeName">Resume Name</Label>
              <Input
                id="resumeName"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
                placeholder="Enter a name for this resume"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resumeFile">Resume File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PDF, DOC, or DOCX (max 10MB)</p>
                </div>
                <Input
                  id="resumeFile"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="mt-4"
                />
              </div>

              {selectedFile && <div className="text-sm text-gray-600">Selected: {selectedFile.name}</div>}
            </div>
          </CardContent>

          <div className="flex justify-between px-6 pb-6">
            <Button variant="outline" type="button" asChild>
              <Link href={`/dashboard/jobs/${jobId}`}>Cancel</Link>
            </Button>

            <Button type="submit" disabled={!selectedFile || isUploading}>
              {isUploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resume
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
