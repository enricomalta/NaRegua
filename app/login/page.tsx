"use client"

import type React from "react"
import { Suspense } from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Scissors } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { signInUser } from "@/lib/firebase-service"
import { useToast } from "@/hooks/use-toast"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, login } = useAuth()
  const { toast } = useToast()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const redirectPath = searchParams.get('redirect') || null

  // Se já está logado, redirecionar
  useEffect(() => {
    if (user) {
      const path = redirectPath || 
        (user.role === "barber" ? "/barber/dashboard" :
         user.role === "admin" ? "/admin/dashboard" :
         "/client/dashboard")
      router.push(path)
    }
  }, [user, router, redirectPath])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const userData = await signInUser(email, password)
      
      // Usar o método login do contexto que gera o JWT
      login(userData)
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${userData.name}!`
      })

      // Redirect based on user role or redirect parameter
      const path = redirectPath || 
        (userData.role === "barber" ? "/barber/dashboard" :
         userData.role === "admin" ? "/admin/dashboard" :
         "/client/dashboard")
      
      router.push(path)
    } catch (error: any) {
      console.error("Login error:", error)
      setError("Email ou senha incorretos. Tente novamente.")
      toast({
        title: "Erro no login",
        description: "Email ou senha incorretos. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Scissors className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Bem-vindo de volta</CardTitle>
          <CardDescription>Entre com sua conta para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Não tem uma conta? </span>
            <Link href="/signup" className="text-primary hover:underline">
              Cadastre-se
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Voltar para home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LoginContent />
    </Suspense>
  )
}
