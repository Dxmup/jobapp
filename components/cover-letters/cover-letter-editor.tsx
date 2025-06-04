"use client"

import { CardFooter } from "@/components/ui/card"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Download, Save, Trash2, Briefcase } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { updateCoverLetter, deleteCoverLetter } from "@/app/actions/cover-letter-actions"
import { supabase } from "@/lib/supabase"

interface CoverLetterEditorProps {
  coverLetter: any
}

export function CoverLetterEditor({ coverLetter }: CoverLetterEditorProps) {
  // Clean the content by removing the cover letter name if it appears at the beginning
  const cleanContent = (content: string, name: string): string => {
    // Remove the name if it appears at the beginning of the content
    if (content.trim().startsWith(name.trim())) {
      return content.trim().substring(name.trim().length).trim()
    }

    // Also check for "Professional Cover Letter" or similar common titles
    const commonTitles = ["Professional Cover Letter", "Cover Letter", "My Cover Letter"]
    for (const title of commonTitles) {
      if (content.trim().startsWith(title)) {
        return content.trim().substring(title.length).trim()
      }
    }

    return content
  }

  const [name, setName] = useState(coverLetter.name)
  const [content, setContent] = useState(cleanContent(coverLetter.content, coverLetter.name))
  const [highlightedContent, setHighlightedContent] = useState("")
  const [isEditing, setIsEditing] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUsingCustomEditor, setIsUsingCustomEditor] = useState(true)
  const [jobDetails, setJobDetails] = useState<{ id: string; title: string; company: string } | null>(null)
  const [isLoadingJob, setIsLoadingJob] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (coverLetter.jobId) {
        setIsLoadingJob(true)
        try {
          const { data, error } = await supabase
            .from("jobs")
            .select("id, title, company")
            .eq("id", coverLetter.jobId)
            .single()

          if (!error && data) {
            setJobDetails(data)
          }
        } catch (error) {
          console.error("Error fetching job details:", error)
        } finally {
          setIsLoadingJob(false)
        }
      }
    }

    fetchJobDetails()
  }, [coverLetter.jobId])

  // Update highlighted content whenever content changes
  useEffect(() => {
    // Replace placeholders [text] with highlighted spans
    const highlighted = content.replace(
      /\[(.*?)\]/g,
      '<span class="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">[$1]</span>',
    )
    setHighlightedContent(highlighted)
  }, [content])

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and content cannot be empty",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const result = await updateCoverLetter({
        id: coverLetter.id,
        name,
        content,
      })

      if (result.success) {
        toast({
          title: "Cover letter updated",
          description: "Your changes have been saved successfully",
        })
        router.refresh()
      } else {
        throw new Error(result.error || "Failed to update cover letter")
      }
    } catch (error) {
      console.error("Error saving cover letter:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save changes",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const result = await deleteCoverLetter(coverLetter.id)

      if (result.success) {
        toast({
          title: "Cover letter deleted",
          description: "The cover letter has been deleted successfully",
        })
        router.push("/dashboard/cover-letters")
      } else {
        throw new Error(result.error || "Failed to delete cover letter")
      }
    } catch (error) {
      console.error("Error deleting cover letter:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete cover letter",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownload = async (format: "pdf" | "docx") => {
    try {
      if (format === "pdf") {
        // Import jspdf dynamically
        const { jsPDF } = await import("jspdf")
        const doc = new jsPDF()

        // Set font size to 12pt
        doc.setFontSize(12)

        // Add content to PDF with proper margins
        const margins = {
          top: 20,
          left: 20,
          right: 20,
          bottom: 20,
        }

        // Calculate available width for text
        const textWidth = doc.internal.pageSize.width - margins.left - margins.right

        // Split text to fit within margins
        const splitText = doc.splitTextToSize(content, textWidth)

        // Add text to document
        doc.text(splitText, margins.left, margins.top)

        // Save the PDF
        doc.save(`${name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`)
      } else {
        // Import docx dynamically
        const {
          Document,
          Packer,
          Paragraph,
          TextRun,
          HeadingLevel,
          AlignmentType,
          convertInchesToTwip,
          LevelFormat,
          LineRuleType,
        } = await import("docx")

        // Create document with 12pt font size
        const doc = new Document({
          styles: {
            default: {
              document: {
                run: {
                  size: 24, // 12pt = 24 half-points
                  font: "Times New Roman",
                },
                paragraph: {
                  spacing: {
                    line: 360, // Equivalent to 1.5 line spacing
                    lineRule: LineRuleType.AUTO,
                  },
                },
              },
            },
          },
          sections: [
            {
              properties: {
                page: {
                  margin: {
                    top: convertInchesToTwip(1),
                    right: convertInchesToTwip(1),
                    bottom: convertInchesToTwip(1),
                    left: convertInchesToTwip(1),
                  },
                },
              },
              children: content.split("\n").map(
                (line) =>
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: line,
                        size: 24, // 12pt = 24 half-points
                      }),
                    ],
                    spacing: {
                      after: 200, // Add some spacing between paragraphs
                    },
                  }),
              ),
            },
          ],
        })

        // Generate and save the document
        const blob = await Packer.toBlob(doc)
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.docx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

      toast({
        title: `Download started`,
        description: `Your cover letter is being downloaded as ${format.toUpperCase()}`,
      })
    } catch (error) {
      console.error(`Error downloading as ${format}:`, error)
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download cover letter",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  // Handle content changes from the custom editor
  const handleContentEditableChange = (e: React.FormEvent<HTMLDivElement>) => {
    // Get the plain text content without HTML
    const plainText = e.currentTarget.innerText
    setContent(plainText)
  }

  // Toggle between custom editor and plain textarea
  const toggleEditor = () => {
    setIsUsingCustomEditor(!isUsingCustomEditor)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/dashboard/cover-letters")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cover Letters
        </Button>
      </div>

      {coverLetter.jobId && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                  <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium">
                    {isLoadingJob ? "Loading job details..." : jobDetails?.title || "Associated Job"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{jobDetails?.company || ""}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push(`/jobs/${coverLetter.jobId}`)}>
                View Job
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Edit Cover Letter</h1>
          <p className="text-muted-foreground">
            {coverLetter.jobs?.title ? `For ${coverLetter.jobs.title} at ${coverLetter.jobs.company}` : ""}
          </p>
        </div>
        <div className="flex flex-col space-y-2 min-w-[200px]">
          <Button variant="outline" asChild>
            <Link href="/dashboard/cover-letters">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cover Letters
            </Link>
          </Button>
          <Button variant="outline" onClick={() => handleDownload("pdf")}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={() => handleDownload("docx")}>
            <Download className="mr-2 h-4 w-4" />
            Download DOCX
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-semibold"
              placeholder="Cover Letter Name"
            />
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p>{formatDate(coverLetter.created_at)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Last Updated</Label>
                <p>{formatDate(coverLetter.updated_at || coverLetter.created_at)}</p>
              </div>
            </div>

            <div className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="content">Content</Label>
                  <Button variant="ghost" size="sm" onClick={toggleEditor} className="text-xs">
                    {isUsingCustomEditor ? "Switch to Plain Editor" : "Switch to Highlighted Editor"}
                  </Button>
                </div>

                {isUsingCustomEditor ? (
                  <>
                    <div
                      className="min-h-[400px] font-mono text-sm p-3 border rounded-md bg-background focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-0 overflow-auto whitespace-pre-wrap"
                      contentEditable
                      suppressContentEditableWarning
                      onInput={handleContentEditableChange}
                      dangerouslySetInnerHTML={{ __html: highlightedContent }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Text in [brackets] is highlighted as placeholders you may want to update.
                    </p>
                  </>
                ) : (
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Cover Letter
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your cover letter.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
