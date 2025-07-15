"use client"

import { ArrowRight, Star, Gift, Crown } from "lucide-react"

interface LandingPageProps {
  onStart: () => void
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 flex justify-center md:justify-start">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
          <Crown className="w-6 h-6 text-white" />
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-md mx-auto space-y-8">
          {/* Floating Icons */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center animate-bounce">
              <Star className="w-4 h-4 text-purple-600" />
            </div>
            <div className="absolute -top-2 -right-6 w-6 h-6 bg-pink-200 rounded-full flex items-center justify-center animate-pulse">
              <Gift className="w-3 h-3 text-pink-600" />
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
                Join Our
                <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Loyalty Program
                </span>
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed">
                {"Guadagna punti ogni volta che acquisti per ricevere ricompense esclusive"}
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onStart}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-8 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {"Inizia il tuo viaggio"}
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 pt-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              {"Sicuro"}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              Instantaneo
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              Rewarding
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Decoration */}
      <div className="h-20 bg-gradient-to-t from-white/50 to-transparent"></div>
    </div>
  )
}
