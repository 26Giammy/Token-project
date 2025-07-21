"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import {
  addPointsToUserByEmail,
  getUsersForAdminView,
  getAdminRedeemedRewards,
  fulfillReward,
  createReward,
} from "@/app/actions"
import type { User } from "@supabase/supabase-js"

interface AdminDashboardProps {
  user: User | null
  profile: {
    id: string
    email: string
    is_admin: boolean
    name?: string | null
  } | null
}

interface UserProfile {
  id: string
  email: string
  points: number
  is_admin: boolean
  name?: string | null
}

interface RedeemedReward {
  id: string
  code: string
  redeemed_at: string | null
  point_transactions: {
    id: string
    user_id: string
    amount: number
    description: string
    created_at: string
    profiles: {
      email: string
      name?: string | null
    }
  } | null
}

export default function AdminDashboard({ user, profile }: AdminDashboardProps) {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [redeemedRewards, setRedeemedRewards] = useState<RedeemedReward[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingRedeemed, setLoadingRedeemed] = useState(true)
  const [addPointsEmail, setAddPointsEmail] = useState("")
  const [addPointsAmount, setAddPointsAmount] = useState<number | "">(0)
  const [addPointsLoading, setAddPointsLoading] = useState(false)
  const [newRewardName, setNewRewardName] = useState("")
  const [newRewardCost, setNewRewardCost] = useState<number | "">(0)
  const [createRewardLoading, setCreateRewardLoading] = useState(false)

  const fetchUsers = async () => {
    setLoadingUsers(true)
    const { success, users: fetchedUsers, message } = await getUsersForAdminView()
    if (success && fetchedUsers) {
      setUsers(fetchedUsers)
    } else {
      toast({
        title: "Errore",
        description: message || "Impossibile caricare gli utenti.",
        variant: "destructive",
      })
    }
    setLoadingUsers(false)
  }

  const fetchRedeemedRewards = async () => {
    setLoadingRedeemed(true)
    const { success, redeemedRewards: fetchedRedeemed, message } = await getAdminRedeemedRewards()
    if (success && fetchedRedeemed) {
      setRedeemedRewards(fetchedRedeemed)
    } else {
      toast({
        title: "Errore",
        description: message || "Impossibile caricare i premi riscattati.",
        variant: "destructive",
      })
    }
    setLoadingRedeemed(false)
  }

  useEffect(() => {
    fetchUsers()
    fetchRedeemedRewards()
  }, [])

  const handleAddPoints = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddPointsLoading(true)
    if (addPointsEmail && typeof addPointsAmount === "number" && addPointsAmount > 0) {
      const result = await addPointsToUserByEmail(addPointsEmail, addPointsAmount)
      if (result.success) {
        toast({ title: "Successo", description: result.message })
        setAddPointsEmail("")
        setAddPointsAmount(0)
        fetchUsers() // Refresh user list
      } else {
        toast({ title: "Errore", description: result.message, variant: "destructive" })
      }
    } else {
      toast({
        title: "Errore",
        description: "Inserisci un'email valida e un importo positivo.",
        variant: "destructive",
      })
    }
    setAddPointsLoading(false)
  }

  const handleFulfillReward = async (transactionId: string) => {
    const result = await fulfillReward(transactionId)
    if (result.success) {
      toast({ title: "Successo", description: result.message })
      fetchRedeemedRewards() // Refresh redeemed rewards list
    } else {
      toast({ title: "Errore", description: result.message, variant: "destructive" })
    }
  }

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateRewardLoading(true)
    if (newRewardName && typeof newRewardCost === "number" && newRewardCost > 0) {
      const result = await createReward(newRewardName, newRewardCost)
      if (result.success) {
        toast({ title: "Successo", description: result.message })
        setNewRewardName("")
        setNewRewardCost(0)
      } else {
        toast({ title: "Errore", description: result.message, variant: "destructive" })
      }
    } else {
      toast({
        title: "Errore",
        description: "Inserisci un nome e un costo in punti validi per il premio.",
        variant: "destructive",
      })
    }
    setCreateRewardLoading(false)
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Pannello di Amministrazione</CardTitle>
          <CardDescription>Gestisci utenti, punti e premi.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Aggiungi Punti a un Utente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddPoints} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-points-email">Email Utente</Label>
                <Input
                  id="add-points-email"
                  type="email"
                  placeholder="utente@example.com"
                  value={addPointsEmail}
                  onChange={(e) => setAddPointsEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-points-amount">Quantità Punti</Label>
                <Input
                  id="add-points-amount"
                  type="number"
                  value={addPointsAmount}
                  onChange={(e) => setAddPointsAmount(Number(e.target.value))}
                  required
                  min="1"
                />
              </div>
              <Button type="submit" disabled={addPointsLoading}>
                {addPointsLoading ? "Aggiunta..." : "Aggiungi Punti"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crea Nuovo Premio</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateReward} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="new-reward-name">Nome Premio</Label>
                <Input
                  id="new-reward-name"
                  type="text"
                  placeholder="Buono Sconto 10€"
                  value={newRewardName}
                  onChange={(e) => setNewRewardName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-reward-cost">Costo in Punti</Label>
                <Input
                  id="new-reward-cost"
                  type="number"
                  value={newRewardCost}
                  onChange={(e) => setNewRewardCost(Number(e.target.value))}
                  required
                  min="1"
                />
              </div>
              <Button type="submit" disabled={createRewardLoading}>
                {createRewardLoading ? "Creazione..." : "Crea Premio"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Utenti Registrati</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <p>Caricamento utenti...</p>
          ) : users.length === 0 ? (
            <p>Nessun utente registrato.</p>
          ) : (
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
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.name || "N/A"}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.points}</TableCell>
                    <TableCell>{u.is_admin ? "Sì" : "No"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Premi Riscattati</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRedeemed ? (
            <p>Caricamento premi riscattati...</p>
          ) : redeemedRewards.length === 0 ? (
            <p>Nessun premio riscattato.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utente</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Premio</TableHead>
                  <TableHead>Costo Punti</TableHead>
                  <TableHead>Codice</TableHead>
                  <TableHead>Data Riscatto</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Azione</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redeemedRewards.map((reward) => (
                  <TableRow key={reward.id}>
                    <TableCell>{reward.point_transactions?.profiles?.name || "N/A"}</TableCell>
                    <TableCell>{reward.point_transactions?.profiles?.email || "N/A"}</TableCell>
                    <TableCell>{reward.point_transactions?.description || "N/A"}</TableCell>
                    <TableCell>{Math.abs(reward.point_transactions?.amount || 0)}</TableCell>
                    <TableCell>{reward.code}</TableCell>
                    <TableCell>{new Date(reward.redeemed_at || "").toLocaleString()}</TableCell>
                    <TableCell>{reward.redeemed_at ? "Riscattato" : "In attesa"}</TableCell>
                    <TableCell>
                      {!reward.redeemed_at && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFulfillReward(reward.point_transactions?.id || "")}
                        >
                          Marca come Riscattato
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
