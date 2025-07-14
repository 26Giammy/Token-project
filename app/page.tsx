"use client"

import { useState } from "react"
import { Inter } from "next/font/google"
import LandingPage from "./components/LandingPage"
import EmailVerification from "./components/EmailVerification"
import OTPEntry from "./components/OTPEntry"
import Dashboard from "./components/Dashboard"

const inter = Inter({ subsets: ["latin"] })

export default function LoyaltyApp() {
  const [currentPage, setCurrentPage] = useState<"landing" | "email" | "otp" | "dashboard">("landing")
  const [userEmail, setUserEmail] = useState("")
  const [userName, setUserName] = useState("Sarah")

  const navigateToPage = (page: "landing" | "email" | "otp" | "dashboard") => {
    setCurrentPage(page)
  }

  const handleEmailSubmit = (email: string) => {
    setUserEmail(email)
    navigateToPage("otp")
  }

  const handleOTPVerify = () => {
    navigateToPage("dashboard")
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 ${inter.className}`}>
      {currentPage === "landing" && <LandingPage onStart={() => navigateToPage("email")} />}
      {currentPage === "email" && (
        <EmailVerification onEmailSubmit={handleEmailSubmit} onBack={() => navigateToPage("landing")} />
      )}
      {currentPage === "otp" && (
        <OTPEntry
          email={userEmail}
          onVerify={handleOTPVerify}
          onBack={() => navigateToPage("email")}
          onResend={() => {}}
        />
      )}
      {currentPage === "dashboard" && <Dashboard userName={userName} onLogout={() => navigateToPage("landing")} />}
    </div>
  )
}
