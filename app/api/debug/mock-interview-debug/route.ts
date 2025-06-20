import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test basic functionality
    const testData = {
      job: { id: "test", title: "Test Job", company: "Test Company" },
      resume: { id: "test", name: "Test Resume" },
      questions: { technical: ["Test question"], behavioral: ["Test behavioral"] },
    }

    return NextResponse.json({
      success: true,
      message: "Mock interview debug endpoint working",
      testData,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
