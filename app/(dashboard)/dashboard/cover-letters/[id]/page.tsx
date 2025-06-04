import { notFound } from "next/navigation"
import { getCoverLetterById } from "@/app/actions/cover-letter-actions"
import { CoverLetterEditor } from "@/components/cover-letters/cover-letter-editor"

export default async function CoverLetterPage({ params }: { params: { id: string } }) {
  const coverLetterId = params.id

  // Fetch the cover letter
  const result = await getCoverLetterById(coverLetterId)

  if (!result.success || !result.coverLetter) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <CoverLetterEditor coverLetter={result.coverLetter} />
    </div>
  )
}
