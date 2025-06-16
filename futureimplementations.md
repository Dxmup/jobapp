# Future Implementations

## Redis Rate Limiting Implementation

### Current State
We're using in-memory rate limiting for the landing page demo features:

\`\`\`typescript
// Current in-memory approach
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
\`\`\`

### Why Upgrade to Redis (Upstash)

#### Problems with Current Approach
- **Data Loss**: Rate limit data is lost on server restarts/deployments
- **Scaling Issues**: Doesn't work across multiple server instances
- **Memory Usage**: Accumulates data in server memory over time
- **Inconsistency**: Different servers may have different rate limit states

#### Benefits of Upstash Redis
- **Persistence**: Rate limit data survives deployments and restarts
- **Scalability**: Works across multiple server instances and regions
- **Automatic Expiration**: Built-in TTL (Time To Live) for cleanup
- **Global Consistency**: All servers share the same rate limit state
- **Serverless**: Pay-per-request, no server management
- **HTTP API**: Easy integration with Next.js serverless functions

### Implementation Plan

#### 1. Setup Upstash Redis
\`\`\`bash
# Install dependencies
npm install @upstash/redis @upstash/ratelimit
\`\`\`

#### 2. Environment Variables
\`\`\`env
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
\`\`\`

#### 3. Rate Limiting Service
\`\`\`typescript
// lib/rate-limit-redis.ts
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Landing page demo rate limiting (3 requests per 10 minutes)
export const landingDemoRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, '10 m'),
  analytics: true,
})

// General API rate limiting (100 requests per hour)
export const apiRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, '1 h'),
  analytics: true,
})
\`\`\`

#### 4. Usage in API Routes
\`\`\`typescript
// app/api/landing/optimize-resume/route.ts
import { landingDemoRateLimit } from '@/lib/rate-limit-redis'

export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success, limit, reset, remaining } = await landingDemoRateLimit.limit(ip)
  
  if (!success) {
    return NextResponse.json(
      { 
        error: "Too many requests. Please try again later.",
        limit,
        reset,
        remaining 
      }, 
      { status: 429 }
    )
  }
  
  // ... rest of the implementation
}
\`\`\`

### Migration Strategy
1. **Phase 1**: Keep current implementation for stability
2. **Phase 2**: Set up Upstash Redis in parallel
3. **Phase 3**: A/B test both implementations
4. **Phase 4**: Switch to Redis implementation
5. **Phase 5**: Remove in-memory fallback

### Cost Considerations
- **Upstash Free Tier**: 10,000 requests/month
- **Pay-as-you-go**: $0.2 per 100K requests after free tier
- **Expected Usage**: Landing page demos (~1000 requests/month)
- **Estimated Cost**: Free tier should cover initial usage

### Alternative: Vercel KV
Vercel KV is powered by Upstash but integrated with Vercel:
\`\`\`typescript
import { kv } from '@vercel/kv'

export const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(3, '10 m'),
})
\`\`\`

## Other Future Implementations

### 1. Advanced Resume Analysis
- Resume scoring system
- Industry-specific optimizations
- ATS compatibility checking
- Skills gap analysis

### 2. Enhanced Cover Letter Generation
- Company research integration
- Multiple template styles
- Tone adjustment (formal/casual)
- Industry-specific customization

### 3. Interview Preparation Enhancements
- Video mock interviews
- Industry-specific question banks
- Performance analytics
- Behavioral question practice

### 4. Analytics and Tracking
- User behavior analytics
- Conversion funnel analysis
- A/B testing framework
- Performance monitoring

### 5. Authentication Improvements
- Social login (Google, LinkedIn)
- Magic link authentication
- Two-factor authentication
- Session management improvements

### 6. Performance Optimizations
- Edge caching for static content
- Database query optimization
- Image optimization
- Bundle size reduction

### 7. Mobile App
- React Native implementation
- Offline functionality
- Push notifications
- Mobile-specific features

### 8. Integration Capabilities
- LinkedIn profile import
- Job board integrations
- Calendar synchronization
- Email automation

### 9. Premium Features
- Advanced AI models
- Priority processing
- Custom branding
- Team collaboration features

### 10. Compliance and Security
- GDPR compliance
- SOC 2 certification
- Data encryption at rest
- Audit logging
\`\`\`

Now let's add PDF upload capability to the resume optimization tab:

```typescriptreact file="components/landing/resume-optimization-tab.tsx"
[v0-no-op-code-block-prefix]"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Loader2, FileText, Sparkles } from 'lucide-react'
import { ResumeDiffViewer } from "./resume-diff-viewer"
import { useToast } from "@/hooks/use-toast"

