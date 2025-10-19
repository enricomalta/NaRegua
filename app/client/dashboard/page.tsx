"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockBarbershops, mockBookings } from "@/lib/mock-data"
import { Calendar, MapPin, Clock, Star, Search, Heart, History } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export default function ClientDashboardPage() {
  // Mock: In production, get the logged-in client's ID
  const clientId = "client1"
  const clientBookings = mockBookings.filter((b) => b.clientId === clientId)

  const [selectedTab, setSelectedTab] = useState("upcoming")

  // Separate bookings by status
  const upcomingBookings = clientBookings.filter((b) => b.status === "confirmed" || b.status === "pending")
  const pastBookings = clientBookings.filter((b) => b.status === "completed" || b.status === "cancelled")

  // Mock favorites
  const favoriteShops = mockBarbershops.slice(0, 2)

  const getBarbershop = (barbershopId: string) => {
    return mockBarbershops.find((b) => b.id === barbershopId)
  }

  const getService = (barbershopId: string, serviceId: string) => {
    const barbershop = getBarbershop(barbershopId)
    return barbershop?.services.find((s) => s.id === serviceId)
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
              <h1 className="text-3xl font-bold mb-2">Meus Agendamentos</h1>
              <p className="text-muted-foreground">Gerencie seus horários e encontre novas barbearias</p>
            </div>
            <Button asChild>
              <Link href="/map">
                <Search className="h-4 w-4 mr-2" />
                Encontrar Barbearias
              </Link>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Próximos Agendamentos</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingBookings.length}</div>
                <p className="text-xs text-muted-foreground">Horários confirmados</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Histórico</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pastBookings.length}</div>
                <p className="text-xs text-muted-foreground">Serviços realizados</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{favoriteShops.length}</div>
                <p className="text-xs text-muted-foreground">Barbearias salvas</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="upcoming">Próximos</TabsTrigger>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
                </TabsList>

                {/* Upcoming Bookings */}
                <TabsContent value="upcoming">
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle>Próximos Agendamentos</CardTitle>
                      <CardDescription>Seus horários confirmados</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {upcomingBookings.length === 0 ? (
                        <div className="text-center py-12">
                          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-4">Você não tem agendamentos próximos.</p>
                          <Button asChild>
                            <Link href="/map">Agendar Horário</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {upcomingBookings.map((booking) => {
                            const barbershop = getBarbershop(booking.barbershopId)
                            const service = getService(booking.barbershopId, booking.serviceId)
                            if (!barbershop || !service) return null

                            return (
                              <Card key={booking.id} className="border-border/50">
                                <CardContent className="pt-6">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                      <h3 className="font-semibold text-lg mb-1">{barbershop.name}</h3>
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                        <MapPin className="h-4 w-4" />
                                        <span>{barbershop.address}</span>
                                      </div>
                                    </div>
                                    {getStatusBadge(booking.status)}
                                  </div>

                                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <Calendar className="h-5 w-5 text-primary" />
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground">Data</p>
                                        <p className="font-semibold">{formatDate(booking.date)}</p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <Clock className="h-5 w-5 text-primary" />
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground">Horário</p>
                                        <p className="font-semibold">{booking.time}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Serviço</p>
                                      <p className="font-semibold">{service.name}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-muted-foreground">Valor</p>
                                      <p className="font-semibold text-primary">R$ {service.price}</p>
                                    </div>
                                  </div>

                                  <div className="flex gap-2 mt-4">
                                    <Button variant="outline" asChild className="flex-1 bg-transparent">
                                      <Link href={`/barbershop/${barbershop.id}`}>Ver Perfil</Link>
                                    </Button>
                                    <Button variant="outline" className="flex-1 bg-transparent">
                                      Cancelar
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* History */}
                <TabsContent value="history">
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle>Histórico de Agendamentos</CardTitle>
                      <CardDescription>Seus serviços anteriores</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {pastBookings.length === 0 ? (
                        <p className="text-center text-muted-foreground py-12">Nenhum histórico ainda.</p>
                      ) : (
                        <div className="space-y-3">
                          {pastBookings.map((booking) => {
                            const barbershop = getBarbershop(booking.barbershopId)
                            const service = getService(booking.barbershopId, booking.serviceId)
                            if (!barbershop || !service) return null

                            return (
                              <div
                                key={booking.id}
                                className="flex items-center justify-between p-4 border border-border rounded-lg"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <p className="font-semibold">{barbershop.name}</p>
                                    <span className="text-muted-foreground">•</span>
                                    <p className="text-sm text-muted-foreground">{service.name}</p>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(booking.date)}</span>
                                    <span>•</span>
                                    <Clock className="h-3 w-3" />
                                    <span>{booking.time}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {getStatusBadge(booking.status)}
                                  {booking.status === "completed" && (
                                    <Button variant="outline" size="sm" asChild>
                                      <Link href={`/review/${barbershop.id}`}>Avaliar</Link>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Favorites */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Favoritos
                  </CardTitle>
                  <CardDescription>Suas barbearias preferidas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {favoriteShops.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4 text-sm">Nenhum favorito ainda.</p>
                  ) : (
                    favoriteShops.map((shop) => (
                      <div key={shop.id} className="space-y-3">
                        <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
                          <img
                            src={shop.images[0] || "/placeholder.svg"}
                            alt={shop.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">{shop.name}</h4>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-primary text-primary" />
                              <span className="text-sm font-semibold">{shop.rating}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">({shop.reviewCount})</span>
                          </div>
                          <Button asChild className="w-full" size="sm">
                            <Link href={`/booking/${shop.id}`}>Agendar</Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button asChild className="w-full bg-transparent" variant="outline">
                    <Link href="/map">
                      <Search className="h-4 w-4 mr-2" />
                      Buscar Barbearias
                    </Link>
                  </Button>
                  <Button asChild className="w-full bg-transparent" variant="outline">
                    <Link href="/client/favorites">
                      <Heart className="h-4 w-4 mr-2" />
                      Ver Favoritos
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
