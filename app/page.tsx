"use client"

import { useState, useEffect } from "react"
import { Inter } from "next/font/google"
import LandingPage from "./components/LandingPage"
import SignUpForm from "./components/SignUpForm"
import SignInForm from "./components/SignInForm"
import Dashboard from "./components/Dashboard"
import AdminDashboard from "./components/AdminDashboard" // New import
import { getSupabaseClient } from "@/lib/supabase-client"
import { getUserProfile } from "./actions" // Import getUserProfile to check admin status
import { toast } from "sonner" // Declare toast variable

const inter = Inter({ subsets: ["latin"] })

export default function LoyaltyApp() {
  const [currentPage, setCurrentPage] = useState<"landing" | "signup" | "signin" | "dashboard" | "admin-dashboard">(
    "landing",
  )
  const [userName, setUserName] = useState("User")
  const [isAdmin, setIsAdmin] = useState(false) // New state for admin status

  useEffect(() => {
    const checkSessionAndProfile = async () => {
      const supabaseClient = getSupabaseClient()
      const {
        data: { session },
      } = await supabaseClient.auth.getSession()

      if (session) {
        const profileResult = await getUserProfile()
        if (profileResult.success && profileResult.profile) {
          setUserName(profileResult.profile.email?.split("@")[0] || "User")
          setIsAdmin(profileResult.profile.is_admin)
          setCurrentPage(profileResult.profile.is_admin ? "admin-dashboard" : "dashboard")
        } else {
          // If session exists but profile fails to load, log out
          await supabaseClient.auth.signOut()
          setCurrentPage("landing")
          toast.error("Failed to load user profile. Please sign in again.")
        }
      } else {
        setCurrentPage("landing")
      }
    }
    checkSessionAndProfile()

    const { data: authListener } = getSupabaseClient().auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const profileResult = await getUserProfile()
        if (profileResult.success && profileResult.profile) {
          setUserName(profileResult.profile.email?.split("@")[0] || "User")
          setIsAdmin(profileResult.profile.is_admin)
          setCurrentPage(profileResult.profile.is_admin ? "admin-dashboard" : "dashboard")
        } else {
          // Fallback if profile creation/fetch fails after sign-in
          await getSupabaseClient().auth.signOut()
          setCurrentPage("landing")
          toast.error("Failed to load user profile after sign-in. Please try again.")
        }
      } else if (event === "SIGNED_OUT") {
        setCurrentPage("landing")
        setIsAdmin(false) // Reset admin status on sign out
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const navigateToPage = (page: "landing" | "signup" | "signin" | "dashboard" | "admin-dashboard") => {
    setCurrentPage(page)
  }

  const handleSignUpSuccess = () => {
    navigateToPage("signin")
  }

  const handleSignInSuccess = async () => {
    // After successful sign-in, re-check profile to determine dashboard or admin-dashboard
    const profileResult = await getUserProfile()
    if (profileResult.success && profileResult.profile) {
      setUserName(profileResult.profile.email?.split("@")[0] || "User")
      setIsAdmin(profileResult.profile.is_admin)
      setCurrentPage(profileResult.profile.is_admin ? "admin-dashboard" : "dashboard")
    } else {
      // Should not happen often with maybeSingle fix, but as a fallback
      await getSupabaseClient().auth.signOut()
      setCurrentPage("landing")
      toast.error("Failed to load user profile after sign-in. Please try again.")
    }
  }

  const handleLogout = () => {
    setCurrentPage("landing")
    setIsAdmin(false)
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
      {currentPage === "dashboard" && <Dashboard userName={userName} onLogout={handleLogout} isAdmin={isAdmin} />}
      {currentPage === "admin-dashboard" && <AdminDashboard onLogout={handleLogout} />}
    </div>
  )
}
