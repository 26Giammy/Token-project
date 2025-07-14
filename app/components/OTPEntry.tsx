"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Shield, RotateCcw } from "lucide-react"
import { toast } from "sonner" // Import toast

import { sendVerificationEmail, verifyOtp } from "@/app/actions" // Import server actions

interface OTPEntryProps {
  email: string
  onVerify: () => void
  onBack: () => void
  onResend: () => void
}

export default function OTPEntry({ email, onVerify, onBack, onResend }: OTPEntryProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const code = otp.join("")
    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit code.")
      return
    }

    setIsLoading(true)
    const result = await verifyOtp(email, code) // Call the server action
    setIsLoading(false)

    if (result.success) {
      toast.success(result.message)
      onVerify()
    } else {
      toast.error(result.message)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    const result = await sendVerificationEmail(email)
    setIsResending(false)

    if (result.success) {
      toast.success("New verification code sent!")
      setOtp(["", "", "", "", "", ""]) // Clear OTP inputs
      inputRefs.current[0]?.focus() // Focus first input
    } else {
      toast.error("Failed to resend code. Please try again.")
    }
  }

  const isComplete = otp.every((digit) => digit !== "")

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 flex items-center">
        <button onClick={onBack} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm mx-auto space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-800">Enter verification code</h1>
            <p className="text-gray-600">
              We sent you a code to <span className="font-medium text-purple-600">{email}</span>
            </p>
          </div>

          {/* OTP Input */}
          <div className="space-y-6">
            <div className="flex gap-3 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold bg-white/70 border border-purple-100 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                />
              ))}
            </div>

            <button
              onClick={handleVerify}
              disabled={!isComplete || isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Verify & Access"
              )}
            </button>
          </div>

          {/* Resend */}
          <div className="text-center">
            <button
              onClick={handleResendCode}
              disabled={isResending}
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2 mx-auto transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <div className="w-4 h-4 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              Resend Code
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
