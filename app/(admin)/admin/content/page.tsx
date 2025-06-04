import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { AdminTemplateList } from "@/components/admin/admin-template-list"
import { AdminPromptList } from "@/components/admin/admin-prompt-list"

export default function ContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
        <p className="text-muted-foreground">Manage templates, prompts, and system content.</p>
      </div>
      <Separator />

      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Resume Templates</TabsTrigger>
          <TabsTrigger value="cover-letters">Cover Letter Templates</TabsTrigger>
          <TabsTrigger value="prompts">AI Prompts</TabsTrigger>
          <TabsTrigger value="job-statuses">Job Statuses</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4 mt-6">
          <div className="flex justify-end">
            <Button>Add Template</Button>
          </div>
          <AdminTemplateList type="resume" />
        </TabsContent>

        <TabsContent value="cover-letters" className="space-y-4 mt-6">
          <div className="flex justify-end">
            <Button>Add Template</Button>
          </div>
          <AdminTemplateList type="cover-letter" />
        </TabsContent>

        <TabsContent value="prompts" className="space-y-4 mt-6">
          <div className="flex justify-end">
            <Button>Add Prompt</Button>
          </div>
          <AdminPromptList />
        </TabsContent>

        <TabsContent value="job-statuses" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Application Statuses</CardTitle>
              <CardDescription>Customize the available job application status options.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="font-medium">Drafting</div>
                    <p className="text-sm text-muted-foreground">Initial stage for new applications</p>
                  </Card>
                  <Card className="p-4">
                    <div className="font-medium">Applied</div>
                    <p className="text-sm text-muted-foreground">Application submitted</p>
                  </Card>
                  <Card className="p-4">
                    <div className="font-medium">Interviewing</div>
                    <p className="text-sm text-muted-foreground">In the interview process</p>
                  </Card>
                  <Card className="p-4">
                    <div className="font-medium">Offer</div>
                    <p className="text-sm text-muted-foreground">Received job offer</p>
                  </Card>
                  <Card className="p-4">
                    <div className="font-medium">Rejected</div>
                    <p className="text-sm text-muted-foreground">Application rejected</p>
                  </Card>
                  <Card className="p-4 border-dashed flex items-center justify-center">
                    <Button variant="ghost">+ Add Status</Button>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
