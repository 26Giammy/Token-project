"use client"

import { Star, Gift, Coffee, Scissors, ShoppingBag, LogOut, Crown } from "lucide-react"

interface DashboardProps {
  userName: string
  onLogout: () => void
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
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
          <Crown className="w-5 h-5 text-white" />
        </div>
        <button onClick={onLogout} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
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
                <span className="text-3xl font-bold">320</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Gift className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-purple-100 text-sm">You're 180 points away from your next reward!</p>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Your Rewards</h2>

          <div className="grid gap-4">
            {rewards.map((reward) => {
              const IconComponent = reward.icon
              const canRedeem = 320 >= reward.points

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
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Purchase at Salon</p>
                  <p className="text-sm text-gray-600">2 hours ago</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">+50 points</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Redeemed Free Coffee</p>
                  <p className="text-sm text-gray-600">Yesterday</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">-200 points</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
