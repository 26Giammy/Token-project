import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner" // Import Toaster

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Loyalty Program - Earn Rewards",
  description:
    "Join our loyalty program and earn points with every purchase. Unlock exclusive rewards and VIP experiences.",
  keywords: "loyalty program, rewards, points, small business, salon, retail, café",
  viewport: "width=device-width, initial-scale=1",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster /> {/* Add Toaster component here */}
      </body>
    </html>
  )
}
