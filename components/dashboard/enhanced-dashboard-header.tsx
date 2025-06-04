"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Search, Menu, X, User, LogOut, Settings, Command, Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export function EnhancedDashboardHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Handle keyboard shortcut for command palette
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault()
      setIsCommandOpen((open) => !open)
    }
  }

  // Add event listener for keyboard shortcut
  useState(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  })

  const handleLogout = () => {
    // This would be replaced with actual Supabase logout
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/")
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/20"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              <span className="sr-only">{isMobileMenuOpen ? "Close menu" : "Open menu"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent hidden md:inline-block">
                JobCraft AI
              </span>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent md:hidden">
                JC
              </span>
            </Link>
          </div>

          {/* Search bar - visible on desktop */}
          <div className="hidden md:flex max-w-md w-full mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <button
                onClick={() => setIsCommandOpen(true)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm text-muted-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer hover:bg-accent/50 transition-colors"
              >
                Search or use commands...
                <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Actions Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex gap-1">
                  <Plus className="h-4 w-4" />
                  <span>New</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/jobs/new">
                      <Plus className="mr-2 h-4 w-4" />
                      <span>New Job Application</span>
                      <DropdownMenuShortcut>⌘J</DropdownMenuShortcut>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/resumes/new">
                      <Plus className="mr-2 h-4 w-4" />
                      <span>New Resume</span>
                      <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/cover-letters/new">
                      <Plus className="mr-2 h-4 w-4" />
                      <span>New Cover Letter</span>
                      <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative" aria-label="Notifications">
                  <Bell size={18} />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-purple-600 text-[10px] font-medium text-white flex items-center justify-center">
                    3
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notifications
                  <Badge variant="outline" className="ml-auto">
                    3 new
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                  <div className="p-3 border-l-2 border-purple-600 bg-accent/50 mb-1">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm">Interview Scheduled</p>
                      <span className="text-xs text-muted-foreground">Just now</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your interview with TechCorp has been scheduled for May 15th at 2:00 PM.
                    </p>
                  </div>
                  <div className="p-3 border-l-2 border-purple-600 bg-accent/50 mb-1">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm">Resume Optimized</p>
                      <span className="text-xs text-muted-foreground">2 hours ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your resume for the Frontend Developer position has been optimized.
                    </p>
                  </div>
                  <div className="p-3 border-l-2 border-purple-600 bg-accent/50">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm">New Job Match</p>
                      <span className="text-xs text-muted-foreground">Yesterday</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      We found a new job that matches your profile: UX Designer at DesignHub.
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Button variant="ghost" size="sm" className="w-full justify-center text-xs">
                    View all notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="User menu">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 flex items-center justify-center text-white font-medium">
                    U
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">User</p>
                    <p className="text-xs leading-none text-muted-foreground">user@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                    <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                  <DropdownMenuShortcut>⌘L</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ModeToggle />
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t p-4">
            <div className="relative w-full mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <button
                onClick={() => {
                  setIsCommandOpen(true)
                  setIsMobileMenuOpen(false)
                }}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm text-muted-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
              >
                Search...
              </button>
            </div>
            <nav className="flex flex-col space-y-3">
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/jobs"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Job Applications
              </Link>
              <Link
                href="/dashboard/resumes"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Resumes
              </Link>
              <Link
                href="/dashboard/cover-letters"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Cover Letters
              </Link>
              <Link
                href="/dashboard/subscription"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Subscription
              </Link>
            </nav>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/dashboard/jobs/new" onClick={() => setIsMobileMenuOpen(false)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Job Application
                </Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Command palette */}
      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => {
                router.push("/dashboard")
                setIsCommandOpen(false)
              }}
            >
              <Command className="mr-2 h-4 w-4" />
              Dashboard
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                router.push("/dashboard/jobs")
                setIsCommandOpen(false)
              }}
            >
              <Command className="mr-2 h-4 w-4" />
              Job Applications
              <CommandShortcut>⌘J</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                router.push("/dashboard/resumes")
                setIsCommandOpen(false)
              }}
            >
              <Command className="mr-2 h-4 w-4" />
              Resumes
              <CommandShortcut>⌘R</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                router.push("/dashboard/cover-letters")
                setIsCommandOpen(false)
              }}
            >
              <Command className="mr-2 h-4 w-4" />
              Cover Letters
              <CommandShortcut>⌘C</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                router.push("/dashboard/jobs/new")
                setIsCommandOpen(false)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Job Application
            </CommandItem>
            <CommandItem
              onSelect={() => {
                router.push("/dashboard/resumes/new")
                setIsCommandOpen(false)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Resume
            </CommandItem>
            <CommandItem
              onSelect={() => {
                router.push("/dashboard/cover-letters/new")
                setIsCommandOpen(false)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Cover Letter
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
