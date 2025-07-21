"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { signOut, redeemPoints, getUserProfile } from "@/app/actions"
import { useRouter } from "next/navigation"
import { Loader2, LogOut, Gift, History, User, Crown, Sparkles, TrendingUp, Award } from "lucide-react"
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
  initialUser: UserProfile | null
  initialActivity: PointTransaction[] | null
}

export function Dashboard({ initialUser, initialActivity }: DashboardProps) {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(initialUser)
  const [activity, setActivity] = useState<PointTransaction[]>(initialActivity || [])
  const [redeemAmount, setRedeemAmount] = useState<number>(0)
  const [redeemDescription, setRedeemDescription] = useState<string>("")
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const result = await getUserProfile()
      if (result.success && result.data) {
        setUser(result.data.profile)
        setActivity(result.data.activity || [])
      } else {
        toast.error(result.message || "Impossibile caricare il profilo utente.")
        router.push("/")
      }
      setIsLoading(false)
    }

    if (!initialUser) {
      fetchProfile()
    } else {
      setIsLoading(false)
    }
  }, [initialUser, router])

  const handleSignOut = async () => {
    const result = await signOut()
    if (result.success) {
      toast.success(result.message)
      router.push("/")
    } else {
      toast.error(result.message)
    }
  }

  const handleRedeemPoints = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("Utente non autenticato.")
      return
    }
    if (redeemAmount <= 0 || !redeemDescription) {
      toast.error("Inserisci un importo valido e una descrizione per il riscatto.")
      return
    }
    if (user.points < redeemAmount) {
      toast.error("Punti insufficienti per riscattare questa ricompensa.")
      return
    }

    setIsRedeeming(true)
    const result = await redeemPoints(user.id, redeemAmount, redeemDescription)
    setIsRedeeming(false)

    if (result.success) {
      toast.success(result.message)
      setUser((prevUser) => (prevUser ? { ...prevUser, points: result.data?.newPoints || prevUser.points } : null))
      setRedeemAmount(0)
      setRedeemDescription("")
      setIsDialogOpen(false)

      // Refresh activity
      const updatedProfile = await getUserProfile()
      if (updatedProfile.success && updatedProfile.data) {
        setActivity(updatedProfile.data.activity)
      }
    } else {
      toast.error(result.message)
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Caricamento dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              LoyaltyApp
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-gray-600">Ciao,</span>
              <span className="font-medium text-gray-900">{user.name || user.email}</span>
            </div>
            {user.is_admin && (
              <Button
                variant="outline"
                size="sm"
                className="bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500"
                onClick={() => router.push("/admin")}
              >
                <Crown className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Esci</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Welcome Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
              <AvatarImage src="/placeholder-user.jpg" alt="Avatar utente" />
              <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                Benvenuto, {user.name || user.email}!
              </h1>
              <p className="text-gray-600">Ecco il tuo riepilogo fedeltà di oggi</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Punti Totali</CardTitle>
                <Award className="w-4 h-4 opacity-90" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{user.points}</div>
                <p className="text-xs opacity-90 mt-1">Continua così!</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Transazioni</CardTitle>
                <TrendingUp className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{activity.length}</div>
                <p className="text-xs text-gray-500 mt-1">Attività totali</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 lg:col-span-1"
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Status</CardTitle>
                <User className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant={user.is_admin ? "default" : "secondary"} className="text-xs">
                    {user.is_admin ? "Admin" : "Membro"}
                  </Badge>
                  {user.points >= 1000 && (
                    <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">
                      VIP
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Redeem Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Gift className="w-5 h-5 text-purple-600" />
                  Riscatta Premi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <p className="text-2xl font-bold text-gray-900 mb-2">Hai {user.points} punti disponibili</p>
                  <p className="text-gray-600">Trasforma i tuoi punti in premi fantastici!</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                      <Gift className="w-4 h-4 mr-2" />
                      Riscatta Ora
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Riscatta i tuoi punti</DialogTitle>
                      <DialogDescription>Inserisci i dettagli per riscattare i tuoi punti fedeltà</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRedeemPoints} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="redeem-amount">Punti da riscattare</Label>
                        <Input
                          id="redeem-amount"
                          type="number"
                          value={redeemAmount}
                          onChange={(e) => setRedeemAmount(Number(e.target.value))}
                          placeholder="Es. 100"
                          min="1"
                          max={user.points}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="redeem-description">Descrizione premio</Label>
                        <Input
                          id="redeem-description"
                          type="text"
                          value={redeemDescription}
                          onChange={(e) => setRedeemDescription(e.target.value)}
                          placeholder="Es. Buono sconto 10€"
                          required
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isRedeeming} className="w-full">
                          {isRedeeming ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Riscatto in corso...
                            </>
                          ) : (
                            "Conferma Riscatto"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <History className="w-5 h-5 text-purple-600" />
                  Attività Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activity.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nessuna attività recente</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {activity.map((item, index) => (
                        <div key={index} className="flex items-start justify-between p-3 rounded-lg bg-gray-50">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{item.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDateTime(item.created_at)}</p>
                          </div>
                          <Badge variant={item.type === "add" ? "default" : "destructive"} className="ml-2 text-xs">
                            {item.type === "add" ? "+" : "-"}
                            {item.amount}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
