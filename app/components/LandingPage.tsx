"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SignInForm } from "./SignInForm"
import { SignUpForm } from "./SignUpForm"
import { Sparkles, Gift, Users, TrendingUp, Star, Shield, Zap } from "lucide-react"
import { motion } from "framer-motion"

export function LandingPage() {
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)

  const handleAuthSuccess = () => {
    setShowSignIn(false)
    setShowSignUp(false)
    // The auth state change will be handled by the parent component
  }

  if (showSignIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <SignInForm
          onSuccess={handleAuthSuccess}
          onSwitchToSignUp={() => {
            setShowSignIn(false)
            setShowSignUp(true)
          }}
        />
      </div>
    )
  }

  if (showSignUp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <SignUpForm
          onSuccess={handleAuthSuccess}
          onSwitchToSignIn={() => {
            setShowSignUp(false)
            setShowSignIn(true)
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              LoyaltyApp
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowSignIn(true)}>
              Accedi
            </Button>
            <Button
              onClick={() => setShowSignUp(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              Registrati
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Il Tuo{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Sistema Fedeltà
              </span>{" "}
              Digitale
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Guadagna punti ad ogni acquisto, riscatta premi esclusivi e goditi vantaggi riservati ai membri più
              fedeli.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setShowSignUp(true)}
                className="h-12 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Inizia Ora Gratis
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowSignIn(true)}
                className="h-12 px-8 border-purple-200 hover:bg-purple-50"
              >
                Accedi al Tuo Account
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Perché Scegliere LoyaltyApp?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Un sistema completo per gestire la fedeltà dei tuoi clienti con funzionalità avanzate e interfaccia
            intuitiva.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-4">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Premi Esclusivi</h3>
            <p className="text-gray-600">
              Riscatta i tuoi punti con una vasta gamma di premi personalizzati e offerte speciali riservate ai membri.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Tracciamento Punti</h3>
            <p className="text-gray-600">
              Monitora i tuoi punti in tempo reale con una dashboard intuitiva e cronologia dettagliata delle
              transazioni.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestione Utenti</h3>
            <p className="text-gray-600">
              Sistema completo di gestione utenti con pannello amministrativo avanzato per il controllo totale.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Esperienza Premium</h3>
            <p className="text-gray-600">
              Interfaccia moderna e responsive ottimizzata per tutti i dispositivi con animazioni fluide.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sicurezza Avanzata</h3>
            <p className="text-gray-600">
              Protezione dei dati con autenticazione sicura e crittografia avanzata per la massima tranquillità.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Veloce e Affidabile</h3>
            <p className="text-gray-600">
              Prestazioni ottimizzate con caricamento istantaneo e sincronizzazione in tempo reale dei dati.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-center text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto a Iniziare il Tuo Viaggio Fedeltà?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Unisciti a migliaia di utenti che hanno già scoperto i vantaggi del nostro sistema fedeltà digitale.
          </p>
          <Button
            size="lg"
            onClick={() => setShowSignUp(true)}
            className="h-12 px-8 bg-white text-purple-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Registrati Gratuitamente
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                LoyaltyApp
              </span>
            </div>
            <p className="text-gray-600 text-sm">© 2024 LoyaltyApp. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
