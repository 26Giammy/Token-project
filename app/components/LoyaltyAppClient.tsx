"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import { Dashboard } from "./Dashboard"
import { AdminDashboard } from "./AdminDashboard"
import { LandingPage } from "./LandingPage"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getUserProfile } from "@/app/actions"

interface UserProfile {
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

export default function LoyaltyAppClient() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [activity, setActivity] = useState<PointTransaction[] | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      setLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        const profileResult = await getUserProfile()
        if (profileResult.success && profileResult.profile) {
          setUser(profileResult.profile)
          setActivity(profileResult.activity || [])
        } else {
          console.error("Errore nel recupero del profilo utente:", profileResult.message)
          await supabase.auth.signOut()
          setUser(null)
          setActivity(null)
          toast.error("Sessione non valida. Effettua nuovamente l'accesso.")
        }
      } else {
        setUser(null)
        setActivity(null)
      }
      setLoading(false)
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        getSession()
      } else {
        setUser(null)
        setActivity(null)
        setLoading(false)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (user) {
    if (user.is_admin) {
      return <AdminDashboard initialUser={user} />
    } else {
      return <Dashboard initialUser={user} initialActivity={activity} />
    }
  }

  return <LandingPage />
}
