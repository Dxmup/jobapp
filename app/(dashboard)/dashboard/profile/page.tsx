import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ProfileAvatar } from "@/components/dashboard/profile-avatar"
import { ProfileSkills } from "@/components/dashboard/profile-skills"
import { ProfileSocialLinks } from "@/components/dashboard/profile-social-links"

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and how it appears across the platform.
        </p>
      </div>
      <Separator />

      <div className="grid gap-6 md:grid-cols-[1fr_250px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input id="first-name" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input id="last-name" defaultValue="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john.doe@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" defaultValue="San Francisco, CA" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Summary</CardTitle>
              <CardDescription>Write a brief summary of your professional background and career goals.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[150px]"
                placeholder="Write your professional summary here..."
                defaultValue="Experienced Frontend Developer with 5+ years of experience building responsive and performant web applications. Specialized in React, Next.js, and modern JavaScript frameworks with a strong focus on accessibility and user experience."
              />
              <p className="text-xs text-muted-foreground mt-2">
                This summary will be used as a starting point for AI-generated cover letters.
              </p>
            </CardContent>
            <CardFooter>
              <Button>Save Summary</Button>
            </CardFooter>
          </Card>

          <ProfileSkills />
          <ProfileSocialLinks />
        </div>

        <div className="space-y-6">
          <ProfileAvatar />

          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Plan</span>
                <span className="text-sm">Free</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Member Since</span>
                <span className="text-sm">April 15, 2023</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Applications</span>
                <span className="text-sm">2/3 used</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Storage</span>
                <span className="text-sm">15MB/100MB</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 w-[15%]" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <a href="/dashboard/subscription">Upgrade Plan</a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
