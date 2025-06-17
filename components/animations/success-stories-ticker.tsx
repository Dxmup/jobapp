"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const successStories = [
  { name: "Sarah M.", role: "Software Engineer", company: "Google", avatar: "/professional-woman-diverse.png" },
  { name: "Mike R.", role: "Product Manager", company: "Meta", avatar: "/professional-man.png" },
  { name: "Lisa K.", role: "Data Scientist", company: "Netflix", avatar: "/professional-woman-data.png" },
  { name: "James L.", role: "UX Designer", company: "Apple", avatar: "/professional-designer.png" },
  { name: "Anna P.", role: "Marketing Dir.", company: "Spotify", avatar: "/professional-marketing-woman.png" },
  { name: "David C.", role: "DevOps Eng.", company: "Amazon", avatar: "/professional-devops-man.png" },
]

export function SuccessStoriesTicker() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 py-4 rounded-lg border">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
          🎉 Recent Hires
        </Badge>
        <span className="text-sm text-muted-foreground">People who got hired this week using JobCraft AI</span>
      </div>

      <motion.div
        className="flex gap-4"
        animate={{ x: [0, -100 * successStories.length] }}
        transition={{
          duration: 30,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        {[...successStories, ...successStories].map((story, index) => (
          <div
            key={index}
            className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm min-w-fit border"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={story.avatar || "/placeholder.svg"} alt={story.name} />
              <AvatarFallback>
                {story.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-medium">{story.name}</div>
              <div className="text-muted-foreground">
                {story.role} at {story.company}
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
