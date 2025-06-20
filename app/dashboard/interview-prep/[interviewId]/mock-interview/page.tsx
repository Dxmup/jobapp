import MockInterviewComponent from "./mock-interview"

export default function MockInterviewPage({ params }: { params: { interviewId: string } }) {
  const { interviewId } = params
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Mock Interview for ID: {interviewId}</h1>
      <MockInterviewComponent interviewId={interviewId} />
    </div>
  )
}
