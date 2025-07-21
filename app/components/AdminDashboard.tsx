"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import {
  signOut,
  getUsersForAdminView,
  addPointsToUserByEmail,
  getAdminRedeemedRewards,
  fulfillReward,
  getUserProfile,
  getAdminStats,
} from "@/app/actions"
import { useRouter } from "next/navigation"
import { Loader2, LogOut, UserPlus, Users, Gift, CheckCircle, Clock, Crown, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

interface UserProfile {
  id: string
  email: string
  name: string
  points: number
  is_admin: boolean
}

interface RedeemedReward {
  id: string
  redeemed_at: string | null
  point_transactions: {
    id: string
    user_id: string
    amount: number
    description: string
    created_at: string
    profiles: {
      email: string
      name: string
    }
  }
}

interface AdminDashboardProps {
  initialUser: UserProfile | null
}

export function AdminDashboard({ initialUser }: AdminDashboardProps) {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(initialUser)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [redeemedRewards, setRedeemedRewards] = useState<RedeemedReward[]>([])
  const [stats, setStats] = useState({ totalUsers: 0, totalPoints: 0, pendingRewards: 0 })
  const [addPointsData, setAddPointsData] = useState({
    email: "",
    amount: 0,
    description: "",
  })
  const [isAddingPoints, setIsAddingPoints] = useState(false)
  const [isFulfilling, setIsFulfilling] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddPointsDialogOpen, setIsAddPointsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const userResult = await getUserProfile()
      if (userResult.success && userResult.data?.profile && userResult.data.profile.is_admin) {
        setUser(userResult.data.profile)

        const [usersResult, rewardsResult, statsResult] = await Promise.all([
          getUsersForAdminView(),
          getAdminRedeemedRewards(),
          getAdminStats(),
        ])

        if (usersResult.success && usersResult.data) {
          setUsers(usersResult.data.users)
        } else {
          toast.error(usersResult.message || "Impossibile caricare gli utenti.")
        }

        if (rewardsResult.success && rewardsResult.data) {
          setRedeemedRewards(rewardsResult.data.redeemedRewards)
        } else {
          toast.error(rewardsResult.message || "Impossibile caricare i premi riscattati.")
        }

        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data)
        }
      } else {
        toast.error(userResult.message || "Accesso non autorizzato all'area admin.")
        router.push("/")
      }
      setIsLoading(false)
    }

    fetchData()
  }, [router])

  const handleSignOut = async () => {
    const result = await signOut()
    if (result.success) {
      toast.success(result.message)
      router.push("/")
    } else {
      toast.error(result.message)
    }
  }

  const handleAddPoints = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingPoints(true)

    const formData = new FormData()
    formData.append("email", addPointsData.email)
    formData.append("amount", addPointsData.amount.toString())
    formData.append("description", addPointsData.description)

    const result = await addPointsToUserByEmail(formData)
    setIsAddingPoints(false)

    if (result.success) {
      toast.success(result.message)
      setAddPointsData({ email: "", amount: 0, description: "" })
      setIsAddPointsDialogOpen(false)

      // Refresh data
      const [usersResult, statsResult] = await Promise.all([getUsersForAdminView(), getAdminStats()])
      if (usersResult.success && usersResult.data) {
        setUsers(usersResult.data.users)
      }
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data)
      }
    } else {
      toast.error(result.message)
    }
  }

  const handleFulfillReward = async (transactionId: string) => {
    setIsFulfilling(true)
    const result = await fulfillReward(transactionId)
    setIsFulfilling(false)

    if (result.success) {
      toast.success(result.message)
      const [rewardsResult, statsResult] = await Promise.all([getAdminRedeemedRewards(), getAdminStats()])
      if (rewardsResult.success && rewardsResult.data) {
        setRedeemedRewards(rewardsResult.data.redeemedRewards)
      }
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data)
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
          <p className="text-gray-600">Caricamento dashboard admin...</p>
        </div>
      </div>
    )
  }

  if (!user || !user.is_admin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span className="font-medium text-gray-900">{user.name || user.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/")}>
              <Users className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Dashboard Utente</span>
            </Button>
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dashboard Amministratore</h1>
          <p className="text-gray-600">Gestisci utenti, punti e premi del sistema fedeltà</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Utenti Totali</CardTitle>
                <Users className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
                <p className="text-xs text-gray-500 mt-1">Membri registrati</p>
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
                <CardTitle className="text-sm font-medium text-gray-700">Punti Totali</CardTitle>
                <TrendingUp className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.totalPoints.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">Nel sistema</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Premi in Sospeso</CardTitle>
                <Clock className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.pendingRewards}</div>
                <p className="text-xs text-gray-500 mt-1">Da evadere</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Add Points */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <UserPlus className="w-5 h-5 text-purple-600" />
                  Gestione Punti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={isAddPointsDialogOpen} onOpenChange={setIsAddPointsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Aggiungi Punti a Utente
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Aggiungi Punti</DialogTitle>
                      <DialogDescription>Aggiungi punti al saldo di un utente specifico</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddPoints} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Utente</Label>
                        <Input
                          id="email"
                          type="email"
                          value={addPointsData.email}
                          onChange={(e) => setAddPointsData((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="utente@example.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amount">Punti da Aggiungere</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={addPointsData.amount}
                          onChange={(e) => setAddPointsData((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                          placeholder="100"
                          min="1"
                          max="10000"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Descrizione</Label>
                        <Input
                          id="description"
                          value={addPointsData.description}
                          onChange={(e) => setAddPointsData((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="Bonus benvenuto"
                          required
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isAddingPoints} className="w-full">
                          {isAddingPoints ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Aggiunta in corso...
                            </>
                          ) : (
                            "Aggiungi Punti"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Utenti Registrati</h4>
                  <ScrollArea className="h-[200px] rounded-md border">
                    <div className="p-4 space-y-3">
                      {users.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{u.name || u.email}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {u.points} punti
                            </Badge>
                            {u.is_admin && (
                              <Badge variant="default" className="text-xs">
                                Admin
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Redeemed Rewards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Gift className="w-5 h-5 text-purple-600" />
                  Premi Riscattati
                </CardTitle>
              </CardHeader>
              <CardContent>
                {redeemedRewards.length === 0 ? (
                  <div className="text-center py-8">
                    <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nessun premio riscattato</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Utente</TableHead>
                          <TableHead className="text-xs">Premio</TableHead>
                          <TableHead className="text-xs">Punti</TableHead>
                          <TableHead className="text-xs">Data</TableHead>
                          <TableHead className="text-xs">Stato</TableHead>
                          <TableHead className="text-xs">Azione</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {redeemedRewards.map((reward) => (
                          <TableRow key={reward.id}>
                            <TableCell className="text-xs">
                              <div>
                                <p className="font-medium">{reward.point_transactions.profiles.name || "N/A"}</p>
                                <p className="text-gray-500">{reward.point_transactions.profiles.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs">{reward.point_transactions.description}</TableCell>
                            <TableCell className="text-xs font-medium">-{reward.point_transactions.amount}</TableCell>
                            <TableCell className="text-xs">
                              {formatDateTime(reward.point_transactions.created_at)}
                            </TableCell>
                            <TableCell>
                              {reward.redeemed_at ? (
                                <Badge variant="default" className="text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Evaso
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  In Sospeso
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {!reward.redeemed_at && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleFulfillReward(reward.point_transactions.id)}
                                  disabled={isFulfilling}
                                  className="h-7 text-xs"
                                >
                                  {isFulfilling ? <Loader2 className="w-3 h-3 animate-spin" /> : "Evadi"}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
