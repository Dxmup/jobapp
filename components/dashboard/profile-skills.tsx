"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Plus, X } from "lucide-react"

export function ProfileSkills() {
  const [skills, setSkills] = useState([
    "React",
    "Next.js",
    "TypeScript",
    "JavaScript",
    "HTML",
    "CSS",
    "Tailwind CSS",
    "UI/UX Design",
    "Responsive Design",
    "Git",
  ])
  const [newSkill, setNewSkill] = useState("")
  const { toast } = useToast()

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newSkill.trim()) return

    if (skills.includes(newSkill.trim())) {
      toast({
        title: "Skill already exists",
        description: "This skill is already in your list.",
        variant: "destructive",
      })
      return
    }

    setSkills([...skills, newSkill.trim()])
    setNewSkill("")

    toast({
      title: "Skill added",
      description: `"${newSkill.trim()}" has been added to your skills.`,
    })
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))

    toast({
      title: "Skill removed",
      description: `"${skillToRemove}" has been removed from your skills.`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>Add your professional skills and technologies you're proficient with.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAddSkill} className="flex gap-2">
          <Input placeholder="Add a skill..." value={newSkill} onChange={(e) => setNewSkill(e.target.value)} />
          <Button type="submit" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1.5">
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {skill}</span>
              </button>
            </Badge>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          These skills will be used to optimize your resumes and cover letters for job applications.
        </p>
      </CardContent>
    </Card>
  )
}
