"use client"

import { Star, Gift, Coffee, Scissors, ShoppingBag, LogOut, Crown } from "lucide-react"
import { signOut, getUserProfile, redeemPoints, addPoints } from "@/app/actions" // Import new actions
import { toast } from "sonner"
import { useEffect, useState } from "react"

interface DashboardProps {
  userName: string
  onLogout: () => void
}

interface UserProfile {
  id: string
  email: string
  points: number
}

interface PointActivity {
  type: "earn" | "redeem"
  amount: number
  description: string
  created_at: string
}

const rewards = [
  {
    id: 1,
    name: "Free Coffee",
    points: 200,
    icon: Coffee,
    gradient: "from-amber-400 to-orange-500",
  },
  {
    id: 2,
    name: "Hair Treatment",
    points: 500,
    icon: Scissors,
    gradient: "from-purple-400 to-pink-500",
  },
  {
    id: 3,
    name: "20% Off Purchase",
    points: 300,
    icon: ShoppingBag,
    gradient: "from-blue-400 to-cyan-500",
  },
  {
    id: 4,
    name: "VIP Experience",
    points: 800,
    icon: Crown,
    gradient: "from-yellow-400 to-amber-500",
  },
]

export default function Dashboard({ userName, onLogout }: DashboardProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [recentActivity, setRecentActivity] = useState<PointActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true)
      const result = await getUserProfile()
      if (result.success && result.profile) {
        setUserProfile(result.profile)
        setRecentActivity(result.activity || [])
      } else {
        toast.error(result.message || "Failed to load dashboard data.")
        onLogout() // Force logout if profile cannot be loaded
      }
      setIsLoading(false)
    }
    fetchProfileData()
  }, [onLogout])

  const handleLogout = async () => {
    const result = await signOut()
    if (result.success) {
      toast.success(result.message)
      onLogout()
    } else {
      toast.error(result.message)
    }
  }

  const handleRedeem = async (rewardPoints: number, rewardName: string) => {
    if (!userProfile) {
      toast.error("User profile not loaded.")
      return
    }
    if (userProfile.points < rewardPoints) {
      toast.error("Not enough points to redeem this reward.")
      return
    }

    const result = await redeemPoints(userProfile.id, rewardPoints, `Redeemed ${rewardName}`)
    if (result.success && result.newPoints !== undefined) {
      toast.success(result.message)
      setUserProfile((prev) => (prev ? { ...prev, points: result.newPoints } : null))
      // Re-fetch activity to show the new transaction
      const activityResult = await getUserProfile()
      if (activityResult.success && activityResult.activity) {
        setRecentActivity(activityResult.activity)
      }
    } else {
      toast.error(result.message || "Failed to redeem reward.")
    }
  }

  // Placeholder for adding points (e.g., after a simulated purchase)
  const handleAddPoints = async () => {
    if (!userProfile) {
      toast.error("User profile not loaded.")
      return
    }
    const pointsToAdd = 50 // Example: 50 points for a purchase
    const description = "Purchase at Cafe"
    const result = await addPoints(userProfile.id, pointsToAdd, description)
    if (result.success && result.newPoints !== undefined) {
      toast.success(result.message)
      setUserProfile((prev) => (prev ? { ...prev, points: result.newPoints } : null))
      // Re-fetch activity to show the new transaction
      const activityResult = await getUserProfile()
      if (activityResult.success && activityResult.activity) {
        setRecentActivity(activityResult.activity)
      }
    } else {
      toast.error(result.message || "Failed to add points.")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
          <Crown className="w-5 h-5 text-white" />
        </div>
        <button onClick={handleLogout} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
          <LogOut className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-8 space-y-8">
        {/* Welcome */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, {userName}!</h1>
          <p className="text-gray-600">Ready to earn more rewards?</p>
        </div>

        {/* Points Card */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Your Points</p>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-6 h-6 text-yellow-300 fill-current" />
                <span className="text-3xl font-bold">{userProfile?.points ?? 0}</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Gift className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-purple-100 text-sm">
              {userProfile && userProfile.points < 200
                ? `You're ${200 - userProfile.points} points away from your first reward!`
                : "You have enough points for rewards!"}
            </p>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Your Rewards</h2>

          <div className="grid gap-4">
            {rewards.map((reward) => {
              const IconComponent = reward.icon
              const canRedeem = (userProfile?.points ?? 0) >= reward.points

              return (
                <div
                  key={reward.id}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${reward.gradient} rounded-xl flex items-center justify-center`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{reward.name}</h3>
                      <p className="text-sm text-gray-600">{reward.points} points</p>
                    </div>

                    <button
                      onClick={() => handleRedeem(reward.points, reward.name)}
                      disabled={!canRedeem}
                      className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                        canRedeem
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-md transform hover:scale-105"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {canRedeem ? "Redeem" : "Locked"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Activity Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>

          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{activity.description}</p>
                      <p className="text-sm text-gray-600">{new Date(activity.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${activity.type === "earn" ? "text-green-600" : "text-red-600"}`}>
                        {activity.type === "earn" ? "+" : "-"}
                        {Math.abs(activity.amount)} points
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No recent activity.</p>
            )}
          </div>
        </div>

        {/* Example button to add points (for testing) */}
        <div className="text-center pt-4">
          <button
            onClick={handleAddPoints}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Simulate Earning 50 Points
          </button>
        </div>
      </main>
    </div>
  )
}
