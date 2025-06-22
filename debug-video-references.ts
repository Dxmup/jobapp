// This is a temporary debug file to help identify where the cover letter video might be referenced
// Let's search through the codebase for any references to cover letter videos

console.log("Searching for cover letter video references...")

// Check if there are any other components that might be using the cover letter video
const possibleReferences = [
  "/videos/cover-letter-demo.mp4",
  "/videos/cover-letter-demo.webm",
  "cover-letter-demo",
  "cover-letter-video",
  "cover letter video",
]

// This file is just for debugging - we'll remove it after finding the issue
export const debugVideoReferences = () => {
  console.log("Looking for video references in:", possibleReferences)
}
