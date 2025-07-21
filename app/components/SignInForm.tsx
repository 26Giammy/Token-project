"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"
import { signIn } from "@/app/actions"
import { toast } from "sonner" // Corretto l'import di toast

interface SignInFormProps {
  onSignInSuccess: () => void
  onBack: () => void
  onSignUpClick: () => void
}

export default function SignInForm({ onSignInSuccess, onBack, onSignUpClick }: SignInFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setIsSuccess(false)
    setIsLoading(true)

    const formData = new FormData(e.target as HTMLFormElement)
    const result = await signIn(formData)

    if (result.success) {
      setMessage(result.message)
      setIsSuccess(true)
      toast.success(result.message)
      setTimeout(onSignInSuccess, 1000)
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
            <CardTitle className="text-3xl font-bold text-gray-900">Accedi al Tuo Account</CardTitle>
            <CardDescription className="text-gray-600">
              Bentornato! Accedi per continuare il tuo viaggio di premi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    placeholder="La tua password"
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
                    Accesso...
                  </span>
                ) : (
                  "Accedi"
                )}
              </Button>
            </form>
            <div className="text-center text-sm text-gray-600">
              Non hai un account?{" "}
              <Button
                variant="link"
                onClick={onSignUpClick}
                className="p-0 h-auto text-purple-600 hover:text-purple-700 transition-colors duration-200"
              >
                Registrati
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
