"use client"

import { useState, useEffect } from "react"
import { Inter } from "next/font/google"
import LandingPage from "./components/LandingPage"
import SignUpForm from "./components/SignUpForm" // New import
import SignInForm from "./components/SignInForm" // New import
import Dashboard from "./components/Dashboard"
import { supabaseClient } from "@/lib/supabase-client"

const inter = Inter({ subsets: ["latin"] })

export default function LoyaltyApp() {
  const [currentPage, setCurrentPage] = useState<"landing" | "signup" | "signin" | "dashboard">("landing")
  const [userName, setUserName] = useState("User") // Default name, will be updated from session

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession()
      if (session) {
        setUserName(session.user.email?.split("@")[0] || "User")
        setCurrentPage("dashboard")
      }
    }
    checkSession()

    const { data: authListener } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setUserName(session.user.email?.split("@")[0] || "User")
        setCurrentPage("dashboard")
      } else if (event === "SIGNED_OUT") {
        setCurrentPage("landing")
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const navigateToPage = (page: "landing" | "signup" | "signin" | "dashboard") => {
    setCurrentPage(page)
  }

  const handleSignUpSuccess = () => {
    // After successful sign-up (and potential email verification),
    // the onAuthStateChange listener will handle navigation to dashboard.
    // For now, we can redirect to sign-in or show a message.
    navigateToPage("signin")
  }

  const handleSignInSuccess = () => {
    // onAuthStateChange listener will handle navigation to dashboard
    // after successful sign-in.
    navigateToPage("dashboard")
  }

  const handleLogout = () => {
    // signOut action will trigger onAuthStateChange to 'SIGNED_OUT'
    // which will then navigate to 'landing'
    setCurrentPage("landing")
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-page-gradient-start via-page-gradient-via to-page-gradient-end ${inter.className}`}
    >
      {currentPage === "landing" && <LandingPage onStart={() => navigateToPage("signup")} />}
      {currentPage === "signup" && (
        <SignUpForm
          onSignUpSuccess={handleSignUpSuccess}
          onBack={() => navigateToPage("landing")}
          onSignInClick={() => navigateToPage("signin")}
        />
      )}
      {currentPage === "signin" && (
        <SignInForm
          onSignInSuccess={handleSignInSuccess}
          onBack={() => navigateToPage("landing")}
          onSignUpClick={() => navigateToPage("signup")}
        />
      )}
      {currentPage === "dashboard" && <Dashboard userName={userName} onLogout={handleLogout} />}
    </div>
  )
}
