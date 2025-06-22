"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface CoverLetter {
  id: string
  title: string
  company: string
  createdAt: string
}

export default function CoverLettersPage() {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    const fetchCoverLetters = async () => {
      setLoading(true)
      try {
        if (!session?.user?.email) {
          throw new Error("No user email found. Please sign in.")
        }
        const response = await fetch(`/api/cover-letters?email=${session.user.email}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setCoverLetters(data)
      } catch (error: any) {
        toast({
          title: "Error",
          description: `Error fetching cover letters: ${error.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCoverLetters()
  }, [session])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/cover-letters/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setCoverLetters((prevCoverLetters) => prevCoverLetters.filter((coverLetter) => coverLetter.id !== id))

      toast({
        title: "Success",
        description: "Cover letter deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Error deleting cover letter: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Cover Letters</h1>
        <Button onClick={() => router.push("/(dashboard)/dashboard/cover-letters/new")}>Create New</Button>
      </div>

      {coverLetters.length === 0 ? (
        <div>No cover letters found.</div>
      ) : (
        <Table>
          <TableCaption>A list of your cover letters.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coverLetters.map((coverLetter) => (
              <TableRow key={coverLetter.id}>
                <TableCell className="font-medium">{coverLetter.title}</TableCell>
                <TableCell>{coverLetter.company}</TableCell>
                <TableCell>{new Date(coverLetter.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/(dashboard)/dashboard/cover-letters/${coverLetter.id}`)}
                  >
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your cover letter from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(coverLetter.id)}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
