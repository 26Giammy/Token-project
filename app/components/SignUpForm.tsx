"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"
import { signUp } from "@/app/actions"
import { toast } from "sonner" // Corretto l'import di toast

interface SignUpFormProps {
  onSignUpSuccess: () => void
  onBack: () => void
  onSignInClick: () => void
}

export default function SignUpForm({ onSignUpSuccess, onBack, onSignInClick }: SignUpFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const passwordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 1
    if (password.match(/[a-z]/)) strength += 1
    if (password.match(/[A-Z]/)) strength += 1
    if (password.match(/[0-9]/)) strength += 1
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1
    return strength
  }

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 1) return "bg-red-500"
    if (strength <= 3) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 1) return "Debole"
    if (strength <= 3) return "Media"
    return "Forte"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setIsSuccess(false)
    setIsLoading(true)

    if (password !== confirmPassword) {
      setMessage("Le password non corrispondono.")
      setIsSuccess(false)
      setIsLoading(false)
      return
    }

    if (passwordStrength(password) < 2) {
      setMessage("La password deve essere più forte. Usa almeno 8 caratteri con lettere e numeri.")
      setIsSuccess(false)
      setIsLoading(false)
      return
    }

    const formData = new FormData(e.target as HTMLFormElement)
    const result = await signUp(formData)

    if (result.success) {
      setMessage(result.message)
      setIsSuccess(true)
      toast.success(result.message)
      setTimeout(onSignUpSuccess, 2000)
    } else {
      setMessage(result.message)
      setIsSuccess(false)
      toast.error(result.message)
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="absolute -top-12 left-0 text-gray-700 hover:text-purple-600 transition-colors duration-200"
          aria-label="Torna indietro"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <Card className="w-full bg-white shadow-lg rounded-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold text-gray-900">Crea il Tuo Account</CardTitle>
            <CardDescription className="text-gray-600">
              Unisciti al nostro programma fedeltà e inizia a guadagnare premi!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Mario Rossi"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="mario.rossi@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 caratteri"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {password && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Forza password:</span>
                      <span
                        className={`text-xs font-medium ${
                          passwordStrength(password) <= 1
                            ? "text-red-500"
                            : passwordStrength(password) <= 3
                              ? "text-yellow-500"
                              : "text-green-500"
                        }`}
                      >
                        {getPasswordStrengthText(passwordStrength(password))}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength(password))}`}
                        style={{ width: `${(passwordStrength(password) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Conferma Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Conferma la tua password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {password !== confirmPassword && confirmPassword.length > 0 && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> Le password non corrispondono.
                  </p>
                )}
              </div>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-2 text-sm ${isSuccess ? "text-green-600" : "text-red-600"}`}
                >
                  {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {message}
                </motion.div>
              )}
              <Button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors duration-200 shadow-md"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Registrazione...
                  </span>
                ) : (
                  "Registrati"
                )}
              </Button>
            </form>
            <div className="text-center text-sm text-gray-600">
              Hai già un account?{" "}
              <Button
                variant="link"
                onClick={onSignInClick}
                className="p-0 h-auto text-purple-600 hover:text-purple-700 transition-colors duration-200"
              >
                Accedi
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
