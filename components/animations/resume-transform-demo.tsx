"use client"

import { useState } from "react"
import { WordMorph } from "./word-morph"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, RotateCcw } from "lucide-react"

const DEMO_TRANSFORMATIONS = [
  {
    title: "Resume Bullet Point",
    from: "Worked on software projects and helped with team tasks",
    to: "Led cross-functional development team of 5 engineers, delivering 3 high-impact software solutions that increased user engagement by 40%",
  },
  {
    title: "Cover Letter Opening",
    from: "I am writing to apply for the position at your company",
    to: "Your recent expansion into AI-driven solutions aligns perfectly with my 5-year track record of implementing machine learning systems that drive measurable business growth",
  },
  {
    title: "Job Title Enhancement",
    from: "Customer Service Representative",
    to: "Client Success Specialist & Customer Experience Advocate",
  },
]

export function ResumeTransformDemo() {
  const [currentDemo, setCurrentDemo] = useState(0)
  const [key, setKey] = useState(0)

  const resetAnimation = () => {
    setKey((prev) => prev + 1)
  }

  const nextDemo = () => {
    setCurrentDemo((prev) => (prev + 1) % DEMO_TRANSFORMATIONS.length)
    setKey((prev) => prev + 1)
  }

  const demo = DEMO_TRANSFORMATIONS[currentDemo]

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Watch AI Transform Your Text
          </h3>
          <p className="text-muted-foreground">See how AI turns ordinary text into compelling, professional content</p>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h4 className="font-semibold text-lg mb-4">{demo.title}</h4>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Before:</label>
                <p className="text-gray-700 dark:text-gray-300 italic">{demo.from}</p>
              </div>

              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Transformation:</label>
                <div className="mt-2 p-4 bg-white dark:bg-gray-800 rounded border">
                  <WordMorph
                    key={key}
                    fromText={demo.from}
                    toText={demo.to}
                    duration={4000}
                    className="text-lg leading-relaxed"
                    highlightChanges={true}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={resetAnimation} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Replay
            </Button>
            <Button onClick={nextDemo}>Next Example</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
