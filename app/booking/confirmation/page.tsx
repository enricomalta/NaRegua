"use client"

import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Calendar, Clock, MapPin, Home } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const barbershop = searchParams.get("barbershop")
  const service = searchParams.get("service")
  const dateStr = searchParams.get("date")
  const time = searchParams.get("time")

  const date = dateStr ? new Date(dateStr) : null

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
            <h1 className="text-3xl font-bold mb-2">Agendamento Confirmado!</h1>
            <p className="text-muted-foreground">Seu horário foi reservado com sucesso</p>
          </div>

          <Card className="border-border/50 mb-6">
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Barbearia</p>
                  <p className="font-semibold text-lg">{barbershop}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Data e Horário</p>
                  <p className="font-semibold text-lg">{date ? formatDate(date) : ""}</p>
                  <p className="text-muted-foreground">{time}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Serviço</p>
                  <p className="font-semibold text-lg">{service}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-2">Lembrete Importante</h3>
            <p className="text-sm text-muted-foreground">
              Você receberá uma notificação 10 minutos antes do seu horário agendado. Não se esqueça de chegar com
              alguns minutos de antecedência!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/client/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Ir para Dashboard
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
