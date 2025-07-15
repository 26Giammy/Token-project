"use client"

import type React from "react"

import { useEffect, useState, useMemo } from "react" // Added useMemo
import { toast } from "sonner"
import {
  addPointsToUserByEmail,
  getUsersForAdminView,
  getAdminRedeemedRewards,
  fulfillReward,
  signOut,
} from "@/app/actions"
import { LogOut, User, DollarSign, Gift, RefreshCw, ArrowRight, Search } from "lucide-react" // Added Search icon
import { Input } from "@/components/ui/input" // Import Input component

interface AdminDashboardProps {
  onLogout: () => void
}

interface UserProfileAdmin {
  id: string
  email: string
  points: number
  is_admin: boolean
}

interface RedeemedRewardAdmin {
  id: string
  code: string | null
  redeemed_at: string | null
  point_transactions: {
    id: string
    user_id: string
    amount: number
    description: string
    created_at: string
    profiles: { email: string } | null
  } | null
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [users, setUsers] = useState<UserProfileAdmin[]>([])
  const [redeemedRewards, setRedeemedRewards] = useState<RedeemedRewardAdmin[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingRewards, setLoadingRewards] = useState(true)
  const [addPointsLoading, setAddPointsLoading] = useState(false)
  const [emailToAddPoints, setEmailToAddPoints] = useState("")
  const [pointsAmount, setPointsAmount] = useState(0)
  const [pointsDescription, setPointsDescription] = useState("")
  const [userSearchTerm, setUserSearchTerm] = useState("") // New state for user search

  const fetchUsers = async () => {
    setLoadingUsers(true)
    const result = await getUsersForAdminView()
    if (result.success && result.users) {
      setUsers(result.users)
    } else {
      toast.error(result.message || "Failed to load users.")
    }
    setLoadingUsers(false)
  }

  const fetchRedeemedRewards = async () => {
    setLoadingRewards(true)
    const result = await getAdminRedeemedRewards()
    if (result.success && result.redeemedRewards) {
      setRedeemedRewards(result.redeemedRewards)
    } else {
      toast.error(result.message || "Failed to load redeemed rewards.")
    }
    setLoadingRewards(false)
  }

  useEffect(() => {
    fetchUsers()
    fetchRedeemedRewards()
  }, [])

  const handleAddPointsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAddPointsLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append("email", emailToAddPoints)
    formData.append("amount", pointsAmount.toString())
    formData.append("description", pointsDescription)

    const result = await addPointsToUserByEmail(formData)
    if (result.success) {
      toast.success(result.message)
      setEmailToAddPoints("")
      setPointsAmount(0)
      setPointsDescription("")
      fetchUsers() // Refresh user list
    } else {
      toast.error(result.message || "Failed to add points.")
    }
    setAddPointsLoading(false)
  }

  const handleFulfillReward = async (transactionId: string) => {
    const result = await fulfillReward(transactionId)
    if (result.success) {
      toast.success(result.message)
      fetchRedeemedRewards() // Refresh redeemed rewards list
    } else {
      toast.error(result.message || "Failed to fulfill reward.")
    }
  }

  const handleLogout = async () => {
    const result = await signOut()
    if (result.success) {
      toast.success(result.message)
      onLogout()
    } else {
      toast.error(result.message)
    }
  }

  // Filtered users based on search term
  const filteredUsers = useMemo(() => {
    if (!userSearchTerm) {
      return users
    }
    const lowerCaseSearchTerm = userSearchTerm.toLowerCase()
    return users.filter(
      (user) =>
        user.email.toLowerCase().includes(lowerCaseSearchTerm) || user.id.toLowerCase().includes(lowerCaseSearchTerm),
    )
  }, [users, userSearchTerm])

  return (
    <div className="min-h-screen bg-gradient-to-br from-page-gradient-start via-page-gradient-via to-page-gradient-end p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <button onClick={handleLogout} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
          <LogOut className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      {/* Add Points Section */}
      <section className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-8 border border-white/50">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" /> Add Points to User
        </h2>
        <form onSubmit={handleAddPointsSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              User Email
            </label>
            <input
              type="email"
              id="email"
              value={emailToAddPoints}
              onChange={(e) => setEmailToAddPoints(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-3 bg-white/70 border border-purple-100 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Points Amount
            </label>
            <input
              type="number"
              id="amount"
              value={pointsAmount}
              onChange={(e) => setPointsAmount(Number.parseInt(e.target.value) || 0)}
              min="1"
              placeholder="e.g., 100"
              className="w-full px-4 py-3 bg-white/70 border border-purple-100 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={pointsDescription}
              onChange={(e) => setPointsDescription(e.target.value)}
              placeholder="e.g., 'Purchase at Cafe X'"
              className="w-full px-4 py-3 bg-white/70 border border-purple-100 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              required
            />
          </div>
          <button
            type="submit"
            disabled={addPointsLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {addPointsLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Add Points <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </section>

      {/* All Users Section */}
      <section className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-8 border border-white/50">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" /> All Users
          </span>
          <button onClick={fetchUsers} className="p-2 hover:bg-gray-100 rounded-full">
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search users by email or ID..."
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/70 border border-purple-100 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
          />
        </div>
        {loadingUsers ? (
          <div className="flex justify-center items-center h-24">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white/80 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Email</th>
                  <th className="py-3 px-6 text-left">Points</th>
                  <th className="py-3 px-6 text-left">Admin</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm font-light">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-6 text-left whitespace-nowrap">{user.email}</td>
                      <td className="py-3 px-6 text-left">{user.points}</td>
                      <td className="py-3 px-6 text-left">{user.is_admin ? "Yes" : "No"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Redeemed Rewards Section */}
      <section className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-pink-600" /> Redeemed Rewards
          </span>
          <button onClick={fetchRedeemedRewards} className="p-2 hover:bg-gray-100 rounded-full">
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </h2>
        {loadingRewards ? (
          <div className="flex justify-center items-center h-24">
            <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {redeemedRewards.length > 0 ? (
              redeemedRewards.map((reward) => {
                const transaction = reward.point_transactions
                const isFulfilled = reward.redeemed_at !== null
                const fulfilledDate = isFulfilled ? new Date(reward.redeemed_at!).toLocaleString() : null

                if (!transaction) return null // Should not happen if data is structured correctly

                return (
                  <div
                    key={reward.id}
                    className="bg-white/80 rounded-xl p-4 shadow-sm border border-white/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {transaction.profiles?.email || "Unknown User"} redeemed: {transaction.description}
                      </p>
                      <p className="text-sm text-gray-600">
                        Redeemed on: {new Date(transaction.created_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Points: {Math.abs(transaction.amount)}</p>
                      {reward.code && (
                        <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded mt-1">Code: {reward.code}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isFulfilled ? (
                        <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                          Fulfilled on: {fulfilledDate}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleFulfillReward(transaction.id)}
                          className="bg-purple-500 text-white py-2 px-4 rounded-full text-sm font-medium hover:bg-purple-600 transition-colors"
                        >
                          Mark as Fulfilled
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-center text-gray-500">No redeemed rewards yet.</p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
