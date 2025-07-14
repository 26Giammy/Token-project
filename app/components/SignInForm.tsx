"use client"

import type React from "react"
import { useState } from "react"
import { ArrowLeft, LogIn, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { signIn } from "@/app/actions"

interface SignInFormProps {
  onSignInSuccess: () => void
  onBack: () => void
  onSignUpClick: () => void
}

export default function SignInForm({ onSignInSuccess, onBack, onSignUpClick }: SignInFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await signIn(formData)
    setIsLoading(false)

    if (result.success) {
      toast.success(result.message)
      onSignInSuccess()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-6 flex items-center">
        <button onClick={onBack} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm mx-auto space-y-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center">
              <LogIn className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-800">Welcome back!</h1>
            <p className="text-gray-600">Sign in to access your rewards.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <input
                type="email"
                name="email"
                placeholder="Email address"
                className="w-full px-4 py-4 bg-white/70 border border-purple-100 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full px-4 py-4 bg-white/70 border border-purple-100 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-gray-600 text-center">
            Don't have an account?{" "}
            <button onClick={onSignUpClick} className="text-purple-600 hover:underline font-medium">
              Sign Up
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
