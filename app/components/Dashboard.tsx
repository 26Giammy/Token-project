"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Gift, History, QrCode, User, Crown } from "lucide-react"
import { signOut, redeemPoints, getUserProfile } from "@/app/actions"
import { toast } from "sonner"
import { motion } from "framer-motion"

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

interface DashboardProps {
  user: UserProfile
  onSignOut: () => void
}

export default function Dashboard({ user: initialUser, onSignOut }: DashboardProps) {
  const [user, setUser] = useState<UserProfile>(initialUser)
  const [activity, setActivity] = useState<PointTransaction[]>([])
  const [rewardCode, setRewardCode] = useState("")
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchUserProfileAndActivity = async () => {
    const result = await getUserProfile()
    if (result.success && result.profile) {
      setUser(result.profile)
      setActivity(result.activity || [])
    } else {
      toast.error(result.message || "Errore nel caricamento del profilo utente.")
      onSignOut() // Force sign out if profile cannot be loaded
    }
  }

  useEffect(() => {
    fetchUserProfileAndActivity()
    const interval = setInterval(fetchUserProfileAndActivity, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const handleRedeemPoints = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRedeeming(true)
    const amountToRedeem = 100 // Example: 100 points per reward
    const description = `Riscatto premio con codice: ${rewardCode}`

    const result = await redeemPoints(user.id, amountToRedeem, description)

    if (result.success) {
      toast.success(result.message)
      setRewardCode("")
      setIsDialogOpen(false)
      fetchUserProfileAndActivity() // Refresh user points and activity
    } else {
      toast.error(result.message)
    }
    setIsRedeeming(false)
  }

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString("it-IT", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <Card className="mb-6 bg-white/90 backdrop-blur-md shadow-lg rounded-xl border border-white/60">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <Avatar className="w-16 h-16 border-2 border-purple-400 shadow-md">
                <AvatarImage src="/placeholder-user.jpg" alt="Avatar utente" />
                <AvatarFallback className="bg-purple-100 text-purple-600 text-xl font-semibold">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Ciao, {user.name || user.email}!</h2>
                <p className="text-gray-600">Benvenuto nella tua dashboard fedeltà.</p>
              </div>
            </div>
            <div className="flex space-x-3">
              {user.is_admin && (
                <Button
                  variant="outline"
                  className="bg-yellow-500 text-white hover:bg-yellow-600 hover:text-white shadow-md"
                  onClick={() => (window.location.href = "/admin-dashboard")}
                >
                  <Crown className="w-5 h-5 mr-2" /> Admin
                </Button>
              )}
              <Button
                variant="outline"
                className="bg-red-500 text-white hover:bg-red-600 hover:text-white shadow-md"
                onClick={async () => {
                  await signOut()
                  onSignOut()
                }}
              >
                <LogOut className="w-5 h-5 mr-2" /> Esci
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Points Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="h-full bg-white/90 backdrop-blur-md shadow-lg rounded-xl border border-white/60">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Punti Totali</CardTitle>
                <User className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-purple-600">{user.points}</div>
                <p className="text-xs text-gray-500 mt-1">Guadagna più punti per sbloccare premi!</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Redeem Rewards Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="h-full bg-white/90 backdrop-blur-md shadow-lg rounded-xl border border-white/60">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Riscatta Premi</CardTitle>
                <Gift className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 mb-4">Hai {user.points} punti disponibili.</p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-md">
                      Riscatta un Premio
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-lg shadow-xl">
                    <DialogHeader>
                      <DialogTitle>Riscatta un Premio</DialogTitle>
                      <DialogDescription>Inserisci il codice del premio per riscattare i tuoi punti.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRedeemPoints} className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="rewardCode" className="text-right">
                          Codice
                        </Label>
                        <Input
                          id="rewardCode"
                          value={rewardCode}
                          onChange={(e) => setRewardCode(e.target.value)}
                          className="col-span-3"
                          placeholder="Es. REWARD123"
                          required
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isRedeeming || !rewardCode}>
                          {isRedeeming ? "Riscattando..." : "Riscatta Ora"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <Card className="bg-white/90 backdrop-blur-md shadow-lg rounded-xl border border-white/60">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Attività Recente</CardTitle>
                <History className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                {activity.length > 0 ? (
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-4">
                      {activity.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <p className="text-sm font-medium text-gray-800">{item.description}</p>
                            <p className="text-xs text-gray-500">{formatDateTime(item.created_at)}</p>
                          </div>
                          <p className={`text-sm font-bold ${item.type === "add" ? "text-green-600" : "text-red-600"}`}>
                            {item.type === "add" ? "+" : "-"}
                            {item.amount} Punti
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-center text-gray-500 py-4">Nessuna attività recente.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* QR Code Card (Placeholder) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-3"
          >
            <Card className="bg-white/90 backdrop-blur-md shadow-lg rounded-xl border border-white/60">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Scansiona QR Code</CardTitle>
                <QrCode className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-32 bg-gray-100 rounded-md border border-dashed border-gray-300 text-gray-500">
                  <QrCode className="w-8 h-8 mb-2" />
                  <p className="text-sm">Funzionalità di scansione QR in arrivo!</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
