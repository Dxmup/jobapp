"use client"

import { Button, type ButtonProps } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActionButtonProps extends ButtonProps {
  icon: LucideIcon
  label: string
  description?: string
  onClick?: () => void
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "action"
}

export function ActionButton({
  icon: Icon,
  label,
  description,
  onClick,
  className,
  variant = "action",
  ...props
}: ActionButtonProps) {
  return (
    <Button
      variant={variant === "action" ? "outline" : variant}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center h-auto py-4 px-4 space-y-2 text-center",
        variant === "action" && "border-dashed hover:border-solid hover:bg-accent",
        className,
      )}
      {...props}
    >
      <Icon className="h-6 w-6 mb-1" />
      <div className="space-y-1">
        <h3 className="font-medium text-sm">{label}</h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </Button>
  )
}
