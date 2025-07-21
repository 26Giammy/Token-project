"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Image from "next/image"

interface LandingPageProps {
  onStartJourney: () => void
}

export default function LandingPage({ onStartJourney }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-8"
      >
        <Image
          src="/placeholder-logo.svg"
          alt="Logo del programma fedeltà"
          width={150}
          height={150}
          className="mx-auto mb-4 drop-shadow-lg"
        />
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">Benvenuto</span>{" "}
          nel Nostro Programma Fedeltà
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          Guadagna punti, sblocca premi esclusivi e goditi vantaggi unici.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/90 backdrop-blur-md shadow-2xl rounded-xl border border-white/60 animate-scaleIn">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-800">Inizia il Tuo Viaggio di Premi</CardTitle>
            <CardDescription className="text-gray-600">
              Registrati o accedi per scoprire un mondo di vantaggi.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <Button
              onClick={onStartJourney}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              Inizia Ora <ArrowRight className="w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        className="mt-12 text-gray-500 text-sm"
      >
        <p>&copy; {new Date().getFullYear()} Il Tuo Programma Fedeltà. Tutti i diritti riservati.</p>
      </motion.div>
    </div>
  )
}
