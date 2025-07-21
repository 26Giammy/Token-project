"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { signOut, redeemPoints, getRewards } from "@/app/actions"
import type { User } from "@supabase/supabase-js"

interface DashboardProps {
  user: User | null
  profile: {
    id: string
    email: string
    points: number
    is_admin: boolean
    name?: string | null // Add name to profile type
  } | null
}

interface Reward {
  id: string
  name: string
  points_cost: number
}

export default function Dashboard({ user, profile }: DashboardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loadingRewards, setLoadingRewards] = useState(true)
  const [redeeming, setRedeeming] = useState(false)

  useEffect(() => {
    async function fetchRewards() {
      setLoadingRewards(true)
      const { success, rewards: fetchedRewards, message } = await getRewards()
      if (success && fetchedRewards) {
        setRewards(fetchedRewards)
      } else {
        toast({
          title: "Errore",
          description: message || "Impossibile caricare i premi.",
          variant: "destructive",
        })
      }
      setLoadingRewards(false)
    }
    fetchRewards()
  }, [toast])

  const handleSignOut = async () => {
    const result = await signOut()
    if (result.success) {
      toast({
        title: "Successo",
        description: result.message,
      })
      router.push("/signin")
    } else {
      toast({
        title: "Errore",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  const handleRedeem = async (rewardId: string, rewardName: string, pointsCost: number) => {
    if (!user || !profile) {
      toast({
        title: "Errore",
        description: "Devi essere loggato per riscattare i premi.",
        variant: "destructive",
      })
      return
    }

    if (profile.points < pointsCost) {
      toast({
        title: "Errore",
        description: "Punti insufficienti per riscattare questo premio.",
        variant: "destructive",
      })
      return
    }

    setRedeeming(true)
    const result = await redeemPoints(rewardId)
    if (result.success) {
      toast({
        title: "Successo",
        description: result.message,
        action: result.rewardCode ? (
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(result.rewardCode || "")
              toast({ title: "Copiato!", description: "Codice premio copiato negli appunti." })
            }}
          >
            Copia Codice
          </Button>
        ) : undefined,
      })
      // Optionally, re-fetch profile or update state to reflect new points
      router.refresh() // Revalidate data on the page
    } else {
      toast({
        title: "Errore",
        description: result.message,
        variant: "destructive",
      })
    }
    setRedeeming(false)
  }

  const userName = profile?.name || user?.email?.split("@")[0] || "Utente"

  return (
    <div className="w-full max-w-4xl mx-auto p-4 grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-3xl">Benvenuto, {userName}!</CardTitle>
            <CardDescription>Gestisci i tuoi punti e riscatta i premi.</CardDescription>
          </div>
          <Button onClick={handleSignOut}>Logout</Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">I tuoi punti:</h3>
            <span className="text-4xl font-bold text-primary">{profile?.points ?? 0}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riscatta Premi</CardTitle>
          <CardDescription>Scegli tra i premi disponibili.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {loadingRewards ? (
            <p>Caricamento premi...</p>
          ) : rewards.length === 0 ? (
            <p>Nessun premio disponibile al momento.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward) => (
                <Card key={reward.id}>
                  <CardHeader>
                    <CardTitle>{reward.name}</CardTitle>
                    <CardDescription>{reward.points_cost} punti</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      onClick={() => handleRedeem(reward.id, reward.name, reward.points_cost)}
                      disabled={redeeming || (profile?.points ?? 0) < reward.points_cost}
                    >
                      {redeeming ? "Riscatto..." : "Riscatta"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
