"use client"

import { useState } from "react"

export function QuickActionsMenu() {
  const [open, setOpen] = useState(false)
  const [activeDialog, setActiveDialog] = useState<"job" | "resume" | "coverLetter" | null>(null)

  const handleAction = (action: "job" | "resume" | "coverLetter") => {
    setOpen(false)
    setActiveDialog(action)
  }

  const closeDialog = () => {
    setActiveDialog(null)
  }

  return null
}
