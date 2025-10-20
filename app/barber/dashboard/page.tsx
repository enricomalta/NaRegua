"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { useRoleProtection } from "@/hooks/use-role-protection"
import { usePermissions } from "@/hooks/use-permissions"
import { getBarbershops, getBookingsByBarbershop, getReviewsByBarbershop, updateBookingStatus } from "@/lib/firebase-service"
import { Calendar, DollarSign, Star, Clock, CheckCircle2, XCircle, Settings, Eye, AlertTriangle, Loader2 } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import type { Barbershop, Booking, Review } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function BarberDashboardPage() {
  // Todos os hooks devem ser chamados sempre na mesma ordem
  const { user, authUser } = useAuth()
  const { toast } = useToast()
  const { isAuthorized, loading: authLoading } = useRoleProtection({
    requiredRoles: ['barber', 'admin'],
    requireAuth: true
  })
  const { canRead, canUpdate, validateUser } = usePermissions()
  
  // Estados
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedTab, setSelectedTab] = useState("overview")
  const [permissions, setPermissions] = useState({
    canReadBookings: false,
    canUpdateBookings: false,
    canReadReviews: false
  })
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Verificar permissões ao carregar
  useEffect(() => {
    const checkPermissions = async () => {
      if (!authUser || authLoading) return

      try {
        // Validar usuário via API
        const validatedUser = await validateUser(authUser.userId)
        if (!validatedUser) {
          setError("Usuário não encontrado ou inválido")
          return
        }

        // Verificar permissões específicas
        const [bookingRead, bookingUpdate, reviewRead] = await Promise.all([
          canRead('booking'),
          canUpdate('booking'),
          canRead('review')
        ])

        setPermissions({
          canReadBookings: bookingRead.hasPermission,
          canUpdateBookings: bookingUpdate.hasPermission,
          canReadReviews: reviewRead.hasPermission
        })

        if (!bookingRead.hasPermission) {
          toast({
            title: "Acesso limitado",
            description: "Você não tem permissão para visualizar agendamentos",
            variant: "destructive"
          })
        }

      } catch (error) {
        console.error("Error checking permissions:", error)
        setError("Erro ao verificar permissões")
      }
    }

    checkPermissions()
  }, [authUser?.userId, authLoading]) // Apenas authUser.userId e authLoading como dependências

  // Carregar dados da barbearia com verificação de permissões
  useEffect(() => {
    const loadData = async () => {
      if (!user || !isAuthorized) return

      try {
        setDataLoading(true)
        
        // Buscar barbearias do usuário
        const allBarbershops = await getBarbershops()
        const userBarbershop = allBarbershops.find((b) => b.ownerId === user.id)
        
        if (userBarbershop) {
          setBarbershop(userBarbershop)
          
          // Carregar dados apenas se tiver permissão
          const promises = []
          
          if (permissions.canReadBookings) {
            promises.push(getBookingsByBarbershop(userBarbershop.id))
          } else {
            promises.push(Promise.resolve([]))
          }
          
          if (permissions.canReadReviews) {
            promises.push(getReviewsByBarbershop(userBarbershop.id))
          } else {
            promises.push(Promise.resolve([]))
          }
          
          const [barbershopBookings, barbershopReviews] = await Promise.all(promises)
          
          setBookings(barbershopBookings as Booking[])
          setReviews(barbershopReviews as Review[])
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setError("Erro ao carregar dados da barbearia")
      } finally {
        setDataLoading(false)
      }
    }

    if (user && isAuthorized && !authLoading && (permissions.canReadBookings || permissions.canReadReviews)) {
      loadData()
    } else if (!authLoading && isAuthorized) {
      setDataLoading(false)
    }
  }, [user, isAuthorized, authLoading, permissions])

  // Loading inicial
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Usuário não autorizado
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-24">
          <div className="max-w-2xl mx-auto text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
            <p className="text-muted-foreground mb-6">
              Você não tem permissão para acessar esta página.
            </p>
            <Button asChild>
              <Link href="/">Voltar ao Início</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // Erro
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-24">
          <div className="max-w-2xl mx-auto text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Erro de Acesso</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button asChild>
              <Link href="/">Voltar ao Início</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // Loading dos dados
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-24">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    )
  }

  // Nenhuma barbearia
  if (!barbershop) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-24">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-2">Nenhuma Barbearia Encontrada</h1>
            <p className="text-muted-foreground mb-6">
              Você ainda não possui uma barbearia cadastrada.
            </p>
            <Button asChild>
              <Link href="/barber/setup">Cadastrar Barbearia</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // Cálculos de estatísticas
  const todayBookings = bookings.filter((b: Booking) => {
    const today = new Date()
    const bookingDate = new Date(b.date)
    return bookingDate.toDateString() === today.toDateString()
  })

  const upcomingBookings = bookings.filter((b: Booking) => b.status === "confirmed" || b.status === "pending")
  const completedBookings = bookings.filter((b: Booking) => b.status === "completed")
  const totalRevenue = completedBookings.reduce((sum: number, booking: Booking) => {
    const service = barbershop.services.find((s) => s.id === booking.serviceId)
    return sum + (service?.price || 0)
  }, 0)

  const getServiceName = (serviceId: string) => {
    return barbershop.services.find((s) => s.id === serviceId)?.name || "Serviço"
  }

  const getClientName = (clientId: string) => {
    // TODO: Implementar busca real do nome do cliente
    return `Cliente ${clientId.slice(0, 8)}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-blue-100 text-blue-800">Confirmado</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
      default:
        return <Badge variant="outline">Pendente</Badge>
    }
  }

  const handleAcceptBooking = async (bookingId: string) => {
    if (!permissions.canUpdateBookings || !user) {
      return
    }

    try {
      setActionLoading(bookingId)

      await updateBookingStatus(bookingId, "confirmed", {
        updatedBy: user.id
      })

      setBookings((prev) => {
        const updated = prev.map((booking) =>
          booking.id === bookingId ? { ...booking, status: "confirmed" as const } : booking
        )

        return [...updated].sort((a, b) => b.date.getTime() - a.date.getTime())
      })

      toast({
        title: "Agendamento confirmado",
        description: "O cliente será notificado sobre a confirmação."
      })
    } catch (error) {
      console.error("Erro ao confirmar agendamento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível confirmar o agendamento. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-24">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard - {barbershop.name}</h1>
              <p className="text-muted-foreground mt-2">
                Gerencie sua barbearia e acompanhe suas estatísticas
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/barbershop/${barbershop.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Perfil
                </Link>
              </Button>
              <Button asChild>
                <Link href="/barber/manage">
                  <Settings className="h-4 w-4 mr-2" />
                  Gerenciar
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{permissions.canReadBookings ? todayBookings.length : '-'}</div>
              <p className="text-xs text-muted-foreground">
                agendamentos para hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximos</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{permissions.canReadBookings ? upcomingBookings.length : '-'}</div>
              <p className="text-xs text-muted-foreground">
                agendamentos confirmados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {permissions.canReadBookings ? `R$ ${totalRevenue.toFixed(2)}` : '-'}
              </div>
              <p className="text-xs text-muted-foreground">
                de serviços concluídos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliações</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {permissions.canReadReviews ? barbershop.rating.toFixed(1) : '-'}
              </div>
              <p className="text-xs text-muted-foreground">
                {permissions.canReadReviews ? reviews.length : '-'} avaliações
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Conteúdo */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="bookings" disabled={!permissions.canReadBookings}>
              Agendamentos
            </TabsTrigger>
            <TabsTrigger value="reviews" disabled={!permissions.canReadReviews}>
              Avaliações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {permissions.canReadBookings && (
                <Card>
                  <CardHeader>
                    <CardTitle>Agendamentos Recentes</CardTitle>
                    <CardDescription>Últimos agendamentos da sua barbearia</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {bookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{getClientName(booking.clientId)}</p>
                            <p className="text-sm text-muted-foreground">
                              {getServiceName(booking.serviceId)} - {formatDate(booking.date)} às {booking.time}
                            </p>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                      ))}
                      
                      {bookings.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          Nenhum agendamento encontrado
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {permissions.canReadReviews && (
                <Card>
                  <CardHeader>
                    <CardTitle>Avaliações Recentes</CardTitle>
                    <CardDescription>Últimas avaliações dos clientes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reviews.slice(0, 5).map((review) => (
                        <div key={review.id} className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={review.clientAvatar} />
                              <AvatarFallback>{review.clientName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{review.clientName}</p>
                              <div className="flex items-center">
                                {Array.from({ length: review.rating }).map((_, i) => (
                                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        </div>
                      ))}
                      
                      {reviews.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          Nenhuma avaliação encontrada
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {!permissions.canReadBookings && !permissions.canReadReviews && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Acesso Limitado</CardTitle>
                    <CardDescription>
                      Você não tem permissão para visualizar dados detalhados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Entre em contato com o administrador para obter mais permissões.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Todos os Agendamentos</CardTitle>
                <CardDescription>Gerencie os agendamentos da sua barbearia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{getClientName(booking.clientId)}</p>
                            <p className="text-sm text-muted-foreground">
                              {getServiceName(booking.serviceId)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">{formatDate(booking.date)}</p>
                            <p className="text-sm text-muted-foreground">{booking.time}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(booking.status)}
                        {permissions.canUpdateBookings && booking.status === "pending" && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAcceptBooking(booking.id)}
                              disabled={actionLoading === booking.id}
                              aria-label="Confirmar agendamento"
                            >
                              {actionLoading === booking.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                              title="Em breve"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {bookings.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum agendamento encontrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Todas as Avaliações</CardTitle>
                <CardDescription>Veja todas as avaliações da sua barbearia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-6 border rounded-lg">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={review.clientAvatar} />
                          <AvatarFallback>{review.clientName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{review.clientName}</h4>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center mb-3">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                            <span className="ml-2 text-sm text-muted-foreground">
                              ({review.rating}/5)
                            </span>
                          </div>
                          <p className="text-sm">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {reviews.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma avaliação encontrada
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
