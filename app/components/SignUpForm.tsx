"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { signUp } from "@/app/actions" // Import the server action

export default function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (password !== confirmPassword) {
      toast({
        title: "Errore",
        description: "Le password non corrispondono.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    const result = await signUp(email, password, name) // Call the server action with name

    if (result.success) {
      toast({
        title: "Successo",
        description: result.message,
      })
      router.push("/") // Redirect to dashboard or home after successful sign-up
    } else {
      toast({
        title: "Errore",
        description: result.message,
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Registrati</CardTitle>
        <CardDescription>Inserisci i tuoi dati per creare un account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              type="text"
              placeholder="Mario Rossi"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="mario@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Conferma Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registrazione..." : "Registrati"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Hai già un account?{" "}
          <Button variant="link" onClick={() => router.push("/signin")} className="p-0 h-auto">
            Accedi
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
