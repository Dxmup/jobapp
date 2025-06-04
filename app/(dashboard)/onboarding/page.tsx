"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { ArrowRight, FileUp, Loader2, Info, Clipboard, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

export default function OnboardingPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileStatus, setFileStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [errorDetails, setErrorDetails] = useState<string>("")
  const [resumeName, setResumeName] = useState("My Baseline Resume")
  const [resumeContent, setResumeContent] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    try {
      if (!resumeContent || resumeContent.trim().length < 50) {
        toast({
          title: "Resume content required",
          description: "Please enter your resume content (at least 50 characters).",
          variant: "destructive",
        })
        setIsUploading(false)
        return
      }

      // Create a FormData object
      const formData = new FormData()
      formData.append("name", resumeName)
      formData.append("content", resumeContent)
      formData.append("isAiGenerated", "false")

      // If we have a successfully processed file, add it to the form data
      if (uploadedFile && fileStatus === "success") {
        formData.append("file", uploadedFile)
      } else {
        // Create a text file from the content
        const textFile = new File([resumeContent], "resume.txt", { type: "text/plain" })
        formData.append("file", textFile)
      }

      // Upload the resume
      const response = await fetch("/api/resumes", {
        method: "POST",
        body: formData, // Send as FormData, not JSON
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server error response:", errorText)

        let errorMessage = "Server error occurred"
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorData.details || `Server error: ${response.status}`
        } catch (parseError) {
          console.error("Error parsing error response:", parseError)
          errorMessage = `Server error (${response.status}): ${errorText.substring(0, 100)}`
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()

      toast({
        title: "Resume saved!",
        description: "Your baseline resume has been saved successfully.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error uploading resume:", error)
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "There was a problem saving your resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Function to handle file upload and extraction
  const handleFileUpload = async (file: File) => {
    if (!file) return

    try {
      setUploadedFile(file)
      setIsProcessing(true)
      setFileStatus("processing")
      setErrorDetails("")
      setProcessingProgress(10) // Start progress

      // Log file details for debugging
      console.log("Processing file:", {
        name: file.name,
        type: file.type || "unknown",
        size: `${(file.size / 1024).toFixed(2)} KB`,
      })

      const fileName = file.name.toLowerCase()

      // Check if file is a supported type
      const isPdf = file.type === "application/pdf" || fileName.endsWith(".pdf")
      const isDocx =
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileName.endsWith(".docx")
      const isTxt = file.type === "text/plain" || fileName.endsWith(".txt")
      const isDoc = file.type === "application/msword" || fileName.endsWith(".doc")

      if (isDoc) {
        setFileStatus("error")
        setErrorDetails(
          "DOC format is not supported. Please convert your file to DOCX or PDF format for better compatibility.",
        )
        setProcessingProgress(100)
        setIsProcessing(false)

        toast({
          title: "DOC format not supported",
          description: "Please convert your file to DOCX or PDF format and try again.",
          variant: "destructive",
        })
        return
      }

      if (!isPdf && !isDocx && !isTxt) {
        setFileStatus("error")
        setErrorDetails("Unsupported file type. Please upload a PDF, DOCX, or text file.")
        setProcessingProgress(100)
        setIsProcessing(false)

        toast({
          title: "Unsupported file type",
          description: "Please upload a PDF, DOCX, or text file.",
          variant: "destructive",
        })
        return
      }

      // For text files, we can read them directly in the browser
      if (isTxt) {
        try {
          const text = await file.text()
          setResumeContent(text)
          setFileStatus("success")
          setProcessingProgress(100)

          toast({
            title: "Text file processed",
            description: "Text has been extracted and added to the form.",
          })

          setIsProcessing(false)
          return
        } catch (error) {
          console.error("Error reading text file:", error)
          setErrorDetails("Failed to read text file")
          setFileStatus("error")
          setProcessingProgress(100)
          setIsProcessing(false)

          toast({
            title: "Error reading file",
            description: "Please try a different file or paste your resume text manually.",
            variant: "destructive",
          })
          return
        }
      }

      // For PDF and DOCX files, use our document extraction API
      if (isPdf || isDocx) {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setProcessingProgress((prev) => {
            const newProgress = prev + Math.random() * 5
            return newProgress < 90 ? newProgress : 90
          })
        }, 500)

        try {
          // Create a FormData object to send the file
          const formData = new FormData()
          formData.append("file", file)

          // Call our unified API route to extract text from the document
          const response = await fetch("/api/extract-document-text", {
            method: "POST",
            body: formData,
          })

          clearInterval(progressInterval)
          setProcessingProgress(95)

          // Get the response data
          let data
          try {
            data = await response.json()
          } catch (jsonError) {
            console.error("Error parsing JSON response:", jsonError)
            throw new Error("Invalid response from server")
          }

          if (!response.ok) {
            const errorMessage = data?.error || `Server error: ${response.status}`
            const errorDetails = data?.details || "Server error occurred"

            console.error("API error:", errorMessage, errorDetails)
            setFileStatus("error")
            setErrorDetails(errorDetails)
            setProcessingProgress(100)

            toast({
              title: "Processing failed",
              description: errorMessage,
              variant: "destructive",
            })

            setIsProcessing(false)
            return
          }

          setProcessingProgress(100)

          if (data.success && data.text) {
            // Update the form field with the extracted text
            setResumeContent(data.text)
            setFileStatus("success")

            let fileTypeLabel = "Document"
            if (isPdf) fileTypeLabel = "PDF"
            if (isDocx) fileTypeLabel = "DOCX"

            const extractionMethod = isPdf ? "with Gemini AI" : ""

            toast({
              title: `${fileTypeLabel} processed ${extractionMethod}`,
              description: "Text has been extracted and added to the form. Please review and edit if needed.",
            })
          } else {
            setFileStatus("error")
            setErrorDetails(data.details || "Could not extract text from this file")

            toast({
              title: "Text extraction failed",
              description: data.error || "Please try uploading a different file or enter your resume manually.",
              variant: "destructive",
            })
          }
        } catch (error) {
          clearInterval(progressInterval)
          setProcessingProgress(100)
          console.error("Extraction error:", error)
          setFileStatus("error")
          setErrorDetails(error instanceof Error ? error.message : "Unknown error occurred")

          toast({
            title: "Extraction error",
            description: "Please try uploading a different file or enter your resume manually.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      setProcessingProgress(100)
      console.error("Error processing file:", error)
      setFileStatus("error")
      setErrorDetails(error instanceof Error ? error.message : "Unknown error occurred")

      toast({
        title: "Processing failed",
        description: "Please try uploading a different file or enter your resume manually.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Function to handle pasting resume text directly
  const handlePasteResume = () => {
    // Check if we can access the clipboard
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard
        .readText()
        .then((text) => {
          if (text && text.length > 0) {
            setResumeContent(text)
            toast({
              title: "Text pasted",
              description: "Resume text has been pasted from clipboard.",
            })
          }
        })
        .catch((err) => {
          console.error("Clipboard read failed:", err)
          toast({
            title: "Clipboard access denied",
            description: "Please paste your resume text manually using Ctrl+V or Cmd+V.",
            variant: "destructive",
          })
        })
    } else {
      toast({
        title: "Clipboard access not supported",
        description: "Please paste your resume text manually using Ctrl+V or Cmd+V.",
      })
    }
  }

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to Job Application Assistant</CardTitle>
          <CardDescription>
            Let's get started by uploading your baseline resume. This will be used as a starting point for customizing
            resumes for specific job applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="resumeName">Resume Name</Label>
              <Input id="resumeName" value={resumeName} onChange={(e) => setResumeName(e.target.value)} />
              <p className="text-sm text-muted-foreground">This name will be used to identify your baseline resume</p>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertTitle>Upload Your Resume</AlertTitle>
              <AlertDescription>
                You can upload a PDF, DOCX, or text file and we'll extract the content automatically, or you can enter
                your resume text manually.
              </AlertDescription>
            </Alert>

            <div className="flex flex-wrap gap-2 mb-4">
              <Button type="button" variant="outline" size="sm" onClick={handlePasteResume}>
                <Clipboard className="mr-2 h-4 w-4" />
                Paste from Clipboard
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // Create a temporary file input element
                  const fileInput = document.createElement("input")
                  fileInput.type = "file"
                  fileInput.accept = ".pdf,.txt,.docx"
                  fileInput.style.display = "none"

                  // Add event listener for when a file is selected
                  fileInput.addEventListener("change", (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      // Process the selected file
                      handleFileUpload(file)
                    }
                    // Remove the temporary element
                    document.body.removeChild(fileInput)
                  })

                  // Add to DOM and trigger click
                  document.body.appendChild(fileInput)
                  fileInput.click()
                }}
              >
                <FileUp className="mr-2 h-4 w-4" />
                Upload Resume File
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resumeContent">Resume Content</Label>
              <p className="text-sm text-muted-foreground">
                {isProcessing ? "Processing your resume..." : "Enter your resume content by typing or pasting text"}
              </p>

              {isProcessing && fileStatus === "processing" ? (
                <div className="p-6 border rounded-md space-y-4">
                  <div className="flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Processing your resume...</span>
                  </div>
                  <Progress value={processingProgress} className="h-2" />
                </div>
              ) : (
                <Textarea
                  id="resumeContent"
                  placeholder="Paste your current resume content here or upload a file to extract text automatically..."
                  className="min-h-[300px] font-mono text-sm"
                  value={resumeContent}
                  onChange={(e) => setResumeContent(e.target.value)}
                />
              )}

              {fileStatus === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error processing file</AlertTitle>
                  <AlertDescription>
                    {errorDetails ||
                      "There was a problem processing your file. Please try a different file or enter your resume manually."}
                  </AlertDescription>
                </Alert>
              )}

              {uploadedFile && fileStatus === "success" && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>File Processed: {uploadedFile.name}</AlertTitle>
                  <AlertDescription>
                    Your resume has been processed successfully. Please review the extracted text and make any necessary
                    edits.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isUploading || isProcessing}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <FileUp className="mr-2 h-4 w-4" />
            Upload a PDF, DOCX, or text file and we'll extract the text automatically
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
