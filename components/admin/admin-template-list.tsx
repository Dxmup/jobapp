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
import { Edit, Eye, MoreHorizontal, Trash } from "lucide-react"

const resumeTemplates = [
  {
    id: "1",
    name: "Professional",
    description: "Clean and professional resume template for corporate roles",
    category: "General",
    status: "active",
    lastUpdated: "May 15, 2023",
    usageCount: 1245,
  },
  {
    id: "2",
    name: "Technical",
    description: "Resume template optimized for technical and engineering roles",
    category: "Technical",
    status: "active",
    lastUpdated: "Jun 22, 2023",
    usageCount: 876,
  },
  {
    id: "3",
    name: "Creative",
    description: "Visually appealing template for creative industry professionals",
    category: "Creative",
    status: "active",
    lastUpdated: "Apr 10, 2023",
    usageCount: 542,
  },
  {
    id: "4",
    name: "Executive",
    description: "Sophisticated template for senior management and executives",
    category: "Management",
    status: "active",
    lastUpdated: "Jul 5, 2023",
    usageCount: 328,
  },
  {
    id: "5",
    name: "Entry Level",
    description: "Simple template for students and recent graduates",
    category: "General",
    status: "active",
    lastUpdated: "Mar 18, 2023",
    usageCount: 1567,
  },
]

const coverLetterTemplates = [
  {
    id: "1",
    name: "Standard",
    description: "Professional cover letter template for most industries",
    category: "General",
    status: "active",
    lastUpdated: "May 20, 2023",
    usageCount: 987,
  },
  {
    id: "2",
    name: "Technical",
    description: "Cover letter template for technical and IT positions",
    category: "Technical",
    status: "active",
    lastUpdated: "Jun 15, 2023",
    usageCount: 654,
  },
  {
    id: "3",
    name: "Creative",
    description: "Engaging cover letter for creative roles",
    category: "Creative",
    status: "active",
    lastUpdated: "Apr 5, 2023",
    usageCount: 432,
  },
  {
    id: "4",
    name: "Career Change",
    description: "Template for professionals transitioning to a new field",
    category: "Specialized",
    status: "active",
    lastUpdated: "Jul 10, 2023",
    usageCount: 289,
  },
]

export function AdminTemplateList({ type }: { type: "resume" | "cover-letter" }) {
  const templates = type === "resume" ? resumeTemplates : coverLetterTemplates
  const title = type === "resume" ? "Resume" : "Cover Letter"

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{title} Template</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-muted-foreground">{template.description}</div>
                  </div>
                </TableCell>
                <TableCell>{template.category}</TableCell>
                <TableCell>
                  <Badge variant={template.status === "active" ? "default" : "secondary"}>{template.status}</Badge>
                </TableCell>
                <TableCell>{template.usageCount.toLocaleString()}</TableCell>
                <TableCell>{template.lastUpdated}</TableCell>
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
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
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
