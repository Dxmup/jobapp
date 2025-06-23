"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, User, Mail, Calendar, Settings, Bell, Shield, Trash2 } from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  created_at: string
  full_name?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
  })

  // Settings state
  const [settings, setSettings] = useState({
    language: "en-US",
    timezone: "America/Los_Angeles",
    darkMode: false,
    analytics: true,
    emailNotifications: true,
    documentExpiry: true,
    applicationStatus: true,
    aiCompletion: true,
    productUpdates: true,
    tips: false,
    resumeRetention: "30",
    coverLetterRetention: "30",
    jobAdRetention: "30",
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/user/profile")
      const data = await response.json()

      if (response.ok && data.profile) {
        setProfile(data.profile)
        setFormData({
          full_name: data.profile.full_name || data.profile.name || "",
          email: data.profile.email || "",
          phone: data.profile.phone || "",
          address: data.profile.address || "",
          city: data.profile.city || "",
          state: data.profile.state || "",
          zip_code: data.profile.zip_code || "",
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSettingChange = (field: string, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        })
        await fetchProfile()
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)
      // TODO: Implement settings save API
      toast({
        title: "Success",
        description: "Settings updated successfully!",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getUserInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return "U"
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile & Settings</h1>
        <p className="text-muted-foreground">Manage your account information, preferences, and settings.</p>
      </div>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/placeholder.svg" alt="Profile picture" />
              <AvatarFallback className="text-lg">
                {getUserInitials(profile?.name || null, profile?.email || null)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{profile?.name || "User"}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {profile?.email}
              </CardDescription>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Unknown"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter your street address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip_code">ZIP Code</Label>
                  <Input
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) => handleInputChange("zip_code", e.target.value)}
                    placeholder="ZIP Code"
                  />
                </div>
              </div>
            </CardContent>
            <CardContent className="pt-0">
              <Button onClick={handleSaveProfile} disabled={isSaving} className="min-w-[120px]">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General Preferences
              </CardTitle>
              <CardDescription>Configure your general account preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  value={settings.language}
                  onChange={(e) => handleSettingChange("language", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  value={settings.timezone}
                  onChange={(e) => handleSettingChange("timezone", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="UTC">UTC</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics">Usage Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow us to collect anonymous usage data to improve the application.
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={settings.analytics}
                  onCheckedChange={(checked) => handleSettingChange("analytics", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure how and when you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email.</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-medium">Application Updates</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Document Expiry Warnings</Label>
                    <p className="text-sm text-muted-foreground">Get notified when documents are about to expire.</p>
                  </div>
                  <Switch
                    checked={settings.documentExpiry}
                    onCheckedChange={(checked) => handleSettingChange("documentExpiry", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Application Status Changes</Label>
                    <p className="text-sm text-muted-foreground">Get notified when your application status changes.</p>
                  </div>
                  <Switch
                    checked={settings.applicationStatus}
                    onCheckedChange={(checked) => handleSettingChange("applicationStatus", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>AI Generation Completion</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when AI completes generating your documents.
                    </p>
                  </div>
                  <Switch
                    checked={settings.aiCompletion}
                    onCheckedChange={(checked) => handleSettingChange("aiCompletion", checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-medium">System Notifications</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Product Updates</Label>
                    <p className="text-sm text-muted-foreground">Get notified about new features and improvements.</p>
                  </div>
                  <Switch
                    checked={settings.productUpdates}
                    onCheckedChange={(checked) => handleSettingChange("productUpdates", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tips & Advice</Label>
                    <p className="text-sm text-muted-foreground">Receive job search tips and career advice.</p>
                  </div>
                  <Switch checked={settings.tips} onCheckedChange={(checked) => handleSettingChange("tips", checked)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Retention</CardTitle>
              <CardDescription>Configure how long your documents are stored before automatic deletion.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resume-retention">Resume Retention</Label>
                <select
                  id="resume-retention"
                  value={settings.resumeRetention}
                  onChange={(e) => handleSettingChange("resumeRetention", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="0">Never (Pro plan only)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover-letter-retention">Cover Letter Retention</Label>
                <select
                  id="cover-letter-retention"
                  value={settings.coverLetterRetention}
                  onChange={(e) => handleSettingChange("coverLetterRetention", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="0">Never (Pro plan only)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-ad-retention">Job Ad Retention</Label>
                <select
                  id="job-ad-retention"
                  value={settings.jobAdRetention}
                  onChange={(e) => handleSettingChange("jobAdRetention", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="0">Never (Pro plan only)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={isSaving} className="min-w-[120px]">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your account password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardContent className="pt-0">
              <Button>Update Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Enable two-factor authentication for your account.</p>
                </div>
                <Switch />
              </div>

              <p className="text-sm text-muted-foreground">
                Two-factor authentication adds an extra layer of security to your account by requiring more than just a
                password to sign in.
              </p>
            </CardContent>
            <CardContent className="pt-0">
              <Button variant="outline">Set Up Two-Factor Authentication</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Delete Account
              </CardTitle>
              <CardDescription>Permanently delete your account and all associated data.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. All of your data will be permanently deleted.
              </p>
              <Button variant="destructive">Delete Account</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
