"use server"

import { Resend } from "resend"
import { supabase } from "@/lib/supabase" // Server-side Supabase client

const resend = new Resend(process.env.RESEND_API_KEY)
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"

// This action is no longer needed for the new flow, but keeping it as a placeholder
// if you still want to send custom emails for other purposes.
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
        emailRedirectTo: `${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/auth/callback`, // Important for email verification
      },
    })

    if (error) {
      console.error("Supabase sign up error:", error)
      return { success: false, message: error.message || "Failed to sign up. Please try again." }
    }

    if (data.user && !data.session) {
      // User signed up but email verification is required
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
