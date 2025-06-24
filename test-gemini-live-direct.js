// Direct test of Gemini Live API without authentication
async function testGeminiLiveAPI() {
  console.log("🧪 Starting direct Gemini Live API test...\n")

  const testPayload = {
    text: "Hello, this is a direct test of the Gemini Live API.",
    voice: "Kore",
    tone: "conversational",
  }

  try {
    console.log("📤 Sending request to API...")
    console.log("Payload:", JSON.stringify(testPayload, null, 2))

    const response = await fetch("http://localhost:3000/api/interview/generate-real-audio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add any required headers here
      },
      body: JSON.stringify(testPayload),
    })

    console.log(`\n📊 Response Status: ${response.status} ${response.statusText}`)

    const responseData = await response.json()

    console.log("\n📥 Response Data:")
    console.log("Success:", responseData.success)
    console.log("Message:", responseData.message)

    if (responseData.error) {
      console.log("❌ Error:", responseData.error)
    }

    if (responseData.debug) {
      console.log("\n🔍 Debug Info:")
      console.log(JSON.stringify(responseData.debug, null, 2))
    }

    if (responseData.audioData) {
      console.log("\n🎵 Audio Info:")
      console.log("Audio size:", responseData.audioSize, "bytes")
      console.log("Voice used:", responseData.voice)
      console.log("Audio data length:", responseData.audioData.length, "characters")
      console.log("Audio data preview:", responseData.audioData.substring(0, 100) + "...")
    }

    if (responseData.details) {
      console.log("\n📋 Additional Details:")
      console.log(JSON.stringify(responseData.details, null, 2))
    }
  } catch (error) {
    console.error("❌ Test failed with error:")
    console.error(error.message)
    console.error("\nFull error:", error)
  }
}

// Run the test
testGeminiLiveAPI()
