"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { SignUpForm } from "./SignUpForm"
import { SignInForm } from "./SignInForm"
import { Gift, Star, Users, Zap, ArrowRight, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

export function LandingPage() {
  const [showSignUp, setShowSignUp] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)

  const features = [
    {
      icon: Gift,
      title: "Premi Esclusivi",
      description: "Riscatta i tuoi punti per ottenere premi incredibili e offerte esclusive.",
    },
    {
      icon: Star,
      title: "Punti Fedeltà",
      description: "Guadagna punti con ogni acquisto e interazione con il nostro brand.",
    },
    {
      icon: Users,
      title: "Comunità VIP",
      description: "Unisciti alla nostra comunità esclusiva di clienti fedeli.",
    },
    {
      icon: Zap,
      title: "Vantaggi Immediati",
      description: "Inizia subito a guadagnare punti e sbloccare vantaggi speciali.",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              LoyaltyApp
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Button variant="ghost" onClick={() => setShowSignIn(true)} className="hidden sm:inline-flex">
              Accedi
            </Button>
            <Button
              onClick={() => setShowSignUp(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Inizia Ora
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-16 md:py-24"
      >
        <div className="text-center">
          <motion.div variants={itemVariants} className="mb-4">
            <Badge variant="secondary" className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-200">
              🎉 Benvenuto nel futuro della fedeltà
            </Badge>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
          >
            Trasforma la tua{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">fedeltà</span>{" "}
            in premi
          </motion.h1>

          <motion.p variants={itemVariants} className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 md:text-xl">
            Unisciti al nostro programma fedeltà e inizia a guadagnare punti con ogni interazione. Riscatta premi
            esclusivi e goditi vantaggi speciali riservati solo a te.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              onClick={() => setShowSignUp(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Inizia il Tuo Viaggio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowSignIn(true)}
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              Hai già un account?
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container mx-auto px-4 py-16"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Perché scegliere il nostro programma?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Scopri tutti i vantaggi che ti aspettano nel nostro ecosistema di fedeltà
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-center text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container mx-auto px-4 py-16"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl">
            <CardContent className="p-8 md:p-12 text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Pronto a iniziare?</h3>
              <p className="text-lg mb-6 text-purple-100 max-w-2xl mx-auto">
                Registrati oggi stesso e ricevi immediatamente i tuoi primi punti di benvenuto!
              </p>
              <Button
                size="lg"
                onClick={() => setShowSignUp(true)}
                className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Registrati Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.section>

      {/* Sign Up Dialog */}
      <Dialog open={showSignUp} onOpenChange={setShowSignUp}>
        <DialogContent className="sm:max-w-md border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Crea il Tuo Account
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Unisciti alla nostra community e inizia a guadagnare punti!
            </DialogDescription>
          </DialogHeader>
          <SignUpForm
            onClose={() => setShowSignUp(false)}
            onSignInClick={() => {
              setShowSignUp(false)
              setShowSignIn(true)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Sign In Dialog */}
      <Dialog open={showSignIn} onOpenChange={setShowSignIn}>
        <DialogContent className="sm:max-w-md border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Bentornato!
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Accedi al tuo account per continuare il tuo viaggio di premi
            </DialogDescription>
          </DialogHeader>
          <SignInForm
            onClose={() => setShowSignIn(false)}
            onSignUpClick={() => {
              setShowSignIn(false)
              setShowSignUp(true)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
