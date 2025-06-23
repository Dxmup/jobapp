"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut, Settings, Search, Zap } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce"

export function EnhancedDashboardHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/")
  }

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const [jobsRes, resumesRes, coverLettersRes] = await Promise.all([
        fetch("/api/jobs"),
        fetch("/api/direct-resumes"),
        fetch("/api/cover-letters"),
      ])

      const [jobsData, resumesData, coverLettersData] = await Promise.all([
        jobsRes.ok ? jobsRes.json().catch(() => ({ jobs: [] })) : { jobs: [] },
        resumesRes.ok ? resumesRes.json().catch(() => ({ resumes: [] })) : { resumes: [] },
        coverLettersRes.ok ? coverLettersRes.json().catch(() => ({ coverLetters: [] })) : { coverLetters: [] },
      ])

      const jobs = Array.isArray(jobsData) ? jobsData : jobsData.jobs || jobsData.data || []
      const resumes = Array.isArray(resumesData) ? resumesData : resumesData.resumes || resumesData.data || []
      const coverLetters = Array.isArray(coverLettersData)
        ? coverLettersData
        : coverLettersData.coverLetters || coverLettersData.data || []

      const queryLower = query.toLowerCase()

      const filteredJobs = jobs.filter(
        (job: any) =>
          job.title?.toLowerCase().includes(queryLower) ||
          job.company?.toLowerCase().includes(queryLower) ||
          job.description?.toLowerCase().includes(queryLower),
      )

      const filteredResumes = resumes.filter(
        (resume: any) =>
          resume.name?.toLowerCase().includes(queryLower) ||
          resume.job_title?.toLowerCase().includes(queryLower) ||
          resume.content?.toLowerCase().includes(queryLower),
      )

      const filteredCoverLetters = coverLetters.filter(
        (letter: any) =>
          letter.name?.toLowerCase().includes(queryLower) ||
          letter.title?.toLowerCase().includes(queryLower) ||
          letter.content?.toLowerCase().includes(queryLower) ||
          letter.jobs?.company?.toLowerCase().includes(queryLower) ||
          letter.jobs?.title?.toLowerCase().includes(queryLower),
      )

      const results = [
        ...filteredJobs.slice(0, 3).map((job: any) => ({
          id: job.id,
          title: job.title,
          subtitle: job.company,
          type: "job",
          url: `/jobs/${job.id}`,
        })),
        ...filteredResumes.slice(0, 3).map((resume: any) => ({
          id: resume.id,
          title: resume.name,
          subtitle: resume.job_title || "Resume",
          type: "resume",
          url: `/dashboard/resumes/view/${resume.id}`,
        })),
        ...filteredCoverLetters.slice(0, 3).map((letter: any) => ({
          id: letter.id,
          title: letter.name || letter.title,
          subtitle: letter.jobs?.company || "Cover Letter",
          type: "cover-letter",
          url: `/dashboard/cover-letters/${letter.id}`,
        })),
      ]

      setSearchResults(results)
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
      toast({
        title: "Search Error",
        description: "There was an error performing the search. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    if (debouncedSearchQuery) {
      performSearch(debouncedSearchQuery)
    } else {
      setSearchResults([])
    }
  }, [debouncedSearchQuery])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-slate-900/60 supports-[backdrop-filter]:via-purple-900/60 supports-[backdrop-filter]:to-slate-900/60">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-cyan-500/10 to-purple-600/10 opacity-50" />

      <div className="container relative flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen)
            }}
            className="inline-flex items-center justify-center rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            <span className="sr-only">Toggle menu</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center group">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent hidden md:inline-block group-hover:from-purple-300 group-hover:to-cyan-300 transition-all duration-300">
                JobCraft AI
              </span>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent md:hidden">
                JC
              </span>
            </div>
          </Link>
        </div>

        <div
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setTimeout(() => setIsSearchOpen(false), 150)
            }
          }}
        >
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <Input
                ref={searchInputRef}
                placeholder="Search jobs, resumes, or anything... (Ctrl+/)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-purple-400/50 transition-all duration-200"
              />

              {isSearchOpen && (searchQuery || searchResults.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 border border-white/10 rounded-lg shadow-xl backdrop-blur-xl z-50 max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-white/60">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="p-2">
                      {searchResults.map((result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => {
                            router.push(result.url)
                            setIsSearchOpen(false)
                            setSearchQuery("")
                          }}
                          className="w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                result.type === "job"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : result.type === "resume"
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-purple-500/20 text-purple-400"
                              }`}
                            >
                              {result.type === "job" ? "💼" : result.type === "resume" ? "📄" : "✉️"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-medium truncate group-hover:text-purple-200">
                                {result.title}
                              </div>
                              <div className="text-white/60 text-sm truncate">{result.subtitle}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : searchQuery && !isSearching ? (
                    <div className="p-4 text-center text-white/60">No results found for "{searchQuery}"</div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full hover:bg-white/10 transition-all duration-200"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-medium shadow-lg">
                  U
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-slate-900/95 border-white/10 backdrop-blur-xl"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-white">User</p>
                  <p className="text-xs leading-none text-white/60">user@example.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem asChild className="text-white/80 hover:text-white hover:bg-white/10">
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-white/80 hover:text-white hover:bg-white/10">
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-xl">
          <div className="p-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                <Input
                  placeholder="Search..."
                  className="w-full pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
            </div>

            <nav className="flex flex-col space-y-3">
              {[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/dashboard/jobs", label: "Job Applications" },
                { href: "/dashboard/resumes", label: "Resumes" },
                { href: "/dashboard/cover-letters", label: "Cover Letters" },
                { href: "/dashboard/subscription", label: "Subscription" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
