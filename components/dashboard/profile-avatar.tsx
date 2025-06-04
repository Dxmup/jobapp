"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Camera, Loader2 } from "lucide-react"

export function ProfileAvatar() {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  // Mock user avatar
  const [avatar, setAvatar] = useState("/placeholder.svg?height=200&width=200")

  const handleAvatarUpload = () => {
    setIsUploading(true)

    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false)
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      })
    }, 1500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>Upload a profile picture to personalize your account.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-background mb-4">
          <img src={avatar || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">Recommended: Square image, at least 300x300px</p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={handleAvatarUpload} disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload New Picture"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
