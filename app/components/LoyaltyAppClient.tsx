"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import LandingPage from "./LandingPage"
import SignUpForm from "./SignUpForm"
import SignInForm from "./SignInForm"
import Dashboard from "./Dashboard"
import AdminDashboard from "./AdminDashboard"
import { Toaster } from "@/components/ui/sonner"

type AuthState = "loading" | "landing" | "signup" | "signin" | "dashboard" | "admin-dashboard"

interface UserProfile {
  id: string
  email: string
  name: string
  points: number
  is_admin: boolean
}

export default function LoyaltyAppClient() {
  const [authState, setAuthState] = useState<AuthState>("loading")
  const [user, setUser] = useState<UserProfile | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setAuthState("landing")
      }
    })

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user.id)
      } else {
        setAuthState("landing")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
    if (error) {
      console.error("Errore nel recupero del profilo utente:", error.message)
      // Fallback se il profilo non è completo o non trovato
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        setUser({
          id: userData.user.id,
          email: userData.user.email || "N/A",
          name: userData.user.user_metadata?.name || userData.user.email || "Utente",
          points: 0,
          is_admin: false,
        })
        setAuthState("dashboard")
      } else {
        setAuthState("landing")
      }
    } else if (data) {
      setUser({
        id: data.id,
        email: data.email,
        name: data.name || data.email,
        points: data.points,
        is_admin: data.is_admin,
      })
      setAuthState(data.is_admin ? "admin-dashboard" : "dashboard")
    }
  }

  const handleSignOut = () => {
    setUser(null)
    setAuthState("landing")
  }

  const renderContent = () => {
    switch (authState) {
      case "loading":
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
            <div className="text-xl font-semibold text-gray-700">Caricamento...</div>
          </div>
        )
      case "landing":
        return <LandingPage onStartJourney={() => setAuthState("signup")} />
      case "signup":
        return (
          <SignUpForm
            onSignUpSuccess={() => setAuthState("dashboard")}
            onBack={() => setAuthState("landing")}
            onSignInClick={() => setAuthState("signin")}
          />
        )
      case "signin":
        return (
          <SignInForm
            onSignInSuccess={() => setAuthState("dashboard")}
            onBack={() => setAuthState("landing")}
            onSignUpClick={() => setAuthState("signup")}
          />
        )
      case "dashboard":
        return user ? <Dashboard user={user} onSignOut={handleSignOut} /> : null
      case "admin-dashboard":
        return user && user.is_admin ? <AdminDashboard onSignOut={handleSignOut} /> : null
      default:
        return <LandingPage onStartJourney={() => setAuthState("signup")} />
    }
  }

  return (
    <>
      {renderContent()}
      <Toaster />
    </>
  )
}
