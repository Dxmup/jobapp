import { signIn, getSession } from "@/lib/auth"

async function testAuthFlow() {
  console.log("🧪 Testing Authentication Flow...")

  try {
    // Test 1: Sign in with test credentials
    console.log("1. Testing sign in...")
    const result = await signIn("test@example.com", "testpassword")

    if (result.success) {
      console.log("✅ Sign in successful")
      console.log("   User ID:", result.user?.id)
      console.log("   Redirect URL:", result.redirectUrl)
    } else {
      console.log("❌ Sign in failed:", result.error)
      return false
    }

    // Test 2: Check session persistence
    console.log("2. Testing session persistence...")
    const session = await getSession()

    if (session) {
      console.log("✅ Session persisted successfully")
      console.log("   Session user ID:", session.user.id)
    } else {
      console.log("❌ Session not persisted")
      return false
    }

    // Test 3: Verify user data consistency
    if (result.user && session) {
      if (result.user.auth_id === session.user.id) {
        console.log("✅ User data consistent")
      } else {
        console.log("❌ User data inconsistent")
        console.log("   Result user auth_id:", result.user.auth_id)
        console.log("   Session user id:", session.user.id)
        return false
      }
    }

    console.log("🎉 All tests passed! Authentication flow is working correctly.")
    return true
  } catch (error) {
    console.error("❌ Test failed with error:", error)
    return false
  }
}

// Run the test
testAuthFlow().then((success) => {
  if (success) {
    console.log("✅ PROBLEM IS FIXED: Authentication flow working correctly")
  } else {
    console.log("❌ PROBLEM PERSISTS: Authentication flow still has issues")
  }
})
