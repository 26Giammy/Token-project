"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { LogOut, UserPlus, Users, Gift, CheckCircle, XCircle, Crown } from "lucide-react"
import {
  signOut,
  getUsersForAdminView,
  addPointsToUserByEmail,
  getAdminRedeemedRewards,
  fulfillReward,
} from "@/app/actions"
import { toast } from "sonner"
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
    }
  }
}

interface AdminDashboardProps {
  onSignOut: () => void
}

export default function AdminDashboard({ onSignOut }: AdminDashboardProps) {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [redeemedRewards, setRedeemedRewards] = useState<RedeemedReward[]>([])
  const [addPointsEmail, setAddPointsEmail] = useState("")
  const [addPointsAmount, setAddPointsAmount] = useState<number | "">("")
  const [addPointsDescription, setAddPointsDescription] = useState("")
  const [isAddingPoints, setIsAddingPoints] = useState(false)
  const [isFulfillingReward, setIsFulfillingReward] = useState(false)
  const [isAddPointsDialogOpen, setIsAddPointsDialogOpen] = useState(false)

  const fetchAdminData = async () => {
    const usersResult = await getUsersForAdminView()
    if (usersResult.success && usersResult.users) {
      setUsers(usersResult.users)
    } else {
      toast.error(usersResult.message || "Errore nel caricamento degli utenti.")
      onSignOut() // Force sign out if not authorized or error
    }

    const rewardsResult = await getAdminRedeemedRewards()
    if (rewardsResult.success && rewardsResult.redeemedRewards) {
      setRedeemedRewards(rewardsResult.redeemedRewards)
    } else {
      toast.error(rewardsResult.message || "Errore nel caricamento dei premi riscattati.")
    }
  }

  useEffect(() => {
    fetchAdminData()
    const interval = setInterval(fetchAdminData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const handleAddPoints = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingPoints(true)
    if (addPointsEmail && typeof addPointsAmount === "number" && addPointsAmount > 0 && addPointsDescription) {
      const formData = new FormData()
      formData.append("email", addPointsEmail)
      formData.append("amount", addPointsAmount.toString())
      formData.append("description", addPointsDescription)

      const result = await addPointsToUserByEmail(formData)
      if (result.success) {
        toast.success(result.message)
        setAddPointsEmail("")
        setAddPointsAmount("")
        setAddPointsDescription("")
        setIsAddPointsDialogOpen(false)
        fetchAdminData() // Refresh data
      } else {
        toast.error(result.message)
      }
    } else {
      toast.error("Per favore, compila tutti i campi per aggiungere punti.")
    }
    setIsAddingPoints(false)
  }

  const handleFulfillReward = async (transactionId: string) => {
    setIsFulfillingReward(true)
    const result = await fulfillReward(transactionId)
    if (result.success) {
      toast.success(result.message)
      fetchAdminData() // Refresh data
    } else {
      toast.error(result.message)
    }
    setIsFulfillingReward(false)
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
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <Card className="mb-6 bg-white/90 backdrop-blur-md shadow-lg rounded-xl border border-white/60">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <Crown className="w-12 h-12 text-purple-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Dashboard Amministratore</h2>
                <p className="text-gray-600">Gestisci utenti e premi fedeltà.</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="bg-purple-500 text-white hover:bg-purple-600 hover:text-white shadow-md"
                onClick={() => (window.location.href = "/dashboard")}
              >
                <UserPlus className="w-5 h-5 mr-2" /> Dashboard Utente
              </Button>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Manage Users Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full bg-white/90 backdrop-blur-md shadow-lg rounded-xl border border-white/60">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Gestisci Utenti</CardTitle>
                <Users className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <Dialog open={isAddPointsDialogOpen} onOpenChange={setIsAddPointsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full mb-4 bg-green-500 hover:bg-green-600 text-white shadow-md">
                      <UserPlus className="w-4 h-4 mr-2" /> Aggiungi Punti a Utente
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-lg shadow-xl">
                    <DialogHeader>
                      <DialogTitle>Aggiungi Punti</DialogTitle>
                      <DialogDescription>
                        Aggiungi punti al saldo di un utente specifico tramite email.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddPoints} className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          Email Utente
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={addPointsEmail}
                          onChange={(e) => setAddPointsEmail(e.target.value)}
                          className="col-span-3"
                          placeholder="utente@example.com"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                          Quantità Punti
                        </Label>
                        <Input
                          id="amount"
                          type="number"
                          value={addPointsAmount}
                          onChange={(e) => setAddPointsAmount(Number(e.target.value))}
                          className="col-span-3"
                          placeholder="100"
                          required
                          min="1"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Descrizione
                        </Label>
                        <Input
                          id="description"
                          value={addPointsDescription}
                          onChange={(e) => setAddPointsDescription(e.target.value)}
                          className="col-span-3"
                          placeholder="Bonus di benvenuto"
                          required
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isAddingPoints}>
                          {isAddingPoints ? "Aggiungendo..." : "Aggiungi Punti"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <ScrollArea className="h-[300px] w-full rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Punti</TableHead>
                        <TableHead>Admin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.points}</TableCell>
                          <TableCell>{user.is_admin ? "Sì" : "No"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Redeemed Rewards Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full bg-white/90 backdrop-blur-md shadow-lg rounded-xl border border-white/60">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Premi Riscattati</CardTitle>
                <Gift className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px] w-full rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utente</TableHead>
                        <TableHead>Descrizione</TableHead>
                        <TableHead>Punti</TableHead>
                        <TableHead>Data Riscatto</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>Azione</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {redeemedRewards.map((reward) => (
                        <TableRow key={reward.id}>
                          <TableCell className="font-medium">
                            {reward.point_transactions.profiles?.email || "N/A"}
                          </TableCell>
                          <TableCell>{reward.point_transactions.description}</TableCell>
                          <TableCell>-{reward.point_transactions.amount}</TableCell>
                          <TableCell>{formatDateTime(reward.point_transactions.created_at)}</TableCell>
                          <TableCell>
                            {reward.redeemed_at ? (
                              <span className="text-green-600 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" /> Evaso
                              </span>
                            ) : (
                              <span className="text-yellow-600 flex items-center">
                                <XCircle className="w-4 h-4 mr-1" /> In Sospeso
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {!reward.redeemed_at && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFulfillReward(reward.point_transactions.id)}
                                disabled={isFulfillingReward}
                              >
                                {isFulfillingReward ? "Evasione..." : "Evadi"}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
