"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { mockBarbershops, mockEmployees } from "@/lib/mock-data"
import { MapPin, Phone, Plus, Trash2, Edit, DollarSign, Clock } from "lucide-react"
import Link from "next/link"
import type { EmployeeRole } from "@/lib/types"

export default function ManageBarbershopPage() {
  const barberId = "barber1"
  const barbershop = mockBarbershops.find((b) => b.ownerId === barberId)
  const employees = mockEmployees.filter((e) => e.barbershopId === barbershop?.id)

  const [selectedTab, setSelectedTab] = useState("info")
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)

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

  const getRoleBadge = (role: EmployeeRole) => {
    const roleLabels = {
      owner: { label: "Proprietário", variant: "default" as const },
      manager: { label: "Gerente", variant: "secondary" as const },
      barber: { label: "Barbeiro", variant: "outline" as const },
      receptionist: { label: "Recepcionista", variant: "outline" as const },
    }
    const config = roleLabels[role]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-16 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Gerenciar Barbearia</h1>
              <p className="text-muted-foreground">{barbershop.name}</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/barber/dashboard">Voltar ao Dashboard</Link>
            </Button>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="services">Serviços</TabsTrigger>
              <TabsTrigger value="hours">Horários</TabsTrigger>
              <TabsTrigger value="employees">Funcionários</TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Informações da Barbearia</CardTitle>
                  <CardDescription>Atualize os dados da sua barbearia</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Barbearia</Label>
                    <Input id="name" defaultValue={barbershop.name} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea id="description" defaultValue={barbershop.description} rows={4} />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="phone" defaultValue={barbershop.phone} className="pl-10" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="address" defaultValue={barbershop.address} className="pl-10" />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input id="latitude" type="number" step="0.0001" defaultValue={barbershop.latitude} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input id="longitude" type="number" step="0.0001" defaultValue={barbershop.longitude} />
                    </div>
                  </div>

                  <Button className="w-full md:w-auto">Salvar Alterações</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services">
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Serviços</CardTitle>
                      <CardDescription>Gerencie os serviços oferecidos</CardDescription>
                    </div>
                    <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Serviço
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Novo Serviço</DialogTitle>
                          <DialogDescription>Adicione um novo serviço à sua barbearia</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="service-name">Nome do Serviço</Label>
                            <Input id="service-name" placeholder="Ex: Corte Masculino" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="service-description">Descrição</Label>
                            <Textarea id="service-description" placeholder="Descreva o serviço" rows={3} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="service-price">Preço (R$)</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input id="service-price" type="number" placeholder="50" className="pl-10" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="service-duration">Duração (min)</Label>
                              <div className="relative">
                                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input id="service-duration" type="number" placeholder="45" className="pl-10" />
                              </div>
                            </div>
                          </div>
                          <Button className="w-full" onClick={() => setIsAddServiceOpen(false)}>
                            Adicionar Serviço
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {barbershop.services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{service.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-primary font-semibold">R$ {service.price}</span>
                            <span className="text-muted-foreground">{service.duration} min</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Hours Tab */}
            <TabsContent value="hours">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Horários de Funcionamento</CardTitle>
                  <CardDescription>Configure os horários de atendimento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(barbershop.workingHours).map(([day, slots]) => {
                      const dayLabels: Record<string, string> = {
                        monday: "Segunda-feira",
                        tuesday: "Terça-feira",
                        wednesday: "Quarta-feira",
                        thursday: "Quinta-feira",
                        friday: "Sexta-feira",
                        saturday: "Sábado",
                        sunday: "Domingo",
                      }
                      return (
                        <div key={day} className="flex flex-col gap-4 p-4 border border-border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Switch defaultChecked={slots.length > 0} />
                            <span className="font-medium w-32">{dayLabels[day]}</span>
                          </div>
                          {slots.length > 0 && (
                            <div className="space-y-4 pl-12">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Label className="w-20">Abertura:</Label>
                                <Input defaultValue={slots[0].start} className="w-24" type="time" />
                                <span className="text-muted-foreground">até</span>
                                <Input defaultValue={slots[0].end} className="w-24" type="time" />
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                <Label className="w-20">Almoço:</Label>
                                <Select defaultValue="12:00-13:00">
                                  <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Horário de almoço" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">Sem intervalo</SelectItem>
                                    <SelectItem value="11:30-12:30">11:30 - 12:30</SelectItem>
                                    <SelectItem value="12:00-13:00">12:00 - 13:00</SelectItem>
                                    <SelectItem value="12:30-13:30">12:30 - 13:30</SelectItem>
                                    <SelectItem value="13:00-14:00">13:00 - 14:00</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                          {slots.length === 0 && <span className="text-muted-foreground pl-12">Fechado</span>}
                        </div>
                      )
                    })}
                  </div>
                  <Button className="w-full md:w-auto mt-6">Salvar Horários</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Employees Tab */}
            <TabsContent value="employees">
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Funcionários</CardTitle>
                      <CardDescription>Gerencie sua equipe e permissões</CardDescription>
                    </div>
                    <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Funcionário
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Novo Funcionário</DialogTitle>
                          <DialogDescription>Adicione um membro à sua equipe</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="employee-name">Nome</Label>
                            <Input id="employee-name" placeholder="Nome completo" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="employee-email">Email</Label>
                            <Input id="employee-email" type="email" placeholder="email@exemplo.com" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="employee-phone">Telefone</Label>
                            <Input id="employee-phone" placeholder="(11) 98765-4321" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="employee-role">Cargo</Label>
                            <Select>
                              <SelectTrigger id="employee-role">
                                <SelectValue placeholder="Selecione o cargo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="manager">Gerente</SelectItem>
                                <SelectItem value="barber">Barbeiro</SelectItem>
                                <SelectItem value="receptionist">Recepcionista</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-3">
                            <Label>Permissões</Label>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Gerenciar agendamentos</span>
                                <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Gerenciar serviços</span>
                                <Switch />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Gerenciar funcionários</span>
                                <Switch />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Ver relatórios</span>
                                <Switch />
                              </div>
                            </div>
                          </div>
                          <Button className="w-full" onClick={() => setIsAddEmployeeOpen(false)}>
                            Adicionar Funcionário
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {employees.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <Avatar>
                            <AvatarImage src={employee.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{employee.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{employee.name}</h3>
                              {getRoleBadge(employee.role)}
                            </div>
                            <p className="text-sm text-muted-foreground">{employee.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Membro desde {employee.joinedAt.toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        {employee.role !== "owner" && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
