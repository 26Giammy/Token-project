"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon, Mail, Lock } from "lucide-react"
import { toast } from "sonner"
import { signIn } from "@/app/actions"
import { motion } from "framer-motion"

interface SignInFormProps {
  onClose: () => void
  onSignUpClick: () => void
}

export function SignInForm({ onClose, onSignUpClick }: SignInFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formDataObj = new FormData()
    formDataObj.append("email", formData.email)
    formDataObj.append("password", formData.password)

    startTransition(async () => {
      const result = await signIn(formDataObj)
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
            placeholder="La tua password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className="pl-10 pr-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-colors"
            required
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
              Accesso in corso...
            </div>
          ) : (
            "Accedi"
          )}
        </Button>

        <div className="text-center text-sm text-gray-600">
          Non hai un account?{" "}
          <Button
            variant="link"
            type="button"
            onClick={onSignUpClick}
            className="p-0 h-auto text-purple-600 hover:text-purple-700 font-medium"
          >
            Registrati qui
          </Button>
        </div>
      </motion.div>
    </motion.form>
  )
}
