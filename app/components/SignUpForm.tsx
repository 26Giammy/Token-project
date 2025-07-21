"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon, CheckCircle2, AlertCircle, User, Mail, Lock } from "lucide-react"
import { toast } from "sonner"
import { signUp } from "@/app/actions"
import { motion } from "framer-motion"

interface SignUpFormProps {
  onClose: () => void
  onSignInClick: () => void
}

export function SignUpForm({ onClose, onSignInClick }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isPending, startTransition] = useTransition()

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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("Le password non corrispondono")
      return
    }

    if (passwordStrength(formData.password) < 2) {
      toast.error("La password deve essere più forte. Usa almeno 8 caratteri con lettere e numeri.")
      return
    }

    const formDataObj = new FormData()
    formDataObj.append("name", formData.name)
    formDataObj.append("email", formData.email)
    formDataObj.append("password", formData.password)
    formDataObj.append("confirmPassword", formData.confirmPassword)

    startTransition(async () => {
      const result = await signUp(formDataObj)
      if (result.success) {
        toast.success(result.message)
        onClose()
      } else {
        toast.error(result.message)
      }
    })
  }

  const inputVariants = {
    initial: { y: 10, opacity: 0 },
    animate: { y: 0, opacity: 1 },
  }

  return (
    <motion.form
      initial="initial"
      animate="animate"
      variants={{
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
      }}
      onSubmit={handleSubmit}
      className="space-y-6 p-1"
    >
      <motion.div variants={inputVariants} className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
          Nome completo
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            id="name"
            type="text"
            placeholder="Mario Rossi"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-colors"
            required
          />
        </div>
      </motion.div>

      <motion.div variants={inputVariants} className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="mario.rossi@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-colors"
            required
          />
        </div>
      </motion.div>

      <motion.div variants={inputVariants} className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Minimo 8 caratteri"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className="pl-10 pr-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-colors"
            required
            minLength={6}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOffIcon className="h-4 w-4 text-gray-400" />
            ) : (
              <EyeIcon className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
        {formData.password && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Forza password:</span>
              <span
                className={`text-xs font-medium ${
                  passwordStrength(formData.password) <= 1
                    ? "text-red-500"
                    : passwordStrength(formData.password) <= 3
                      ? "text-yellow-500"
                      : "text-green-500"
                }`}
              >
                {getPasswordStrengthText(passwordStrength(formData.password))}
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength(formData.password))}`}
                style={{ width: `${(passwordStrength(formData.password) / 5) * 100}%` }}
              />
            </div>
          </div>
        )}
      </motion.div>

      <motion.div variants={inputVariants} className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
          Conferma Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Conferma la tua password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            className="pl-10 pr-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-colors"
            required
            minLength={6}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOffIcon className="h-4 w-4 text-gray-400" />
            ) : (
              <EyeIcon className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
        {formData.password !== formData.confirmPassword && formData.confirmPassword.length > 0 && (
          <div className="flex items-center gap-1 text-red-500 text-sm">
            <AlertCircle className="w-3 h-3" />
            Le password non corrispondono
          </div>
        )}
        {formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 && (
          <div className="flex items-center gap-1 text-green-500 text-sm">
            <CheckCircle2 className="w-3 h-3" />
            Le password corrispondono
          </div>
        )}
      </motion.div>

      <motion.div variants={inputVariants} className="space-y-4">
        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          disabled={isPending}
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Registrazione in corso...
            </div>
          ) : (
            "Crea Account"
          )}
        </Button>

        <div className="text-center text-sm text-gray-600">
          Hai già un account?{" "}
          <Button
            variant="link"
            type="button"
            onClick={onSignInClick}
            className="p-0 h-auto text-purple-600 hover:text-purple-700 font-medium"
          >
            Accedi qui
          </Button>
        </div>
      </motion.div>
    </motion.form>
  )
}
