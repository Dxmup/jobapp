"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  ChevronRight,
  ChevronLeft,
  Save,
  AlertCircle,
  Info,
  Sparkles,
  Trash2,
  Plus,
  Loader2,
  Upload,
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { NewResumeForm } from "@/components/resumes/new-resume-form"

export default function BuildResumePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resumeData, setResumeData] = useState({
    name: "My Professional Resume",
    personalInfo: {
      fullName: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      summary: "",
    },
    experience: [
      {
        id: "exp-1",
        company: "",
        position: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
    ],
    education: [
      {
        id: "edu-1",
        institution: "",
        degree: "",
        field: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ],
    skills: [
      {
        id: "skill-1",
        name: "",
        level: "Intermediate",
      },
    ],
    certifications: [
      {
        id: "cert-1",
        name: "",
        issuer: "",
        date: "",
        description: "",
      },
    ],
    languages: [
      {
        id: "lang-1",
        name: "",
        proficiency: "Intermediate",
      },
    ],
  })

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const totalSteps = 6

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const updatePersonalInfo = (field: string, value: string) => {
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [field]: value,
      },
    })
  }

  const updateExperience = (index: number, field: string, value: string | boolean) => {
    const updatedExperience = [...resumeData.experience]
    updatedExperience[index] = {
      ...updatedExperience[index],
      [field]: value,
    }
    setResumeData({
      ...resumeData,
      experience: updatedExperience,
    })
  }

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        {
          id: `exp-${resumeData.experience.length + 1}`,
          company: "",
          position: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
        },
      ],
    })
  }

  const removeExperience = (index: number) => {
    if (resumeData.experience.length > 1) {
      const updatedExperience = [...resumeData.experience]
      updatedExperience.splice(index, 1)
      setResumeData({
        ...resumeData,
        experience: updatedExperience,
      })
    }
  }

  const updateEducation = (index: number, field: string, value: string) => {
    const updatedEducation = [...resumeData.education]
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value,
    }
    setResumeData({
      ...resumeData,
      education: updatedEducation,
    })
  }

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        {
          id: `edu-${resumeData.education.length + 1}`,
          institution: "",
          degree: "",
          field: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    })
  }

  const removeEducation = (index: number) => {
    if (resumeData.education.length > 1) {
      const updatedEducation = [...resumeData.education]
      updatedEducation.splice(index, 1)
      setResumeData({
        ...resumeData,
        education: updatedEducation,
      })
    }
  }

  const updateSkill = (index: number, field: string, value: string) => {
    const updatedSkills = [...resumeData.skills]
    updatedSkills[index] = {
      ...updatedSkills[index],
      [field]: value,
    }
    setResumeData({
      ...resumeData,
      skills: updatedSkills,
    })
  }

  const addSkill = () => {
    setResumeData({
      ...resumeData,
      skills: [
        ...resumeData.skills,
        {
          id: `skill-${resumeData.skills.length + 1}`,
          name: "",
          level: "Intermediate",
        },
      ],
    })
  }

  const removeSkill = (index: number) => {
    if (resumeData.skills.length > 1) {
      const updatedSkills = [...resumeData.skills]
      updatedSkills.splice(index, 1)
      setResumeData({
        ...resumeData,
        skills: updatedSkills,
      })
    }
  }

  const updateCertification = (index: number, field: string, value: string) => {
    const updatedCertifications = [...resumeData.certifications]
    updatedCertifications[index] = {
      ...updatedCertifications[index],
      [field]: value,
    }
    setResumeData({
      ...resumeData,
      certifications: updatedCertifications,
    })
  }

  const addCertification = () => {
    setResumeData({
      ...resumeData,
      certifications: [
        ...resumeData.certifications,
        {
          id: `cert-${resumeData.certifications.length + 1}`,
          name: "",
          issuer: "",
          date: "",
          description: "",
        },
      ],
    })
  }

  const removeCertification = (index: number) => {
    if (resumeData.certifications.length > 1) {
      const updatedCertifications = [...resumeData.certifications]
      updatedCertifications.splice(index, 1)
      setResumeData({
        ...resumeData,
        certifications: updatedCertifications,
      })
    }
  }

  const updateLanguage = (index: number, field: string, value: string) => {
    const updatedLanguages = [...resumeData.languages]
    updatedLanguages[index] = {
      ...updatedLanguages[index],
      [field]: value,
    }
    setResumeData({
      ...resumeData,
      languages: updatedLanguages,
    })
  }

  const addLanguage = () => {
    setResumeData({
      ...resumeData,
      languages: [
        ...resumeData.languages,
        {
          id: `lang-${resumeData.languages.length + 1}`,
          name: "",
          proficiency: "Intermediate",
        },
      ],
    })
  }

  const removeLanguage = (index: number) => {
    if (resumeData.languages.length > 1) {
      const updatedLanguages = [...resumeData.languages]
      updatedLanguages.splice(index, 1)
      setResumeData({
        ...resumeData,
        languages: updatedLanguages,
      })
    }
  }

  const formatResumeContent = () => {
    let content = ""

    // Personal Information
    content += `${resumeData.personalInfo.fullName}\n`
    content += `${resumeData.personalInfo.title}\n`
    content += `${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone} | ${resumeData.personalInfo.location}`
    if (resumeData.personalInfo.website) {
      content += ` | ${resumeData.personalInfo.website}`
    }
    content += "\n\n"

    // Summary
    if (resumeData.personalInfo.summary) {
      content += "SUMMARY\n"
      content += `${resumeData.personalInfo.summary}\n\n`
    }

    // Experience
    content += "EXPERIENCE\n"
    resumeData.experience.forEach((exp) => {
      if (exp.company && exp.position) {
        content += `${exp.position}, ${exp.company}`
        if (exp.location) content += `, ${exp.location}`
        content += "\n"

        const startDate = exp.startDate ? exp.startDate : "Present"
        const endDate = exp.current ? "Present" : exp.endDate
        content += `${startDate} - ${endDate}\n`

        if (exp.description) {
          content += `${exp.description}\n`
        }
        content += "\n"
      }
    })

    // Education
    content += "EDUCATION\n"
    resumeData.education.forEach((edu) => {
      if (edu.institution && edu.degree) {
        content += `${edu.degree}`
        if (edu.field) content += ` in ${edu.field}`
        content += `, ${edu.institution}`
        if (edu.location) content += `, ${edu.location}`
        content += "\n"

        if (edu.startDate || edu.endDate) {
          const startDate = edu.startDate ? edu.startDate : ""
          const endDate = edu.endDate ? edu.endDate : ""
          content += `${startDate} - ${endDate}\n`
        }

        if (edu.description) {
          content += `${edu.description}\n`
        }
        content += "\n"
      }
    })

    // Skills
    const skillsWithNames = resumeData.skills.filter((skill) => skill.name.trim() !== "")
    if (skillsWithNames.length > 0) {
      content += "SKILLS\n"
      content += skillsWithNames.map((skill) => skill.name).join(", ") + "\n\n"
    }

    // Certifications
    const certificationsWithNames = resumeData.certifications.filter((cert) => cert.name.trim() !== "")
    if (certificationsWithNames.length > 0) {
      content += "CERTIFICATIONS\n"
      certificationsWithNames.forEach((cert) => {
        content += `${cert.name}`
        if (cert.issuer) content += `, ${cert.issuer}`
        if (cert.date) content += ` (${cert.date})`
        content += "\n"
        if (cert.description) content += `${cert.description}\n`
      })
      content += "\n"
    }

    // Languages
    const languagesWithNames = resumeData.languages.filter((lang) => lang.name.trim() !== "")
    if (languagesWithNames.length > 0) {
      content += "LANGUAGES\n"
      content += languagesWithNames.map((lang) => `${lang.name} (${lang.proficiency})`).join(", ") + "\n"
    }

    return content
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Get the current user
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        throw new Error("You must be logged in to create a resume")
      }

      // Get the user ID from our users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", session.user.id)
        .single()

      if (userError || !userData) {
        throw new Error("Failed to get user information")
      }

      // Format the resume content
      const content = formatResumeContent()

      // Insert the resume
      const { data, error } = await supabase
        .from("resumes")
        .insert({
          user_id: userData.id,
          name: resumeData.name,
          file_name: "wizard-generated.txt",
          content: content,
          is_ai_generated: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) {
        throw new Error("Failed to create resume: " + error.message)
      }

      // Set success message in localStorage
      localStorage.setItem("resumeSuccess", "true")
      localStorage.setItem("resumeName", resumeData.name)
      localStorage.setItem("resumeSuccessType", "ats-optimized") // First condition

      // Show success toast
      toast({
        title: "✅ Success!",
        description: "Your resume is ready. ATS-optimized to help you get noticed by recruiters!",
        duration: 4000, // 4 seconds
      })

      // Wait for toast to be visible before navigating
      setTimeout(() => {
        router.push("/dashboard/resumes")
      }, 4000)
    } catch (error) {
      console.error("Error creating resume:", error)
      setError(error instanceof Error ? error.message : "Failed to create resume")
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Personal Information</h2>
              <p className="text-muted-foreground">
                Start with your basic information that will appear at the top of your resume.
              </p>
            </div>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    placeholder="Senior Software Engineer"
                    value={resumeData.personalInfo.title}
                    onChange={(e) => updatePersonalInfo("title", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => updatePersonalInfo("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="(123) 456-7890"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="New York, NY"
                    value={resumeData.personalInfo.location}
                    onChange={(e) => updatePersonalInfo("location", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website/LinkedIn (Optional)</Label>
                  <Input
                    id="website"
                    placeholder="linkedin.com/in/johndoe"
                    value={resumeData.personalInfo.website}
                    onChange={(e) => updatePersonalInfo("website", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  placeholder="Experienced software engineer with 5+ years of experience in developing scalable web applications..."
                  className="min-h-[120px]"
                  value={resumeData.personalInfo.summary}
                  onChange={(e) => updatePersonalInfo("summary", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  A brief 2-4 sentence overview of your professional background and key strengths.
                </p>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Work Experience</h2>
              <p className="text-muted-foreground">
                Add your work experience, starting with your most recent position.
              </p>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertTitle>Why this matters</AlertTitle>
              <AlertDescription>
                Detailed work experience helps our AI create tailored resumes that highlight relevant experience for
                each job application.
              </AlertDescription>
            </Alert>

            {resumeData.experience.map((exp, index) => (
              <Card key={exp.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Position {index + 1}</CardTitle>
                    {resumeData.experience.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExperience(index)}
                        className="h-8 w-8 absolute top-2 right-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`company-${index}`}>Company</Label>
                      <Input
                        id={`company-${index}`}
                        placeholder="Acme Inc."
                        value={exp.company}
                        onChange={(e) => updateExperience(index, "company", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`position-${index}`}>Position</Label>
                      <Input
                        id={`position-${index}`}
                        placeholder="Senior Developer"
                        value={exp.position}
                        onChange={(e) => updateExperience(index, "position", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`location-${index}`}>Location (Optional)</Label>
                      <Input
                        id={`location-${index}`}
                        placeholder="New York, NY"
                        value={exp.location}
                        onChange={(e) => updateExperience(index, "location", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`current-${index}`}
                          checked={exp.current}
                          onChange={(e) => updateExperience(index, "current", e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor={`current-${index}`}>I currently work here</Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`startDate-${index}`}>Start Date</Label>
                      <Input
                        id={`startDate-${index}`}
                        placeholder="Jan 2020"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                      />
                    </div>
                    {!exp.current && (
                      <div className="space-y-2">
                        <Label htmlFor={`endDate-${index}`}>End Date</Label>
                        <Input
                          id={`endDate-${index}`}
                          placeholder="Dec 2022"
                          value={exp.endDate}
                          onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Textarea
                      id={`description-${index}`}
                      placeholder="• Developed and maintained web applications using React and Node.js
• Led a team of 5 developers to deliver projects on time and within budget
• Improved application performance by 40% through code optimization"
                      className="min-h-[150px] font-mono text-sm"
                      value={exp.description}
                      onChange={(e) => updateExperience(index, "description", e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Use bullet points to highlight your achievements and responsibilities. Be specific and quantify
                      results when possible.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" onClick={addExperience} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Another Position
            </Button>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Education</h2>
              <p className="text-muted-foreground">
                Add your educational background, starting with your highest degree.
              </p>
            </div>

            {resumeData.education.map((edu, index) => (
              <Card key={edu.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Education {index + 1}</CardTitle>
                    {resumeData.education.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEducation(index)}
                        className="h-8 w-8 absolute top-2 right-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`institution-${index}`}>Institution</Label>
                      <Input
                        id={`institution-${index}`}
                        placeholder="University of California, Berkeley"
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, "institution", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`location-${index}`}>Location (Optional)</Label>
                      <Input
                        id={`location-${index}`}
                        placeholder="Berkeley, CA"
                        value={edu.location}
                        onChange={(e) => updateEducation(index, "location", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`degree-${index}`}>Degree</Label>
                      <Input
                        id={`degree-${index}`}
                        placeholder="Bachelor of Science"
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, "degree", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`field-${index}`}>Field of Study</Label>
                      <Input
                        id={`field-${index}`}
                        placeholder="Computer Science"
                        value={edu.field}
                        onChange={(e) => updateEducation(index, "field", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`startDate-${index}`}>Start Date (Optional)</Label>
                      <Input
                        id={`startDate-${index}`}
                        placeholder="Aug 2016"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`endDate-${index}`}>End Date (Optional)</Label>
                      <Input
                        id={`endDate-${index}`}
                        placeholder="May 2020"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`description-${index}`}>Additional Information (Optional)</Label>
                    <Textarea
                      id={`description-${index}`}
                      placeholder="• GPA: 3.8/4.0
• Relevant coursework: Data Structures, Algorithms, Machine Learning
• Senior thesis: 'Implementing Neural Networks for Image Recognition'"
                      className="min-h-[100px]"
                      value={edu.description}
                      onChange={(e) => updateEducation(index, "description", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" onClick={addEducation} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Another Education
            </Button>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Skills</h2>
              <p className="text-muted-foreground">
                Add your technical and professional skills. These will help our AI match you with relevant jobs.
              </p>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertTitle>Why skills matter</AlertTitle>
              <AlertDescription>
                Adding a comprehensive list of your skills helps our AI tailor your resume to match job requirements and
                highlight relevant abilities.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Technical & Professional Skills</CardTitle>
                <CardDescription>
                  Include hard skills (programming languages, tools, methodologies) and soft skills (leadership,
                  communication).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {resumeData.skills.map((skill, index) => (
                  <div key={skill.id} className="flex items-center space-x-2">
                    <div className="flex-grow">
                      <Input
                        placeholder="e.g., JavaScript, Project Management, Data Analysis"
                        value={skill.name}
                        onChange={(e) => updateSkill(index, "name", e.target.value)}
                      />
                    </div>
                    <select
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={skill.level}
                      onChange={(e) => updateSkill(index, "level", e.target.value)}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                    {resumeData.skills.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeSkill(index)} className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addSkill} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Skill
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Certifications & Languages</h2>
              <p className="text-muted-foreground">Add any professional certifications and languages you know.</p>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Certifications</CardTitle>
                <CardDescription>Include relevant professional certifications and licenses.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {resumeData.certifications.map((cert, index) => (
                  <div key={cert.id} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`certName-${index}`}>Certification Name</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id={`certName-${index}`}
                            placeholder="AWS Certified Solutions Architect"
                            value={cert.name}
                            onChange={(e) => updateCertification(index, "name", e.target.value)}
                          />
                          {resumeData.certifications.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCertification(index)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`certIssuer-${index}`}>Issuing Organization</Label>
                        <Input
                          id={`certIssuer-${index}`}
                          placeholder="Amazon Web Services"
                          value={cert.issuer}
                          onChange={(e) => updateCertification(index, "issuer", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`certDate-${index}`}>Date (Optional)</Label>
                        <Input
                          id={`certDate-${index}`}
                          placeholder="May 2022"
                          value={cert.date}
                          onChange={(e) => updateCertification(index, "date", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`certDescription-${index}`}>Description (Optional)</Label>
                        <Input
                          id={`certDescription-${index}`}
                          placeholder="Professional level certification"
                          value={cert.description}
                          onChange={(e) => updateCertification(index, "description", e.target.value)}
                        />
                      </div>
                    </div>
                    {index < resumeData.certifications.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
                <Button variant="outline" onClick={addCertification} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Certification
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Languages</CardTitle>
                <CardDescription>List languages you speak and your proficiency level.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {resumeData.languages.map((lang, index) => (
                  <div key={lang.id} className="flex items-center space-x-2">
                    <div className="flex-grow">
                      <Input
                        placeholder="e.g., English, Spanish, Mandarin"
                        value={lang.name}
                        onChange={(e) => updateLanguage(index, "name", e.target.value)}
                      />
                    </div>
                    <select
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={lang.proficiency}
                      onChange={(e) => updateLanguage(index, "proficiency", e.target.value)}
                    >
                      <option value="Basic">Basic</option>
                      <option value="Conversational">Conversational</option>
                      <option value="Proficient">Proficient</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Native">Native</option>
                    </select>
                    {resumeData.languages.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeLanguage(index)} className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addLanguage} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Language
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Review & Finalize</h2>
              <p className="text-muted-foreground">
                Review your resume information and make any final adjustments before creating your resume.
              </p>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <AlertTitle>AI-Powered Resume Tailoring</AlertTitle>
              <AlertDescription>
                Your comprehensive resume will be stored as your base resume. Our AI will automatically tailor it for
                each job application, highlighting the most relevant experience and skills.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resumeName">Resume Name</Label>
                <Input
                  id="resumeName"
                  value={resumeData.name}
                  onChange={(e) => setResumeData({ ...resumeData, name: e.target.value })}
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Resume Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[400px] overflow-y-auto border rounded-md p-4 font-mono text-sm whitespace-pre-wrap">
                    {formatResumeContent()}
                  </div>
                </CardContent>
              </Card>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="container max-w-4xl py-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Resume Builder</h1>
        <Button variant="outline" size="sm" onClick={() => setIsUploadDialogOpen(true)}>
          Upload Existing Resume
          <Upload className="ml-2 h-4 w-4" />
        </Button>
        <div className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-0 right-0 top-0 h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="grid gap-6">
        {renderStepContent()}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Resume...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Resume
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-[95vw] w-full sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Upload Your Resume</DialogTitle>
            <DialogDescription>Upload your existing resume to quickly get started.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-1">
            <NewResumeForm onClose={() => setIsUploadDialogOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
