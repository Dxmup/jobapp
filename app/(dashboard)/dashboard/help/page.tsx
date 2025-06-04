import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { BookOpen, HelpCircle, Mail, MessageSquare, Search, Video } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  const faqs = [
    {
      question: "How does the AI resume optimization work?",
      answer:
        "Our AI analyzes your existing resume and the job description to identify key skills and experiences that match the job requirements. It then restructures and enhances your resume to highlight these relevant qualifications, improving your chances of getting past applicant tracking systems (ATS) and catching the recruiter's attention.",
    },
    {
      question: "How many job applications can I create with the free plan?",
      answer:
        "The free plan allows you to create up to 3 job applications. Each application includes resume optimization and cover letter generation. To create more applications, you'll need to upgrade to our Pro or Enterprise plan.",
    },
    {
      question: "Can I download my optimized resumes and cover letters?",
      answer:
        "Yes, all users can download their generated documents in PDF format. The documents are also stored in your account until their expiration date based on your plan's retention period.",
    },
    {
      question: "How long are my documents stored?",
      answer:
        "Document retention depends on your plan: Free plan (7 days), Pro plan (30 days), and Enterprise plan (60 days). You can adjust these settings in your account preferences.",
    },
    {
      question: "Can I customize the AI-generated content?",
      answer:
        "After the AI generates your resume or cover letter, you can edit the content directly in our editor. You can make any changes you want before finalizing and downloading your documents.",
    },
    {
      question: "What if I'm not satisfied with the AI-generated content?",
      answer:
        "You can regenerate your resume or cover letter with different settings as many times as you need. You can also provide more specific instructions to guide the AI in creating content that better matches your expectations.",
    },
    {
      question: "How do I cancel my subscription?",
      answer:
        "You can cancel your subscription at any time from the Subscription page in your dashboard. Your access will continue until the end of your current billing period, after which you'll be downgraded to the Free plan.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we take data security very seriously. All your personal information and documents are encrypted and stored securely. We do not share your data with third parties without your consent. You can review our Privacy Policy for more details.",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">Find answers to common questions and get support for your account.</p>
      </div>
      <Separator />

      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Search for help articles..." className="pl-10 h-12 text-lg" />
      </div>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="guides">
            <BookOpen className="h-4 w-4 mr-2" />
            Guides
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Video className="h-4 w-4 mr-2" />
            Video Tutorials
          </TabsTrigger>
          <TabsTrigger value="contact">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Us
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find answers to the most common questions about JobCraft AI.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Guides</CardTitle>
              <CardDescription>Step-by-step guides to help you get the most out of JobCraft AI.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Getting Started Guide</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Learn how to set up your profile and create your first job application.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="#">Read Guide</Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Resume Optimization Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Learn how to get the best results from our AI resume optimization.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="#">Read Guide</Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Cover Letter Mastery</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Tips for creating compelling cover letters that stand out.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="#">Read Guide</Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Job Application Tracking</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      How to effectively track and manage your job applications.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="#">Read Guide</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
              <CardDescription>Watch step-by-step video tutorials to learn how to use JobCraft AI.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
                    <Video className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium">Getting Started with JobCraft AI</h3>
                  <p className="text-sm text-muted-foreground">
                    A complete walkthrough of the platform and its features.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
                    <Video className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium">AI Resume Optimization Tutorial</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn how to get the best results from our AI resume optimization.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
                    <Video className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium">Creating Perfect Cover Letters</h3>
                  <p className="text-sm text-muted-foreground">
                    Tips for creating compelling cover letters that stand out.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
                    <Video className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium">Job Application Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    How to use analytics to improve your job search strategy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Get in touch with our support team for personalized assistance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      Email Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Send us an email and we'll get back to you within 24 hours.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <a href="mailto:support@jobcraftai.com">Email Support</a>
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Live Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Chat with our support team during business hours (9am-5pm EST).
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Start Chat
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Send us a message</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="What can we help you with?" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Please describe your issue in detail..."
                  ></textarea>
                </div>
                <Button>Submit</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
