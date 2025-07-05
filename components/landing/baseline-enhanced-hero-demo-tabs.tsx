import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const BaselineEnhancedHeroDemoTabs = () => {
  return (
    <Tabs defaultValue="baseline" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="baseline">Baseline</TabsTrigger>
        <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
      </TabsList>
      <TabsContent value="baseline">
        <img
          src="/placeholder-image.png" // Placeholder URL
          alt="Baseline Demo"
          className="rounded-md"
        />
      </TabsContent>
      <TabsContent value="enhanced">
        <img
          src="/placeholder-image.png" // Placeholder URL
          alt="Enhanced Demo"
          className="rounded-md"
        />
      </TabsContent>
    </Tabs>
  )
}

export default BaselineEnhancedHeroDemoTabs
