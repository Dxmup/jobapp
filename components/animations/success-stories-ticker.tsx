"use client"

import { motion } from "framer-motion"

const successStories = [
  { name: "Sarah M.", role: "Software Engineer", company: "Google", story: "Landed dream job in 2 weeks" },
  { name: "Mike R.", role: "Product Manager", company: "Meta", story: "3x more interviews with AI resume" },
  { name: "Lisa K.", role: "Data Scientist", company: "Netflix", story: "Perfect cover letter every time" },
  { name: "David L.", role: "UX Designer", company: "Apple", story: "Aced technical interviews" },
  { name: "Emma T.", role: "Marketing Lead", company: "Spotify", story: "Doubled response rate" },
  { name: "James W.", role: "DevOps Engineer", company: "Amazon", story: "From 0 to 5 offers" },
]

export function SuccessStoriesTicker() {
  return (
    <div className="relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <div className="flex space-x-8">
        <motion.div
          className="flex space-x-8 min-w-max"
          animate={{ x: [0, -100 * successStories.length] }}
          transition={{
            duration: 30,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          {[...successStories, ...successStories].map((story, index) => (
            <div key={index} className="flex-shrink-0 w-80 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {story.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{story.name}</div>
                  <div className="text-slate-300 text-xs">
                    {story.role} at {story.company}
                  </div>
                </div>
              </div>
              <p className="text-white/90 text-sm italic">"{story.story}"</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
