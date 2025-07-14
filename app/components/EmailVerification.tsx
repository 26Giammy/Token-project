"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Mail, ArrowRight } from "lucide-react"
import { toast } from "sonner" // Import toast

import { sendVerificationEmail } from "@/app/actions" // Import the server action

interface EmailVerificationProps {
  onEmailSubmit: (email: string) => void
  onBack: () => void
}

export default function EmailVerification({ onEmailSubmit, onBack }: EmailVerificationProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    const result = await sendVerificationEmail(email) // Call the server action
    setIsLoading(false)

    if (result.success) {
      toast.success(result.message)
      onEmailSubmit(email)
    } else {
      toast.error(result.message)
    }
  }

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
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-800">What's your email?</h1>
            <p className="text-gray-600">We'll send you a verification code to get started</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to get your code"
                className="w-full px-4 py-4 bg-white/70 border border-purple-100 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!email || isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Send Code
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <p className="text-xs text-gray-500 text-center">We respect your privacy. Your email is secure with us.</p>
        </div>
      </main>
    </div>
  )
}
