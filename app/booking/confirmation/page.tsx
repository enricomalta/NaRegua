"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Calendar, Clock, MapPin, Home } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { getBarbershopById } from "@/lib/firebase-service"
import type { Barbershop } from "@/lib/types"

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("id")
  
  // For now, we'll show a simple success message
  // In a real implementation, you'd fetch the booking details by ID
  
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-16 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Agendamento Criado!</h1>
            <p className="text-muted-foreground">Seu agendamento foi criado com sucesso e está pendente de confirmação</p>
            {bookingId && (
              <p className="text-sm text-muted-foreground mt-2">ID do agendamento: {bookingId}</p>
            )}
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-2">Próximos Passos</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Aguarde a confirmação da barbearia</li>
              <li>• Você receberá uma notificação quando for confirmado</li>
              <li>• Chegue com alguns minutos de antecedência</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/client/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Ver Meus Agendamentos
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1 bg-transparent">
              <Link href="/map">Ver Outras Barbearias</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
