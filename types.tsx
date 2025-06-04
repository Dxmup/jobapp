export type Job = {
  id: string
  userId: string
  title: string
  company: string
  location: string | null
  description: string | null
  status: string
  url: string | null
  createdAt: string
  updatedAt: string
  appliedAt: string | null
}
