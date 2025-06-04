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

const prompts = [
  {
    id: "1",
    name: "Resume Customization",
    description: "Prompt for customizing resumes based on job descriptions",
    category: "Resume",
    status: "active",
    lastUpdated: "Jun 10, 2023",
    usageCount: 2345,
  },
  {
    id: "2",
    name: "Cover Letter Generation",
    description: "Prompt for generating cover letters based on resume and job description",
    category: "Cover Letter",
    status: "active",
    lastUpdated: "Jul 5, 2023",
    usageCount: 1876,
  },
  {
    id: "3",
    name: "Interview Question Generator",
    description: "Generates potential interview questions based on job description",
    category: "Interview",
    status: "active",
    lastUpdated: "May 22, 2023",
    usageCount: 1245,
  },
  {
    id: "4",
    name: "LinkedIn Profile Optimization",
    description: "Optimizes LinkedIn profiles based on career goals",
    category: "LinkedIn",
    status: "active",
    lastUpdated: "Apr 15, 2023",
    usageCount: 987,
  },
  {
    id: "5",
    name: "Salary Negotiation",
    description: "Provides guidance for salary negotiation",
    category: "Negotiation",
    status: "active",
    lastUpdated: "Jul 18, 2023",
    usageCount: 654,
  },
]

export function AdminPromptList() {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prompt</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prompts.map((prompt) => (
              <TableRow key={prompt.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{prompt.name}</div>
                    <div className="text-sm text-muted-foreground">{prompt.description}</div>
                  </div>
                </TableCell>
                <TableCell>{prompt.category}</TableCell>
                <TableCell>
                  <Badge variant={prompt.status === "active" ? "default" : "secondary"}>{prompt.status}</Badge>
                </TableCell>
                <TableCell>{prompt.usageCount.toLocaleString()}</TableCell>
                <TableCell>{prompt.lastUpdated}</TableCell>
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
                        <Eye className="mr-2 h-4 w-4" /> View
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
