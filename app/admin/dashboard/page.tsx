"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mockBarbershops, mockPlatformStats, mockBookings } from "@/lib/mock-data"
import {
  Building2,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Search,
  Eye,
  Ban,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboardPage() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")

  const stats = mockPlatformStats

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-16 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
              <p className="text-muted-foreground">Gerencie a plataforma Na Régua</p>
            </div>
            <Badge variant="outline" className="text-primary border-primary">
              Administrador
            </Badge>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total de Barbearias</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBarbershops}</div>
                <p className="text-xs text-muted-foreground">{stats.activeBarbershops} ativas</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Clientes e barbeiros</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                <p className="text-xs text-muted-foreground">Todos os tempos</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  Crescimento constante
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pending Approvals Alert */}
          {stats.pendingApprovals > 0 && (
            <Card className="border-primary/50 bg-primary/5 mb-8">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Aprovações Pendentes</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.pendingApprovals} barbearias aguardando aprovação
                    </p>
                  </div>
                </div>
                <Button>Revisar Agora</Button>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="barbershops">Barbearias</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="bookings">Agendamentos</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Barbearias Recentes</CardTitle>
                    <CardDescription>Últimas barbearias cadastradas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockBarbershops.slice(0, 3).map((barbershop) => (
                        <div
                          key={barbershop.id}
                          className="flex items-center justify-between p-3 border border-border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={barbershop.images[0] || "/placeholder.svg"} />
                              <AvatarFallback>{barbershop.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm">{barbershop.name}</p>
                              <p className="text-xs text-muted-foreground">{barbershop.address}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/barbershop/${barbershop.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Atividade Recente</CardTitle>
                    <CardDescription>Últimas ações na plataforma</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Nova barbearia aprovada</p>
                          <p className="text-xs text-muted-foreground">Urban Cuts foi aprovada</p>
                          <p className="text-xs text-muted-foreground mt-1">Há 2 horas</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Novos usuários cadastrados</p>
                          <p className="text-xs text-muted-foreground">15 novos clientes hoje</p>
                          <p className="text-xs text-muted-foreground mt-1">Há 5 horas</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Pico de agendamentos</p>
                          <p className="text-xs text-muted-foreground">50 agendamentos nas últimas 24h</p>
                          <p className="text-xs text-muted-foreground mt-1">Ontem</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Barbershops Tab */}
            <TabsContent value="barbershops">
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Todas as Barbearias</CardTitle>
                      <CardDescription>Gerencie as barbearias da plataforma</CardDescription>
                    </div>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar barbearia..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Barbearia</TableHead>
                        <TableHead>Endereço</TableHead>
                        <TableHead>Avaliação</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockBarbershops.map((barbershop) => (
                        <TableRow key={barbershop.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={barbershop.images[0] || "/placeholder.svg"} />
                                <AvatarFallback>{barbershop.name[0]}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{barbershop.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{barbershop.address}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-semibold">{barbershop.rating}</span>
                              <span className="text-xs text-muted-foreground">({barbershop.reviewCount})</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Ativa</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/barbershop/${barbershop.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button size="sm" variant="outline">
                                <Ban className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Gerenciar Usuários</CardTitle>
                  <CardDescription>Visualize e gerencie todos os usuários da plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    Funcionalidade de gerenciamento de usuários em desenvolvimento
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Todos os Agendamentos</CardTitle>
                  <CardDescription>Monitore os agendamentos da plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Horário</TableHead>
                        <TableHead>Barbearia</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockBookings.slice(0, 5).map((booking) => {
                        const barbershop = mockBarbershops.find((b) => b.id === booking.barbershopId)
                        return (
                          <TableRow key={booking.id}>
                            <TableCell>{booking.date.toLocaleDateString("pt-BR")}</TableCell>
                            <TableCell>{booking.time}</TableCell>
                            <TableCell>{barbershop?.name}</TableCell>
                            <TableCell>
                              {booking.status === "confirmed" && (
                                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Confirmado</Badge>
                              )}
                              {booking.status === "pending" && <Badge variant="secondary">Pendente</Badge>}
                              {booking.status === "completed" && (
                                <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                                  Concluído
                                </Badge>
                              )}
                              {booking.status === "cancelled" && <Badge variant="destructive">Cancelado</Badge>}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
