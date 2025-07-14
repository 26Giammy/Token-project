"use server"

import { Resend } from "resend"
import { nanoid } from "nanoid"
import bcrypt from "bcrypt"
import { supabase } from "@/lib/supabase" // Import Supabase client

const resend = new Resend(process.env.RESEND_API_KEY)
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"

export async function sendVerificationEmail(email: string) {
  try {
    const otp = nanoid(6).toUpperCase() // Generate a 6-character OTP
    const hashedOtp = await bcrypt.hash(otp, 10) // Hash the OTP
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString() // OTP valid for 5 minutes, ISO string for Supabase

    // Store OTP in Supabase
    const { data, error } = await supabase
      .from("otps")
      .upsert({ email, otp_hash: hashedOtp, expires_at: expiresAt }, { onConflict: "email" })
      .select()

    if (error) {
      console.error("Supabase error storing OTP:", error)
      return { success: false, message: "Failed to store verification code. Please try again." }
    }

    await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: email,
      subject: "Your Loyalty App Verification Code",
      html: `<p>Your verification code is: <strong>${otp}</strong>. It is valid for 5 minutes.</p>`,
    })

    return { success: true, message: "Verification code sent successfully!" }
  } catch (error) {
    console.error("Error sending verification email:", error)
    return { success: false, message: "Failed to send verification code. Please try again." }
  }
}

export async function verifyOtp(email: string, userOtp: string) {
  try {
    // Retrieve OTP from Supabase
    const { data, error } = await supabase.from("otps").select("otp_hash, expires_at").eq("email", email).single()

    if (error || !data) {
      console.error("Supabase error retrieving OTP:", error)
      return { success: false, message: "No OTP found for this email or an error occurred." }
    }

    const { otp_hash, expires_at } = data

    if (Date.now() > new Date(expires_at).getTime()) {
      // Delete expired OTP from Supabase
      await supabase.from("otps").delete().eq("email", email)
      return { success: false, message: "OTP has expired. Please request a new one." }
    }

    const isMatch = await bcrypt.compare(userOtp, otp_hash)

    if (isMatch) {
      // OTP successfully used, delete it from Supabase
      await supabase.from("otps").delete().eq("email", email)
      return { success: true, message: "OTP verified successfully!" }
    } else {
      return { success: false, message: "Invalid OTP. Please try again." }
    }
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return { success: false, message: "An unexpected error occurred during OTP verification." }
  }
}
