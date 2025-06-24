import { AdminHeader } from "@/components/admin/admin-header"
import { AdminTestimonialList } from "@/components/admin/admin-testimonial-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function AdminTestimonialsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminHeader title="Testimonials" description="Manage testimonials displayed on login and signup pages" />
        <Link href="/admin/testimonials/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Testimonial
          </Button>
        </Link>
      </div>

      <AdminTestimonialList />
    </div>
  )
}
