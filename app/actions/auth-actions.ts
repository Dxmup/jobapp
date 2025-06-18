"use server"

import { signIn, signUp, signOut } from "@/lib/auth"
import { STRIPE_PRICE_IDS } from "@/lib/stripe"
import { cookies } from "next/headers"

export async function login(values: { email?: string; password?: string }) {
  const email = values.email
  const password = values.password

  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required",
    }
  }

  console.log("[Action:login] Attempting signIn for:", email)
  const result = await signIn(email, password) // signIn from lib/auth.ts

  if (result.success && result.user && result.session) {
    console.log("[Action:login] signIn successful.")
    console.log("[Action:login] DB User ID:", result.user.id)
    console.log("[Action:login] Auth User ID (from session):", result.session.user.id)

    const cookieStore = cookies()
    // This cookie is for your app's logic, if still needed.
    // Middleware should primarily trust supabase.auth.getSession().
    cookieStore.set("authenticated", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
    })

    // Store the Supabase Auth ID. This is crucial for consistency.
    cookieStore.set("user_id", result.session.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
    })
    console.log(`[Action:login] Set 'authenticated' and 'user_id' (${result.session.user.id}) cookies.`)
  } else {
    console.error("[Action:login] signIn failed or did not return expected user/session. Error:", result.error)
  }
  return result
}

export async function createUserAndLogin(userData: {
  name: string
  email: string
  password: string
  selectedTier?: "free" | "pro" | "premium"
}) {
  try {
    const result = await signUp(userData.email, userData.password, userData.name)

    if (result.success && result.user && result.session) {
      // Ensure session exists
      const cookieStore = cookies()

      // Set auth cookies upon successful signup and login
      cookieStore.set("authenticated", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
        sameSite: "lax",
      })
      cookieStore.set("user_id", result.session.user.id, {
        // Use Auth ID from session
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
        sameSite: "lax",
      })
      console.log(`Signup action: Set 'authenticated' and 'user_id' (${result.session.user.id}) cookies.`)

      // Handle subscription tier selection
      if (userData.selectedTier && userData.selectedTier !== "free") {
        // Store the selected tier temporarily
        cookieStore.set("pending_subscription_tier", userData.selectedTier, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60, // 1 hour
          path: "/",
          sameSite: "lax",
        })

        // Create Stripe checkout session
        try {
          const priceId = userData.selectedTier === "pro" ? STRIPE_PRICE_IDS.PRO : STRIPE_PRICE_IDS.PREMIUM

          if (!priceId) {
            console.error("Price ID not found for tier:", userData.selectedTier)
            return {
              success: true, // Still true because user is created, but redirect for error
              user: result.user,
              session: result.session,
              redirectUrl: "/onboarding?subscription_error=true_price_id_missing",
            }
          }

          const checkoutResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SITE_URL}/api/stripe/create-checkout-session`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Cookie: cookieStore.toString(), // Pass all current cookies
              },
              body: JSON.stringify({
                priceId,
                returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding?subscription_success=true`,
              }),
            },
          )

          if (checkoutResponse.ok) {
            const { url } = await checkoutResponse.json()
            return {
              success: true,
              user: result.user,
              session: result.session,
              checkoutUrl: url,
            }
          } else {
            console.error("Failed to create checkout session, status:", checkoutResponse.status)
            const errorBody = await checkoutResponse.text()
            console.error("Error body:", errorBody)
            return {
              success: true, // User created, but checkout failed
              user: result.user,
              session: result.session,
              redirectUrl: "/onboarding?subscription_error=true_checkout_creation_failed",
            }
          }
        } catch (error) {
          console.error("Error creating checkout session:", error)
          return {
            success: true, // User created, but checkout failed
            user: result.user,
            session: result.session,
            redirectUrl: "/onboarding?subscription_error=true_checkout_exception",
          }
        }
      }

      console.log("Signup successful for", result.user.id, "redirecting to onboarding.")
      return {
        success: true,
        user: result.user,
        session: result.session,
        redirectUrl: "/onboarding",
      }
    }

    if (result.isRateLimited) {
      return {
        success: false,
        error: "Too many signup attempts. Please wait a minute before trying again.",
        isRateLimited: true,
      }
    }
    // Fallback if signup didn't proceed as expected but wasn't rate limited
    return { success: false, error: result.error || "Signup failed for an unknown reason." }
  } catch (error) {
    console.error("Outer Signup error catch:", error)
    const errorMessage = error instanceof Error ? error.message : "An error occurred during signup"
    const isRateLimited =
      errorMessage.includes("For security purposes") || errorMessage.includes("you can only request this after")

    return {
      success: false,
      error: isRateLimited
        ? "Too many signup attempts. Please wait a minute before trying again."
        : "An error occurred during signup. Please try again.",
      isRateLimited,
    }
  }
}

export async function logout() {
  console.log("[Action:logout] Attempting signOut.")
  const result = await signOut() // signOut from lib/auth.ts, handles Supabase session logout

  // Clear ALL custom authentication-related cookies
  const cookieStore = cookies()
  cookieStore.set("authenticated", "", { maxAge: 0, path: "/" })
  cookieStore.set("user_id", "", { maxAge: 0, path: "/" })
  cookieStore.set("has_baseline_resume", "", { maxAge: 0, path: "/" }) // If you use this
  cookieStore.set("is_admin", "", { maxAge: 0, path: "/" }) // If you use this
  cookieStore.set("pending_subscription_tier", "", { maxAge: 0, path: "/" })

  if (result.success) {
    console.log("[Action:logout] signOut successful from Supabase. Custom cookies cleared.")
  } else {
    console.error("[Action:logout] signOut from Supabase failed. Error:", result.error)
  }

  // Always redirect to login after logout attempt
  return {
    success: result.success, // Reflects Supabase signout status
    error: result.error,
    redirectUrl: "/login",
  }
}
