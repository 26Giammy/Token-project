"use client"

import { Star, Gift, Coffee, Scissors, ShoppingBag, LogOut, Crown, Utensils, Percent } from "lucide-react" // Added Utensils, Percent
import { signOut, getUserProfile, redeemPoints } from "@/app/actions" // Removed addPoints
import { toast } from "sonner"
import { useEffect, useState } from "react"

interface DashboardProps {
  userName: string
  onLogout: () => void
  isAdmin: boolean // New prop to indicate if the user is an admin
}

interface UserProfile {
  id: string
  email: string
  points: number
  is_admin: boolean // Include is_admin in the type
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
  {
    id: 5,
    name: "Free Dessert",
    points: 150,
    icon: Utensils,
    gradient: "from-green-400 to-lime-500",
  },
  {
    id: 6,
    name: "15% Off Total Bill",
    points: 400,
    icon: Percent,
    gradient: "from-red-400 to-rose-500",
  },
]

export default function Dashboard({ userName, onLogout, isAdmin }: DashboardProps) {
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
        toast.error(result.message || "impossibile caricare dati Dashboard.")
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
      toast.error("Profilo utente non caricato.")
      return
    }
    if (userProfile.points < rewardPoints) {
      toast.error("Non hai abbastanza punti per riscattare questa ricompensa.")
      return
    }

    const result = await redeemPoints(userProfile.id, rewardPoints, `Riscosso ${rewardName}`)
    if (result.success && result.newPoints !== undefined) {
      if (result.rewardCode) {
        toast.success(`${result.message}`, {
          duration: 10000, // Show for 10 seconds
          action: {
            label: "Copia codice",
            onClick: () => {
              navigator.clipboard.writeText(result.rewardCode!)
              toast.success("Codice copiato!")
            },
          },
        })
      } else {
        toast.success(result.message)
      }
      setUserProfile((prev) => (prev ? { ...prev, points: result.newPoints } : null))
      // Re-fetch activity to show the new transaction
      const activityResult = await getUserProfile()
      if (activityResult.success && activityResult.activity) {
        setRecentActivity(activityResult.activity)
      }
    } else {
      toast.error(result.message || "Impossibile riscattare ricompensa.")
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
          <h1 className="text-3xl font-bold text-gray-800">Bentornato, {userName}!</h1>
          <p className="text-gray-600">Pronto a guadagnare altre ricompense?</p>
        </div>

        {/* Points Card */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">I tuoi Punti</p>
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
          <h2 className="text-xl font-bold text-gray-800">Le Tue Ricompense</h2>

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
          <h2 className="text-xl font-bold text-gray-800">Attività recenti</h2>

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
              <p className="text-center text-gray-500">Nessuna attività recente.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
