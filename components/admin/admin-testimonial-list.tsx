"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, MoreHorizontal, Trash, ArrowUp, ArrowDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Testimonial {
  id: string
  quote: string
  author: string
  position?: string
  company?: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export function AdminTestimonialList() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/admin/testimonials")
      if (response.ok) {
        const data = await response.json()
        setTestimonials(data.testimonials)
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      toast({
        title: "Error",
        description: "Failed to fetch testimonials",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (response.ok) {
        fetchTestimonials()
        toast({
          title: "Success",
          description: `Testimonial ${!currentStatus ? "activated" : "deactivated"}`,
        })
      }
    } catch (error) {
      console.error("Error updating testimonial:", error)
      toast({
        title: "Error",
        description: "Failed to update testimonial",
        variant: "destructive",
      })
    }
  }

  const deleteTestimonial = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchTestimonials()
        toast({
          title: "Success",
          description: "Testimonial deleted successfully",
        })
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error)
      toast({
        title: "Error",
        description: "Failed to delete testimonial",
        variant: "destructive",
      })
    }
  }

  const moveTestimonial = async (id: string, direction: "up" | "down") => {
    const currentIndex = testimonials.findIndex((t) => t.id === id)
    if (currentIndex === -1) return

    const newOrder =
      direction === "up" ? testimonials[currentIndex].display_order - 1 : testimonials[currentIndex].display_order + 1

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_order: newOrder }),
      })

      if (response.ok) {
        fetchTestimonials()
        toast({
          title: "Success",
          description: "Testimonial order updated",
        })
      }
    } catch (error) {
      console.error("Error updating testimonial order:", error)
      toast({
        title: "Error",
        description: "Failed to update testimonial order",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div>Loading testimonials...</div>
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials.map((testimonial) => (
              <TableRow key={testimonial.id}>
                <TableCell>
                  <div className="max-w-md">
                    <div className="font-medium truncate">"{testimonial.quote.substring(0, 100)}..."</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{testimonial.author}</div>
                    {testimonial.position && (
                      <div className="text-sm text-muted-foreground">
                        {testimonial.position}
                        {testimonial.company && ` at ${testimonial.company}`}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={testimonial.is_active ? "default" : "secondary"}>
                    {testimonial.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{testimonial.display_order}</span>
                    <div className="flex flex-col">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveTestimonial(testimonial.id, "up")}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveTestimonial(testimonial.id, "down")}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{new Date(testimonial.updated_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" /> Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleActive(testimonial.id, testimonial.is_active)}>
                        {testimonial.is_active ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => deleteTestimonial(testimonial.id)}>
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
