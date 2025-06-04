import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getUserIdentity } from "@/lib/user-identity"

// Common skills in tech jobs
const commonTechSkills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "HTML",
  "CSS",
  "Git",
  "Tailwind CSS",
  "Redux",
  "GraphQL",
  "REST API",
  "SQL",
  "NoSQL",
  "AWS",
  "Docker",
  "CI/CD",
  "Testing",
  "Agile",
  "Scrum",
  "Python",
  "Java",
  "C#",
  "PHP",
  "Ruby",
  "Go",
  "Swift",
  "Kotlin",
  "Angular",
  "Vue.js",
  "Express",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Firebase",
  "Serverless",
  "DevOps",
  "UX/UI",
  "Figma",
  "Sketch",
  "Adobe XD",
  "Photoshop",
  "Illustrator",
  "Responsive Design",
  "Accessibility",
  "SEO",
  "Performance Optimization",
  "Web Security",
  "Authentication",
  "Authorization",
  "OAuth",
  "JWT",
  "WebSockets",
  "Microservices",
  "Kubernetes",
  "Linux",
  "Bash",
  "Shell Scripting",
  "Webpack",
  "Babel",
  "ESLint",
  "Prettier",
  "Jest",
  "Cypress",
  "Selenium",
  "Mocha",
  "Chai",
  "Enzyme",
  "React Testing Library",
  "Storybook",
  "Redux Saga",
  "Redux Thunk",
  "MobX",
  "Zustand",
  "Recoil",
  "Jotai",
  "SWR",
  "React Query",
  "Apollo Client",
  "SASS/SCSS",
  "Less",
  "Styled Components",
  "Emotion",
  "Material UI",
  "Chakra UI",
  "Bootstrap",
  "Bulma",
  "Foundation",
]

export async function GET() {
  try {
    const user = await getUserIdentity()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const userId = user.id

    // Fetch job descriptions from user's jobs
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("description, title")
      .eq("user_id", userId)
      .not("description", "is", null)

    if (jobsError) {
      console.error("Error fetching job descriptions:", jobsError)
      return NextResponse.json({ error: "Failed to fetch job data" }, { status: 500 })
    }

    // If no job descriptions, return empty data
    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ skills: [], gapSkills: [] })
    }

    // Combine all job descriptions
    const allDescriptions = jobs.map((job) => `${job.title} ${job.description}`).join(" ")

    // Count occurrences of common skills in job descriptions
    const skillCounts = commonTechSkills.map((skill) => {
      const regex = new RegExp(`\\b${skill}\\b`, "gi")
      const matches = allDescriptions.match(regex)
      const count = matches ? matches.length : 0

      return {
        name: skill,
        count: count,
        importance: count,
      }
    })

    // Filter out skills with zero occurrences and sort by count
    const filteredSkills = skillCounts.filter((skill) => skill.count > 0).sort((a, b) => b.count - a.count)

    // Normalize counts to percentages (relative to the max count)
    const maxCount = Math.max(...filteredSkills.map((skill) => skill.count))
    const normalizedSkills = filteredSkills.map((skill) => ({
      ...skill,
      count: Math.round((skill.count / maxCount) * 100),
    }))

    // Take top 10 skills for the main list
    const topSkills = normalizedSkills.slice(0, 10)

    // Fetch user's resume content to identify skills gap
    const { data: resumes, error: resumesError } = await supabase
      .from("resumes")
      .select("content, text_content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)

    let resumeContent = ""
    if (!resumesError && resumes && resumes.length > 0) {
      // Use text_content if available, otherwise use content
      resumeContent = resumes[0].text_content || resumes[0].content || ""
    }

    // Identify skills that appear in job descriptions but not in resume
    // These are potential skill gaps
    const gapSkillsList = filteredSkills
      .filter((skill) => {
        // Check if skill is not in top 10 (to avoid redundancy)
        if (topSkills.some((topSkill) => topSkill.name === skill.name)) {
          return false
        }

        // Check if skill is not mentioned in resume
        const regex = new RegExp(`\\b${skill.name}\\b`, "gi")
        return !regex.test(resumeContent)
      })
      .slice(0, 5) // Take top 5 gap skills
      .map((skill) => ({
        name: skill.name,
        importance: skill.importance,
      }))

    // If we couldn't find enough gap skills, add some common ones based on job titles
    if (gapSkillsList.length < 5) {
      // Extract job titles and look for common role types
      const jobTitles = jobs.map((job) => job.title?.toLowerCase() || "").join(" ")

      const additionalGapSkills = []

      if (jobTitles.includes("frontend") || jobTitles.includes("front-end") || jobTitles.includes("front end")) {
        additionalGapSkills.push(
          { name: "Performance Optimization", importance: 8 },
          { name: "Accessibility (WCAG)", importance: 7 },
          { name: "Web Animation", importance: 6 },
        )
      }

      if (jobTitles.includes("backend") || jobTitles.includes("back-end") || jobTitles.includes("back end")) {
        additionalGapSkills.push(
          { name: "Microservices Architecture", importance: 8 },
          { name: "API Security", importance: 7 },
          { name: "Database Optimization", importance: 6 },
        )
      }

      if (jobTitles.includes("fullstack") || jobTitles.includes("full-stack") || jobTitles.includes("full stack")) {
        additionalGapSkills.push(
          { name: "CI/CD Pipelines", importance: 8 },
          { name: "Docker & Containerization", importance: 7 },
          { name: "Cloud Services (AWS/Azure/GCP)", importance: 6 },
        )
      }

      // Add testing-related skills as they're commonly needed
      additionalGapSkills.push(
        { name: "Testing (Jest, Cypress)", importance: 5 },
        { name: "Test-Driven Development", importance: 4 },
      )

      // Add any additional gap skills needed to reach 5 total
      const neededAdditional = 5 - gapSkillsList.length
      if (neededAdditional > 0) {
        gapSkillsList.push(...additionalGapSkills.slice(0, neededAdditional))
      }
    }

    // Calculate trend based on job posting dates (in a real app)
    // For now, we'll use a simple algorithm to assign trends
    const skillsWithTrends = topSkills.map((skill) => {
      // Assign trend based on skill importance
      // Higher importance skills are more likely to be trending up
      const trendValue = Math.random() * skill.count
      let trend: "up" | "down" | "stable"

      if (trendValue > 70) {
        trend = "up"
      } else if (trendValue < 30) {
        trend = "down"
      } else {
        trend = "stable"
      }

      return {
        name: skill.name,
        count: skill.count,
        trend,
      }
    })

    return NextResponse.json({
      skills: skillsWithTrends,
      gapSkills: gapSkillsList,
    })
  } catch (error) {
    console.error("Error in skills analysis API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
