"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockBarbershops, mockBookings, mockReviews } from "@/lib/mock-data"
import { Calendar, DollarSign, Star, Clock, CheckCircle2, XCircle, Settings, Eye } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export default function BarberDashboardPage() {
  // Mock: In production, get the logged-in barber's ID
  const barberId = "barber1"
  const barbershop = mockBarbershops.find((b) => b.ownerId === barberId)
  const bookings = mockBookings.filter((b) => b.barbershopId === barbershop?.id)
  const reviews = mockReviews.filter((r) => r.barbershopId === barbershop?.id)

  const [selectedTab, setSelectedTab] = useState("overview")

  if (!barbershop) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-16 pb-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">Você ainda não cadastrou uma barbearia.</p>
            <Button asChild className="mt-4">
              <Link href="/barber/setup">Cadastrar Barbearia</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // Calculate statistics
  const todayBookings = bookings.filter((b) => {
    const today = new Date()
    return (
      b.date.getDate() === today.getDate() &&
      b.date.getMonth() === today.getMonth() &&
      b.date.getFullYear() === today.getFullYear()
    )
  })

  const upcomingBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "pending")
  const completedBookings = bookings.filter((b) => b.status === "completed")
  const totalRevenue = completedBookings.reduce((sum, booking) => {
    const service = barbershop.services.find((s) => s.id === booking.serviceId)
    return sum + (service?.price || 0)
  }, 0)

  const getServiceName = (serviceId: string) => {
    return barbershop.services.find((s) => s.id === serviceId)?.name || "Serviço"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Confirmado</Badge>
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Concluído</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-16 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">{barbershop.name}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/barbershop/${barbershop.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Perfil
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/barber/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayBookings.length}</div>
                <p className="text-xs text-muted-foreground">Horários marcados para hoje</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Próximos Agendamentos</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingBookings.length}</div>
                <p className="text-xs text-muted-foreground">Confirmados e pendentes</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{barbershop.rating}</div>
                <p className="text-xs text-muted-foreground">{barbershop.reviewCount} avaliações</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {totalRevenue}</div>
                <p className="text-xs text-muted-foreground">{completedBookings.length} serviços concluídos</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="bookings">Agendamentos</TabsTrigger>
              <TabsTrigger value="reviews">Avaliações</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Today's Bookings */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Agendamentos de Hoje</CardTitle>
                    <CardDescription>Horários marcados para hoje</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {todayBookings.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Nenhum agendamento para hoje.</p>
                    ) : (
                      <div className="space-y-4">
                        {todayBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="flex items-center justify-between p-4 border border-border rounded-lg"
                          >
                            <div>
                              <p className="font-semibold">{booking.time}</p>
                              <p className="text-sm text-muted-foreground">{getServiceName(booking.serviceId)}</p>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Reviews */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Avaliações Recentes</CardTitle>
                    <CardDescription>Últimas avaliações recebidas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reviews.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Nenhuma avaliação ainda.</p>
                    ) : (
                      <div className="space-y-4">
                        {reviews.slice(0, 3).map((review) => (
                          <div key={review.id} className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={review.clientAvatar || "/placeholder.svg"} />
                              <AvatarFallback>{review.clientName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-sm">{review.clientName}</p>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: review.rating }).map((_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">{review.comment}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Todos os Agendamentos</CardTitle>
                  <CardDescription>Gerencie seus agendamentos</CardDescription>
                </CardHeader>
                <CardContent>
                  {bookings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Nenhum agendamento ainda.</p>
                  ) : (
                    <div className="space-y-3">
                      {bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="font-semibold">{formatDate(booking.date)}</p>
                              <span className="text-muted-foreground">•</span>
                              <p className="text-muted-foreground">{booking.time}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">{getServiceName(booking.serviceId)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(booking.status)}
                            {booking.status === "pending" && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="h-8 bg-transparent">
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 bg-transparent">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Todas as Avaliações</CardTitle>
                  <CardDescription>Feedback dos seus clientes</CardDescription>
                </CardHeader>
                <CardContent>
                  {reviews.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Nenhuma avaliação ainda.</p>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="flex items-start gap-4 pb-6 border-b border-border last:border-0"
                        >
                          <Avatar>
                            <AvatarImage src={review.clientAvatar || "/placeholder.svg"} />
                            <AvatarFallback>{review.clientName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold">{review.clientName}</p>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? "fill-primary text-primary" : "text-muted"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                            <p className="text-xs text-muted-foreground">
                              {review.createdAt.toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
