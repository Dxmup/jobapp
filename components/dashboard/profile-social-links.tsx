"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Github, Linkedin, Globe, Twitter } from "lucide-react"

export function ProfileSocialLinks() {
  const [links, setLinks] = useState({
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe",
    portfolio: "https://johndoe.com",
    twitter: "https://twitter.com/johndoe",
  })

  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Social links updated",
      description: "Your social links have been updated successfully.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Links</CardTitle>
        <CardDescription>Add your professional social media profiles and website links.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="linkedin" className="flex items-center gap-2">
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </Label>
          <Input
            id="linkedin"
            placeholder="https://linkedin.com/in/username"
            value={links.linkedin}
            onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="github" className="flex items-center gap-2">
            <Github className="h-4 w-4" />
            GitHub
          </Label>
          <Input
            id="github"
            placeholder="https://github.com/username"
            value={links.github}
            onChange={(e) => setLinks({ ...links, github: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="portfolio" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Portfolio Website
          </Label>
          <Input
            id="portfolio"
            placeholder="https://yourwebsite.com"
            value={links.portfolio}
            onChange={(e) => setLinks({ ...links, portfolio: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="twitter" className="flex items-center gap-2">
            <Twitter className="h-4 w-4" />
            Twitter
          </Label>
          <Input
            id="twitter"
            placeholder="https://twitter.com/username"
            value={links.twitter}
            onChange={(e) => setLinks({ ...links, twitter: e.target.value })}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Save Links</Button>
      </CardFooter>
    </Card>
  )
}
