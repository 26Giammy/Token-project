"use server"

import { Resend } from "resend"
import { nanoid } from "nanoid"
import bcrypt from "bcrypt"

const resend = new Resend(process.env.RESEND_API_KEY)
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"

// In a real application, this would be a database or a more robust cache.
// For demonstration purposes, we'll use a simple in-memory store.
const otpStore: Record<string, { otpHash: string; expiresAt: number }> = {}

export async function sendVerificationEmail(email: string) {
  try {
    const otp = nanoid(6).toUpperCase() // Generate a 6-character OTP
    const hashedOtp = await bcrypt.hash(otp, 10) // Hash the OTP
    const expiresAt = Date.now() + 5 * 60 * 1000 // OTP valid for 5 minutes

    otpStore[email] = { otpHash: hashedOtp, expiresAt }
    console.log(`Generated OTP for ${email}: ${otp} (hashed: ${hashedOtp})`) // Log for debugging

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
  const storedOtpData = otpStore[email]

  if (!storedOtpData) {
    return { success: false, message: "No OTP found for this email or it has expired." }
  }

  if (Date.now() > storedOtpData.expiresAt) {
    delete otpStore[email] // Clear expired OTP
    return { success: false, message: "OTP has expired. Please request a new one." }
  }

  const isMatch = await bcrypt.compare(userOtp, storedOtpData.otpHash)

  if (isMatch) {
    delete otpStore[email] // OTP successfully used, remove it
    return { success: true, message: "OTP verified successfully!" }
  } else {
    return { success: false, message: "Invalid OTP. Please try again." }
  }
}
