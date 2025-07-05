import type React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DemoTab {
  label: string
  content: React.ReactNode
}

const EnhancedHeroDemoTabs: React.FC = () => {
  const demoTabs: DemoTab[] = [
    {
      label: "Tab 1",
      content: (
        <div>
          <p>Content for Tab 1. This is a placeholder.</p>
          <img src="/placeholder-image.png" alt="Placeholder 1" />
        </div>
      ),
    },
    {
      label: "Tab 2",
      content: (
        <div>
          <p>Content for Tab 2. This is another placeholder.</p>
          <img src="/placeholder-image.png" alt="Placeholder 2" />
        </div>
      ),
    },
    {
      label: "Tab 3",
      content: (
        <div>
          <p>Content for Tab 3. Yet another placeholder.</p>
          <img src="/placeholder-image.png" alt="Placeholder 3" />
        </div>
      ),
    },
  ]

  return (
    <Tabs defaultValue={demoTabs[0].label} className="w-[400px]">
      <TabsList>
        {demoTabs.map((tab) => (
          <TabsTrigger key={tab.label} value={tab.label}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {demoTabs.map((tab) => (
        <TabsContent key={tab.label} value={tab.label}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}

export default EnhancedHeroDemoTabs
