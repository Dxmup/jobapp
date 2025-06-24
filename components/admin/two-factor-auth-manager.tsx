"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QRCodeSVG } from "qrcode.react"
import { Copy, AlertCircle, CheckCircle2 } from "lucide-react"

export function TwoFactorAuthManager() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [setupData, setSetupData] = useState<{
    secret: string
    otpAuthUrl: string
    backupCodes: string[]
  } | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("setup")

  useEffect(() => {
    // Check if 2FA is already enabled
    fetch("/api/admin/2fa/status")
      .then((res) => res.json())
      .then((data) => {
        setIsEnabled(data.enabled)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Error checking 2FA status:", err)
        setIsLoading(false)
      })
  }, [])

  const handleSetup = async () => {
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/admin/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || "Failed to set up two-factor authentication")
        return
      }

      setSetupData({
        secret: data.secret,
        otpAuthUrl: data.otpAuthUrl,
        backupCodes: data.backupCodes,
      })

      setActiveTab("verify")
      setSuccess("Two-factor authentication setup initiated. Please verify with your authenticator app.")
    } catch (err) {
      setError("An error occurred while setting up two-factor authentication")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async () => {
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/admin/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationCode }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || "Invalid verification code")
        return
      }

      setIsEnabled(true)
      setActiveTab("manage")
      setSuccess("Two-factor authentication has been enabled successfully")
    } catch (err) {
      setError("An error occurred while verifying the code")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisable = async () => {
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/admin/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || "Failed to disable two-factor authentication")
        return
      }

      setIsEnabled(false)
      setActiveTab("setup")
      setSuccess("Two-factor authentication has been disabled")
    } catch (err) {
      setError("An error occurred while disabling two-factor authentication")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerateBackupCodes = async () => {
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/admin/2fa/regenerate-backup-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || "Failed to regenerate backup codes")
        return
      }

      setSetupData((prev) => (prev ? { ...prev, backupCodes: data.backupCodes } : null))
      setSuccess("Backup codes have been regenerated")
    } catch (err) {
      setError("An error occurred while regenerating backup codes")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess("Copied to clipboard")
    setTimeout(() => setSuccess(""), 3000)
  }

  if (isLoading && !setupData) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>Enhance your account security by enabling two-factor authentication</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup" disabled={isEnabled}>
              Setup
            </TabsTrigger>
            <TabsTrigger value="verify" disabled={isEnabled || !setupData}>
              Verify
            </TabsTrigger>
            <TabsTrigger value="manage" disabled={!isEnabled}>
              Manage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <div className="space-y-4 py-4">
              <div className="text-sm">
                Two-factor authentication adds an extra layer of security to your account. Once enabled, you'll need to
                provide a verification code from your authenticator app in addition to your password when logging in.
              </div>

              <Button onClick={handleSetup} disabled={isLoading}>
                {isLoading ? "Setting up..." : "Set up two-factor authentication"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="verify">
            {setupData && (
              <div className="space-y-6 py-4">
                <div>
                  <h3 className="text-lg font-medium">1. Scan QR Code</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Scan this QR code with your authenticator app (like Google Authenticator, Authy, or Microsoft
                    Authenticator).
                  </p>
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <QRCodeSVG value={setupData.otpAuthUrl} size={200} />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">2. Manual Entry</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    If you can't scan the QR code, enter this code manually in your authenticator app:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 p-2 rounded text-sm font-mono flex-1">{setupData.secret}</code>
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(setupData.secret)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">3. Save Backup Codes</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Save these backup codes in a secure place. You can use them to log in if you lose access to your
                    authenticator app.
                  </p>
                  <div className="bg-gray-100 p-3 rounded">
                    <div className="grid grid-cols-2 gap-2">
                      {setupData.backupCodes.map((code, index) => (
                        <code key={index} className="font-mono text-sm">
                          {code}
                        </code>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => copyToClipboard(setupData.backupCodes.join("\n"))}
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copy all codes
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">4. Verify Setup</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Enter the verification code from your authenticator app to complete the setup:
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                    />
                    <Button onClick={handleVerify} disabled={verificationCode.length !== 6 || isLoading}>
                      {isLoading ? "Verifying..." : "Verify"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manage">
            <div className="space-y-6 py-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Two-factor authentication is enabled</AlertTitle>
                <AlertDescription>
                  Your account is protected with two-factor authentication. You'll need to provide a verification code
                  when logging in.
                </AlertDescription>
              </Alert>

              <div>
                <h3 className="text-lg font-medium">Backup Codes</h3>
                <p className="text-sm text-gray-500 mb-2">
                  You can regenerate your backup codes if needed. This will invalidate all previous backup codes.
                </p>
                <Button onClick={handleRegenerateBackupCodes} disabled={isLoading}>
                  {isLoading ? "Regenerating..." : "Regenerate backup codes"}
                </Button>

                {setupData?.backupCodes && (
                  <div className="mt-4 bg-gray-100 p-3 rounded">
                    <div className="grid grid-cols-2 gap-2">
                      {setupData.backupCodes.map((code, index) => (
                        <code key={index} className="font-mono text-sm">
                          {code}
                        </code>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => copyToClipboard(setupData.backupCodes.join("\n"))}
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copy all codes
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium">Disable Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Disabling two-factor authentication will remove this additional security layer from your account.
                </p>
                <Button variant="destructive" onClick={handleDisable} disabled={isLoading}>
                  {isLoading ? "Disabling..." : "Disable two-factor authentication"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
