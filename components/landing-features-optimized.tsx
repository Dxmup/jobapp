import type React from "react"

interface FeatureItem {
  title: string
  description: string
  icon: string // URL or component for the icon
}

const featuresData: FeatureItem[] = [
  {
    title: "Feature 1",
    description: "Description of feature 1. This feature helps users do X and Y.",
    icon: "https://via.placeholder.com/50", // Placeholder URL
  },
  {
    title: "Feature 2",
    description: "Description of feature 2.  It provides a seamless experience for Z.",
    icon: "https://via.placeholder.com/50", // Placeholder URL
  },
  {
    title: "Feature 3",
    description: "Description of feature 3.  Enhance your workflow with A and B.",
    icon: "https://via.placeholder.com/50", // Placeholder URL
  },
]

const LandingFeaturesOptimized: React.FC = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-semibold mb-8">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => (
            <div key={index} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300">
              <div className="mb-4">
                <img src={feature.icon || "/placeholder.svg"} alt={feature.title} className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-700">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LandingFeaturesOptimized
