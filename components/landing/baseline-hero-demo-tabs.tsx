import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const BaselineHeroDemoTabs = () => {
  return (
    <Tabs defaultValue="overview" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="pricing">Pricing</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p>This is the overview tab content. Replace this with relevant information.</p>
        <img src="https://via.placeholder.com/300x200" alt="Overview Placeholder" className="mt-4 rounded-md" />
      </TabsContent>
      <TabsContent value="features">
        <p>Explore the amazing features we offer. Replace this with relevant information.</p>
        <img src="https://via.placeholder.com/300x200" alt="Features Placeholder" className="mt-4 rounded-md" />
      </TabsContent>
      <TabsContent value="pricing">
        <p>Check out our competitive pricing plans. Replace this with relevant information.</p>
        <img src="https://via.placeholder.com/300x200" alt="Pricing Placeholder" className="mt-4 rounded-md" />
      </TabsContent>
    </Tabs>
  )
}

export default BaselineHeroDemoTabs