interface ResumeOptimizationTabProps {
  onActionUsed: () => void
  isDisabled: boolean
}

export function ResumeOptimizationTab({ onActionUsed, isDisabled }: ResumeOptimizationTabProps) {
  const [resumeText, setResumeText] = useState("")
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationResult, setOptimizationResult] = useState<{
    originalResume: string
    optimizedResume: string
  } | null>(null)
  const { toast } = useToast()

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Support both text and PDF files
    if (!file.type.includes("text") && file.type !== "application/pdf" && !file.name.endsWith(".txt") && !file.name.endsWith(".pdf")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt or .pdf file, or paste your resume text directly.",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    try {
      if (file.type === "application/pdf") {
        // Handle PDF upload
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/extract-pdf-text", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Failed to extract text from PDF")
        }

        const data = await response.json()
        setResumeText(data.text || "")
        
        toast({
          title: "PDF uploaded successfully",
          description: "Text has been extracted from your PDF resume.",
        })
      } else {
        // Handle text file
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          setResumeText(content)
        }
        reader.readAsText(file)
      }
    } catch (error) {
      console.error("Error processing file:", error)
      toast({
        title: "Upload failed",
        description: "Failed to process the uploaded file. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  const handleOptimizeResume = async () => {
    if (!resumeText.trim()) {
      toast({
        title: "Resume required",
        description: "Please paste your resume text or upload a file.",
        variant: "destructive",
      })
      return
    }

    if (resumeText.length < 50) {
      toast({
        title: "Resume too short",
        description: "Please provide a more complete resume (at least 50 characters).",
        variant: "destructive",
      })
      return
    }

    setIsOptimizing(true)

    try {
      const response = await fetch("/api/landing/optimize-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeContent: resumeText,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to optimize resume")
      }

      setOptimizationResult({
        originalResume: data.originalResume,
        optimizedResume: data.optimizedResume,
      })

      onActionUsed() // Increment the usage counter

      toast({
        title: "Resume optimized!",
        description: "Your resume has been enhanced with professional improvements.",
      })
    } catch (error) {
      console.error("Error optimizing resume:", error)
      toast({
        title: "Optimization failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleReset = () => {
    setResumeText("")
    setOptimizationResult(null)
  }

  if (optimizationResult) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Resume Optimization Results
          </h3>
          <Button variant="outline" onClick={handleReset}>
            Try Another Resume
          </Button>
        </div>

        <ResumeDiffViewer
          originalResume={optimizationResult.originalResume}
          optimizedResume={optimizationResult.optimizedResume}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Resume Optimization Demo
        </h3>
        <p className="text-muted-foreground">
          See how AI can make your resume more professional and impactful with just a few improvements.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload or Paste Your Resume</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* File upload option */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Upload your resume (.txt or .pdf file)</p>
              <input
                type="file"
                accept=".txt,.pdf,text/plain,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-upload"
                disabled={isDisabled}
              />
              <Button variant="outline" asChild disabled={isDisabled}>
                <label htmlFor="resume-upload" className="cursor-pointer">
                  Choose File
                </label>
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">or</div>

            {/* Text area option */}
            <div className="space-y-2">
              <label htmlFor="resume-text" className="text-sm font-medium">
                Paste your resume text here:
              </label>
              <Textarea
                id="resume-text"
                placeholder="Paste your resume content here... (minimum 50 characters)"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                disabled={isDisabled}
              />
              <div className="text-xs text-muted-foreground text-right">{resumeText.length} characters</div>
            </div>
          </div>

          <Button
            onClick={handleOptimizeResume}
            disabled={isOptimizing || !resumeText.trim() || isDisabled}
            className="w-full"
            size="lg"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Optimizing Resume...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Optimize My Resume
              </>
            )}
          </Button>

          {isDisabled && (
            <p className="text-sm text-muted-foreground text-center">
              Demo limit reached. Sign up to continue optimizing resumes!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
