"use server"

import { Resend } from "resend"
import { supabase } from "@/lib/supabase" // Server-side Supabase client

const resend = new Resend(process.env.RESEND_API_KEY)
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"

export async function sendCustomEmail(toEmail: string, subject: string, htmlContent: string) {
  try {
    await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: toEmail,
      subject: subject,
      html: htmlContent,
    })
    return { success: true, message: "Email sent successfully!" }
  } catch (error) {
    console.error("Error sending custom email:", error)
    return { success: false, message: "Failed to send email." }
  }
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (password !== confirmPassword) {
    return { success: false, message: "Passwords do not match." }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/auth/callback`,
      },
    })

    if (error) {
      console.error("Supabase sign up error:", error)
      return { success: false, message: error.message || "Failed to sign up. Please try again." }
    }

    if (data.user) {
      // Create a profile entry for the new user
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({ id: data.user.id, email: data.user.email, points: 0 }) // Initialize points to 0

      if (profileError) {
        console.error("Supabase profile creation error:", profileError)
        // Optionally, you might want to delete the user from auth.users if profile creation fails
        return { success: false, message: "Account created, but failed to set up profile. Please contact support." }
      }
    }

    if (data.user && !data.session) {
      return { success: true, message: "Account created! Please check your email for a verification link." }
    }

    return { success: true, message: "Signed up successfully!" }
  } catch (error) {
    console.error("Unexpected error during sign up:", error)
    return { success: false, message: "An unexpected error occurred during sign up." }
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Supabase sign in error:", error)
      return { success: false, message: error.message || "Failed to sign in. Please check your credentials." }
    }

    return { success: true, message: "Signed in successfully!" }
  } catch (error) {
    console.error("Unexpected error during sign in:", error)
    return { success: false, message: "An unexpected error occurred during sign in." }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error)
      return { success: false, message: "Failed to sign out." }
    }
    return { success: true, message: "Signed out successfully." }
  } catch (error) {
    console.error("Unexpected error during sign out:", error)
    return { success: false, message: "An unexpected error occurred." }
  }
}

export async function getUserProfile() {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Error getting user:", userError)
      return { success: false, message: "User not authenticated.", profile: null, activity: [] }
    }

    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, points")
      .eq("id", user.id)
      .maybeSingle() // Changed from .single() to .maybeSingle()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return { success: false, message: "Failed to load user profile.", profile: null, activity: [] }
    }

    // If profile doesn't exist, create it
    if (!profile) {
      console.log("Profile not found for user, creating new profile...")
      const { data: newProfile, error: createProfileError } = await supabase
        .from("profiles")
        .insert({ id: user.id, email: user.email, points: 0 })
        .select("id, email, points")
        .single() // Use single here as we expect one new row

      if (createProfileError || !newProfile) {
        console.error("Error creating new profile:", createProfileError)
        return { success: false, message: "Failed to create user profile.", profile: null, activity: [] }
      }
      profile = newProfile
    }

    const { data: activity, error: activityError } = await supabase
      .from("point_transactions")
      .select("type, amount, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    if (activityError) {
      console.error("Error fetching point activity:", activityError)
      return { success: true, message: "Profile loaded, but failed to load activity.", profile, activity: [] }
    }

    return { success: true, message: "Profile and activity loaded.", profile, activity }
  } catch (error) {
    console.error("Unexpected error in getUserProfile:", error)
    return { success: false, message: "An unexpected error occurred.", profile: null, activity: [] }
  }
}

export async function addPoints(userId: string, amount: number, description: string) {
  try {
    const { data: currentProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", userId)
      .maybeSingle() // Changed to maybeSingle()

    if (fetchError || !currentProfile) {
      console.error("Error fetching current points for adding:", fetchError)
      return { success: false, message: "Failed to fetch current points." }
    }

    // Update user's points
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({ points: currentProfile.points + amount })
      .eq("id", userId)
      .select("points")
      .single() // This single() is fine as we are updating a specific row by ID

    if (updateError || !updatedProfile) {
      console.error("Error updating points:", updateError)
      return { success: false, message: "Failed to add points." }
    }

    // Record transaction
    const { error: transactionError } = await supabase
      .from("point_transactions")
      .insert({ user_id: userId, type: "earn", amount, description })

    if (transactionError) {
      console.error("Error recording point transaction:", transactionError)
      return { success: false, message: "Points added, but failed to record transaction." }
    }

    return { success: true, message: `${amount} points added!`, newPoints: updatedProfile.points }
  } catch (error) {
    console.error("Unexpected error in addPoints:", error)
    return { success: false, message: "An unexpected error occurred while adding points." }
  }
}

export async function redeemPoints(userId: string, amount: number, description: string) {
  try {
    const { data: currentProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", userId)
      .maybeSingle() // Changed to maybeSingle()

    if (fetchError || !currentProfile) {
      console.error("Error fetching current points for redemption:", fetchError)
      return { success: false, message: "Failed to fetch current points." }
    }

    if (currentProfile.points < amount) {
      return { success: false, message: "Not enough points to redeem this reward." }
    }

    // Update user's points
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({ points: currentProfile.points - amount })
      .eq("id", userId)
      .select("points")
      .single() // This single() is fine as we are updating a specific row by ID

    if (updateError || !updatedProfile) {
      console.error("Error updating points for redemption:", updateError)
      return { success: false, message: "Failed to redeem points." }
    }

    // Record transaction
    const { error: transactionError } = await supabase
      .from("point_transactions")
      .insert({ user_id: userId, type: "redeem", amount: -amount, description })

    if (transactionError) {
      console.error("Error recording redemption transaction:", transactionError)
      return { success: false, message: "Points redeemed, but failed to record transaction." }
    }

    return { success: true, message: `${amount} points redeemed!`, newPoints: updatedProfile.points }
  } catch (error) {
    console.error("Unexpected error in redeemPoints:", error)
    return { success: false, message: "An unexpected error occurred during point redemption." }
  }
}
