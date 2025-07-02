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

      const response = await fetch("/api/resumes", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      toast({
        title: "Resume uploaded",
        description: "Your resume has been uploaded successfully.",
      })

      router.push(`/jobs/${jobId}`)
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
          <Link href={`/jobs/${jobId}`}>
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
              <Label htmlFor="resume-name">Resume Name</Label>
              <Input
                id="resume-name"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
                placeholder="Enter a name for this resume"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume-file">Resume File</Label>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                <input
                  id="resume-file"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />

                {selectedFile ? (
                  <div className="text-center">
                    <FileUp className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-transparent"
                      onClick={() => {
                        const fileInput = document.getElementById("resume-file") as HTMLInputElement
                        fileInput.click()
                      }}
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="font-medium">Drag and drop your resume here</p>
                    <p className="text-sm text-muted-foreground mb-2">Supports PDF, DOC, and DOCX files up to 5MB</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const fileInput = document.getElementById("resume-file") as HTMLInputElement
                        fileInput.click()
                      }}
                    >
                      Browse Files
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isUploading || !selectedFile}>
              {isUploading ? "Uploading..." : "Upload Resume"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
