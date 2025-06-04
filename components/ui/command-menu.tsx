"use client"

import * as React from "react"
import {
  Calculator,
  Calendar,
  User,
  FileText,
  Briefcase,
  PenTool,
  Search,
  BarChart,
  CheckCircle,
  Clock,
  Plus,
  Sparkles,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useRouter } from "next/navigation"

// Set to true to re-enable the command menu button
const SHOW_COMMAND_MENU_BUTTON = false

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const executeCommand = (path: string) => {
    setOpen(false)
    router.push(path)
  }

  return (
    <>
      {SHOW_COMMAND_MENU_BUTTON && (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 relative text-sm text-muted-foreground"
        >
          <Search className="mr-2 h-4 w-4" />
          <span className="hidden md:inline-flex">Search actions...</span>
          <span className="inline-flex md:hidden">Search</span>
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      )}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => executeCommand("/dashboard/jobs/new")}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Add New Job</span>
            </CommandItem>
            <CommandItem onSelect={() => executeCommand("/dashboard/build-resume")}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Create Resume</span>
            </CommandItem>
            <CommandItem onSelect={() => executeCommand("/dashboard/cover-letters/new")}>
              <PenTool className="mr-2 h-4 w-4" />
              <span>Write Cover Letter</span>
            </CommandItem>
            <CommandItem onSelect={() => executeCommand("/dashboard/customize-resume")}>
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Optimize Resume with AI</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => executeCommand("/dashboard")}>
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => executeCommand("/dashboard/jobs")}>
              <Briefcase className="mr-2 h-4 w-4" />
              <span>Jobs</span>
            </CommandItem>
            <CommandItem onSelect={() => executeCommand("/dashboard/resumes")}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Resumes</span>
            </CommandItem>
            <CommandItem onSelect={() => executeCommand("/dashboard/cover-letters")}>
              <PenTool className="mr-2 h-4 w-4" />
              <span>Cover Letters</span>
            </CommandItem>
            <CommandItem onSelect={() => executeCommand("/dashboard/analytics")}>
              <BarChart className="mr-2 h-4 w-4" />
              <span>Analytics</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Tools">
            <CommandItem onSelect={() => executeCommand("/dashboard/interview-prep")}>
              <User className="mr-2 h-4 w-4" />
              <span>Interview Preparation</span>
            </CommandItem>
            <CommandItem onSelect={() => executeCommand("/dashboard/salary-calculator")}>
              <Calculator className="mr-2 h-4 w-4" />
              <span>Salary Calculator</span>
            </CommandItem>
            <CommandItem onSelect={() => executeCommand("/dashboard/upcoming")}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Upcoming Events</span>
            </CommandItem>
            <CommandItem onSelect={() => executeCommand("/dashboard/recent-activity")}>
              <Clock className="mr-2 h-4 w-4" />
              <span>Recent Activity</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
