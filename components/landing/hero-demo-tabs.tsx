import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const HeroDemoTabs = () => {
  return (
    <Tabs defaultValue="design" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="design">Design</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
        <TabsTrigger value="data">Data</TabsTrigger>
      </TabsList>
      <TabsContent value="design">
        <img src="https://via.placeholder.com/400x300?text=Design+Placeholder" alt="Design" className="rounded-md" />
      </TabsContent>
      <TabsContent value="code">
        <img src="https://via.placeholder.com/400x300?text=Code+Placeholder" alt="Code" className="rounded-md" />
      </TabsContent>
      <TabsContent value="data">
        <img src="https://via.placeholder.com/400x300?text=Data+Placeholder" alt="Data" className="rounded-md" />
      </TabsContent>
    </Tabs>
  )
}

export default HeroDemoTabs
