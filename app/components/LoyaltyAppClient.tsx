"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import { LandingPage } from "./LandingPage"
import { Dashboard } from "./Dashboard"
import { AdminDashboard } from "./AdminDashboard"
import { getUserProfile } from "@/app/actions"
import { Loader2 } from "lucide-react"

interface User {
  id: string
  email: string
  name: string
  points: number
  is_admin: boolean
}

interface PointTransaction {
  type: string
  amount: number
  description: string
  created_at: string
}

export function LoyaltyAppClient() {
  const [user, setUser] = useState<User | null>(null)
  const [activity, setActivity] = useState<PointTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<"landing" | "dashboard" | "admin">("landing")

  useEffect(() => {
    const supabase = createClient()

    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const result = await getUserProfile()
          if (result.success && result.data) {
            setUser(result.data.profile)
            setActivity(result.data.activity || [])

            // Determine which view to show based on URL or user preference
            const path = window.location.pathname
            if (path === "/admin" && result.data.profile.is_admin) {
              setCurrentView("admin")
            } else if (session.user) {
              setCurrentView("dashboard")
            }
          }
        }
      } catch (error) {
        console.error("Error checking user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const result = await getUserProfile()
        if (result.success && result.data) {
          setUser(result.data.profile)
          setActivity(result.data.activity || [])
          setCurrentView("dashboard")
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setActivity([])
        setCurrentView("landing")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Handle view changes
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      if (path === "/admin" && user?.is_admin) {
        setCurrentView("admin")
      } else if (user) {
        setCurrentView("dashboard")
      } else {
        setCurrentView("landing")
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Caricamento applicazione...</p>
        </div>
      </div>
    )
  }

  if (currentView === "admin" && user?.is_admin) {
    return <AdminDashboard initialUser={user} />
  }

  if (currentView === "dashboard" && user) {
    return <Dashboard initialUser={user} initialActivity={activity} />
  }

  return <LandingPage />
}
