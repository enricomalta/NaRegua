"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { getBarbershops, getEmployeesByBarbershop, updateBarbershop } from "@/lib/firebase-service"
import { MapPin, Phone, Plus, Trash2, Edit, DollarSign, Clock } from "lucide-react"
import type { Barbershop, BarbershopEmployee, EmployeePermissions, EmployeeRole, Service, WorkingHours } from "@/lib/types"

const dayOrder: Array<keyof WorkingHours> = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]

const dayLabels: Record<keyof WorkingHours, string> = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
}

const ownerPermissions: EmployeePermissions = {
  viewBookings: true,
  createBookings: true,
  editBookings: true,
  cancelBookings: true,
  viewServices: true,
  createServices: true,
  editServices: true,
  deleteServices: true,
  viewEmployees: true,
  inviteEmployees: true,
  editEmployees: true,
  removeEmployees: true,
  viewReports: true,
  viewRevenue: true,
  editBarbershop: true,
  manageBarbershop: true,
}

const managerPermissions: EmployeePermissions = {
  ...ownerPermissions,
  removeEmployees: false,
  manageBarbershop: false,
}

const barberPermissions: EmployeePermissions = {
  viewBookings: true,
  createBookings: true,
  editBookings: true,
  cancelBookings: true,
  viewServices: true,
  createServices: false,
  editServices: false,
  deleteServices: false,
  viewEmployees: false,
  inviteEmployees: false,
  editEmployees: false,
  removeEmployees: false,
  viewReports: false,
  viewRevenue: false,
  editBarbershop: false,
  manageBarbershop: false,
}

const receptionistPermissions: EmployeePermissions = {
  viewBookings: true,
  createBookings: true,
  editBookings: true,
  cancelBookings: true,
  viewServices: true,
  createServices: false,
  editServices: false,
  deleteServices: false,
  viewEmployees: false,
  inviteEmployees: false,
  editEmployees: false,
  removeEmployees: false,
  viewReports: false,
  viewRevenue: false,
  editBarbershop: false,
  manageBarbershop: false,
}

function getPermissionsByRole(role: EmployeeRole): EmployeePermissions {
  if (role === "owner") return ownerPermissions
  if (role === "manager") return managerPermissions
  if (role === "barber") return barberPermissions
  return receptionistPermissions
}

function ensureWorkingHours(workingHours?: Partial<WorkingHours>): WorkingHours {
  return {
    monday: workingHours?.monday ?? [],
    tuesday: workingHours?.tuesday ?? [],
    wednesday: workingHours?.wednesday ?? [],
    thursday: workingHours?.thursday ?? [],
    friday: workingHours?.friday ?? [],
    saturday: workingHours?.saturday ?? [],
    sunday: workingHours?.sunday ?? [],
  }
}

function buildFullAddress(address: {
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}): string {
  const streetPart = [address.street, address.number].filter(Boolean).join(", ")
  const cityPart = [address.city, address.state].filter(Boolean).join(", ")
  return [streetPart, address.neighborhood, cityPart, address.zipCode].filter(Boolean).join(" - ")
}

export default function ManageBarbershopPage() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const [barbershop, setBarbershop] = useState<Barbershop | null>(null)
  const [employees, setEmployees] = useState<BarbershopEmployee[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const [savingInfo, setSavingInfo] = useState(false)
  const [savingServices, setSavingServices] = useState(false)
  const [savingHours, setSavingHours] = useState(false)
  const [savingEmployees, setSavingEmployees] = useState(false)

  const [selectedTab, setSelectedTab] = useState("info")
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)

  const [infoForm, setInfoForm] = useState({
    name: "",
    description: "",
    phone: "",
    latitude: "",
    longitude: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  })

  const [services, setServices] = useState<Service[]>([])
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
  })

  const [workingHours, setWorkingHours] = useState<WorkingHours>(ensureWorkingHours())

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    phone: "",
    role: "barber" as EmployeeRole,
  })

  const getRoleBadge = (role: EmployeeRole) => {
    const roleLabels: Record<EmployeeRole, { label: string; variant: "default" | "secondary" | "outline" }> = {
      owner: { label: "Proprietario", variant: "default" },
      manager: { label: "Gerente", variant: "secondary" },
      barber: { label: "Barbeiro", variant: "outline" },
      receptionist: { label: "Recepcionista", variant: "outline" },
    }

    const config = roleLabels[role]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setLoadingData(false)
        return
      }

      try {
        setLoadingData(true)
        const allBarbershops = await getBarbershops()
        const userBarbershop = allBarbershops.find((b) => b.ownerId === user.id)

        if (!userBarbershop) {
          setBarbershop(null)
          return
        }

        setBarbershop(userBarbershop)
        setInfoForm({
          name: userBarbershop.name ?? "",
          description: userBarbershop.description ?? "",
          phone: userBarbershop.phone ?? "",
          latitude: Number.isFinite(userBarbershop.latitude) ? String(userBarbershop.latitude) : "",
          longitude: Number.isFinite(userBarbershop.longitude) ? String(userBarbershop.longitude) : "",
          street: userBarbershop.address?.street ?? "",
          number: userBarbershop.address?.number ?? "",
          neighborhood: userBarbershop.address?.neighborhood ?? "",
          city: userBarbershop.address?.city ?? "",
          state: userBarbershop.address?.state ?? "",
          zipCode: userBarbershop.address?.zipCode ?? "",
        })

        setServices(Array.isArray(userBarbershop.services) ? userBarbershop.services : [])
        setWorkingHours(ensureWorkingHours(userBarbershop.workingHours))

        const liveEmployees = await getEmployeesByBarbershop(userBarbershop.id)
        setEmployees(liveEmployees)
      } catch (error) {
        console.error("Erro ao carregar dados da barbearia:", error)
        toast({
          title: "Erro ao carregar dados",
          description: "Nao foi possivel carregar os dados da sua barbearia.",
          variant: "destructive",
        })
      } finally {
        setLoadingData(false)
      }
    }

    if (!authLoading) {
      loadData()
    }
  }, [authLoading, user, toast])

  const handleSaveInfo = async () => {
    if (!barbershop) return

    try {
      setSavingInfo(true)
      const parsedLat = Number.parseFloat(infoForm.latitude)
      const parsedLng = Number.parseFloat(infoForm.longitude)

      const address = {
        street: infoForm.street,
        number: infoForm.number,
        neighborhood: infoForm.neighborhood,
        city: infoForm.city,
        state: infoForm.state,
        zipCode: infoForm.zipCode,
        fullAddress: buildFullAddress({
          street: infoForm.street,
          number: infoForm.number,
          neighborhood: infoForm.neighborhood,
          city: infoForm.city,
          state: infoForm.state,
          zipCode: infoForm.zipCode,
        }),
      }

      const payload: Partial<Barbershop> = {
        name: infoForm.name,
        description: infoForm.description,
        phone: infoForm.phone,
        latitude: Number.isFinite(parsedLat) ? parsedLat : barbershop.latitude,
        longitude: Number.isFinite(parsedLng) ? parsedLng : barbershop.longitude,
        address,
      }

      await updateBarbershop(barbershop.id, payload)
      setBarbershop((prev) => (prev ? { ...prev, ...payload } : prev))
      toast({ title: "Informacoes salvas", description: "Dados da barbearia atualizados com sucesso." })
    } catch (error) {
      console.error("Erro ao salvar informacoes:", error)
      toast({
        title: "Erro ao salvar",
        description: "Nao foi possivel salvar as informacoes.",
        variant: "destructive",
      })
    } finally {
      setSavingInfo(false)
    }
  }

  const handleAddService = async () => {
    if (!barbershop) return

    const price = Number.parseFloat(newService.price)
    const duration = Number.parseInt(newService.duration, 10)

    if (!newService.name.trim() || !Number.isFinite(price) || !Number.isFinite(duration) || duration <= 0) {
      toast({
        title: "Dados invalidos",
        description: "Preencha nome, preco e duracao corretamente.",
        variant: "destructive",
      })
      return
    }

    const nextService: Service = {
      id: crypto.randomUUID(),
      name: newService.name.trim(),
      description: newService.description.trim(),
      price,
      duration,
    }

    const nextServices = [...services, nextService]

    try {
      setSavingServices(true)
      await updateBarbershop(barbershop.id, { services: nextServices })
      setServices(nextServices)
      setBarbershop((prev) => (prev ? { ...prev, services: nextServices } : prev))
      setIsAddServiceOpen(false)
      setNewService({ name: "", description: "", price: "", duration: "" })
      toast({ title: "Servico adicionado", description: "Novo servico salvo no banco." })
    } catch (error) {
      console.error("Erro ao adicionar servico:", error)
      toast({
        title: "Erro ao salvar servico",
        description: "Nao foi possivel salvar o novo servico.",
        variant: "destructive",
      })
    } finally {
      setSavingServices(false)
    }
  }

  const handleRemoveService = async (serviceId: string) => {
    if (!barbershop) return

    const nextServices = services.filter((service) => service.id !== serviceId)

    try {
      setSavingServices(true)
      await updateBarbershop(barbershop.id, { services: nextServices })
      setServices(nextServices)
      setBarbershop((prev) => (prev ? { ...prev, services: nextServices } : prev))
      toast({ title: "Servico removido", description: "Lista de servicos atualizada." })
    } catch (error) {
      console.error("Erro ao remover servico:", error)
      toast({
        title: "Erro ao remover",
        description: "Nao foi possivel remover o servico.",
        variant: "destructive",
      })
    } finally {
      setSavingServices(false)
    }
  }

  const updateDayTime = (day: keyof WorkingHours, field: "start" | "end", value: string) => {
    setWorkingHours((prev) => {
      const current = prev[day][0] ?? { start: "09:00", end: "18:00" }
      return {
        ...prev,
        [day]: [{ ...current, [field]: value }],
      }
    })
  }

  const toggleDayOpen = (day: keyof WorkingHours, open: boolean) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: open ? (prev[day].length > 0 ? prev[day] : [{ start: "09:00", end: "18:00" }]) : [],
    }))
  }

  const handleSaveHours = async () => {
    if (!barbershop) return

    try {
      setSavingHours(true)
      await updateBarbershop(barbershop.id, { workingHours })
      setBarbershop((prev) => (prev ? { ...prev, workingHours } : prev))
      toast({ title: "Horarios salvos", description: "Horarios de funcionamento atualizados." })
    } catch (error) {
      console.error("Erro ao salvar horarios:", error)
      toast({
        title: "Erro ao salvar horarios",
        description: "Nao foi possivel atualizar os horarios.",
        variant: "destructive",
      })
    } finally {
      setSavingHours(false)
    }
  }

  const handleAddEmployee = async () => {
    if (!barbershop) return

    if (!newEmployee.name.trim() || !newEmployee.email.trim()) {
      toast({
        title: "Dados invalidos",
        description: "Informe ao menos nome e email do funcionario.",
        variant: "destructive",
      })
      return
    }

    const newEmployeeEntry: BarbershopEmployee = {
      userId: crypto.randomUUID(),
      name: newEmployee.name.trim(),
      email: newEmployee.email.trim(),
      phone: newEmployee.phone.trim() || undefined,
      role: newEmployee.role,
      joinedAt: new Date(),
      isActive: true,
      permissions: getPermissionsByRole(newEmployee.role),
    }

    const nextEmployees = [...employees, newEmployeeEntry]
    const nextEmployeesMap = Object.fromEntries(nextEmployees.map((employee) => [employee.userId, employee]))

    try {
      setSavingEmployees(true)
      await updateBarbershop(barbershop.id, { employees: nextEmployeesMap as any })
      setEmployees(nextEmployees)
      setBarbershop((prev) => (prev ? { ...prev, employees: nextEmployees as any } : prev))
      setIsAddEmployeeOpen(false)
      setNewEmployee({ name: "", email: "", phone: "", role: "barber" })
      toast({ title: "Funcionario adicionado", description: "Funcionario salvo no banco com sucesso." })
    } catch (error) {
      console.error("Erro ao adicionar funcionario:", error)
      toast({
        title: "Erro ao salvar funcionario",
        description: "Nao foi possivel salvar o funcionario.",
        variant: "destructive",
      })
    } finally {
      setSavingEmployees(false)
    }
  }

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-16 pb-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">Carregando dados da barbearia...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!barbershop) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-16 pb-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">Voce ainda nao cadastrou uma barbearia.</p>
            <Button asChild className="mt-4">
              <Link href="/barber/setup">Cadastrar Barbearia</Link>
            </Button>
          </div>
        </main>
      </div>
    )
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
              <TabsTrigger value="info">Informacoes</TabsTrigger>
              <TabsTrigger value="services">Servicos</TabsTrigger>
              <TabsTrigger value="hours">Horarios</TabsTrigger>
              <TabsTrigger value="employees">Funcionarios</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Informacoes da Barbearia</CardTitle>
                  <CardDescription>Atualize os dados da sua barbearia</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Barbearia</Label>
                    <Input id="name" value={infoForm.name} onChange={(e) => setInfoForm((prev) => ({ ...prev, name: e.target.value }))} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descricao</Label>
                    <Textarea
                      id="description"
                      value={infoForm.description}
                      onChange={(e) => setInfoForm((prev) => ({ ...prev, description: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={infoForm.phone}
                          onChange={(e) => setInfoForm((prev) => ({ ...prev, phone: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="street">Rua</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="street"
                          value={infoForm.street}
                          onChange={(e) => setInfoForm((prev) => ({ ...prev, street: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="number">Numero</Label>
                      <Input id="number" value={infoForm.number} onChange={(e) => setInfoForm((prev) => ({ ...prev, number: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        value={infoForm.neighborhood}
                        onChange={(e) => setInfoForm((prev) => ({ ...prev, neighborhood: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input id="city" value={infoForm.city} onChange={(e) => setInfoForm((prev) => ({ ...prev, city: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">UF</Label>
                      <Input id="state" value={infoForm.state} onChange={(e) => setInfoForm((prev) => ({ ...prev, state: e.target.value }))} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input id="zipCode" value={infoForm.zipCode} onChange={(e) => setInfoForm((prev) => ({ ...prev, zipCode: e.target.value }))} />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="0.0001"
                        value={infoForm.latitude}
                        onChange={(e) => setInfoForm((prev) => ({ ...prev, latitude: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="0.0001"
                        value={infoForm.longitude}
                        onChange={(e) => setInfoForm((prev) => ({ ...prev, longitude: e.target.value }))}
                      />
                    </div>
                  </div>

                  <Button className="w-full md:w-auto" onClick={handleSaveInfo} disabled={savingInfo}>
                    {savingInfo ? "Salvando..." : "Salvar Alteracoes"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services">
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Servicos</CardTitle>
                      <CardDescription>Gerencie os servicos oferecidos</CardDescription>
                    </div>
                    <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Servico
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Novo Servico</DialogTitle>
                          <DialogDescription>Adicione um novo servico a sua barbearia</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="service-name">Nome do Servico</Label>
                            <Input
                              id="service-name"
                              value={newService.name}
                              onChange={(e) => setNewService((prev) => ({ ...prev, name: e.target.value }))}
                              placeholder="Ex: Corte Masculino"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="service-description">Descricao</Label>
                            <Textarea
                              id="service-description"
                              value={newService.description}
                              onChange={(e) => setNewService((prev) => ({ ...prev, description: e.target.value }))}
                              placeholder="Descreva o servico"
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="service-price">Preco (R$)</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="service-price"
                                  type="number"
                                  value={newService.price}
                                  onChange={(e) => setNewService((prev) => ({ ...prev, price: e.target.value }))}
                                  placeholder="50"
                                  className="pl-10"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="service-duration">Duracao (min)</Label>
                              <div className="relative">
                                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="service-duration"
                                  type="number"
                                  value={newService.duration}
                                  onChange={(e) => setNewService((prev) => ({ ...prev, duration: e.target.value }))}
                                  placeholder="45"
                                  className="pl-10"
                                />
                              </div>
                            </div>
                          </div>
                          <Button className="w-full" onClick={handleAddService} disabled={savingServices}>
                            {savingServices ? "Salvando..." : "Adicionar Servico"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{service.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-primary font-semibold">R$ {service.price}</span>
                            <span className="text-muted-foreground">{service.duration} min</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" disabled>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleRemoveService(service.id)} disabled={savingServices}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hours">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Horarios de Funcionamento</CardTitle>
                  <CardDescription>Configure os horarios de atendimento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dayOrder.map((day) => {
                      const slots = workingHours[day] ?? []
                      const daySlot = slots[0] ?? { start: "09:00", end: "18:00" }

                      return (
                        <div key={day} className="flex flex-col gap-4 p-4 border border-border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Switch checked={slots.length > 0} onCheckedChange={(checked) => toggleDayOpen(day, checked)} />
                            <span className="font-medium w-32">{dayLabels[day]}</span>
                          </div>
                          {slots.length > 0 && (
                            <div className="space-y-4 pl-12">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Label className="w-20">Abertura:</Label>
                                <Input value={daySlot.start} className="w-24" type="time" onChange={(e) => updateDayTime(day, "start", e.target.value)} />
                                <span className="text-muted-foreground">ate</span>
                                <Input value={daySlot.end} className="w-24" type="time" onChange={(e) => updateDayTime(day, "end", e.target.value)} />
                              </div>
                            </div>
                          )}
                          {slots.length === 0 && <span className="text-muted-foreground pl-12">Fechado</span>}
                        </div>
                      )
                    })}
                  </div>
                  <Button className="w-full md:w-auto mt-6" onClick={handleSaveHours} disabled={savingHours}>
                    {savingHours ? "Salvando..." : "Salvar Horarios"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="employees">
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Funcionarios</CardTitle>
                      <CardDescription>Gerencie sua equipe e permissoes</CardDescription>
                    </div>
                    <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Funcionario
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Novo Funcionario</DialogTitle>
                          <DialogDescription>Adicione um membro a sua equipe</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="employee-name">Nome</Label>
                            <Input
                              id="employee-name"
                              value={newEmployee.name}
                              onChange={(e) => setNewEmployee((prev) => ({ ...prev, name: e.target.value }))}
                              placeholder="Nome completo"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="employee-email">Email</Label>
                            <Input
                              id="employee-email"
                              type="email"
                              value={newEmployee.email}
                              onChange={(e) => setNewEmployee((prev) => ({ ...prev, email: e.target.value }))}
                              placeholder="email@exemplo.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="employee-phone">Telefone</Label>
                            <Input
                              id="employee-phone"
                              value={newEmployee.phone}
                              onChange={(e) => setNewEmployee((prev) => ({ ...prev, phone: e.target.value }))}
                              placeholder="(11) 98765-4321"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="employee-role">Cargo</Label>
                            <Select
                              value={newEmployee.role}
                              onValueChange={(value) => setNewEmployee((prev) => ({ ...prev, role: value as EmployeeRole }))}
                            >
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
                          <Button className="w-full" onClick={handleAddEmployee} disabled={savingEmployees}>
                            {savingEmployees ? "Salvando..." : "Adicionar Funcionario"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {employees.map((employee) => (
                      <div key={employee.userId} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-4 flex-1">
                          <Avatar>
                            <AvatarImage src={employee.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{employee.name?.[0] || "?"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{employee.name}</h3>
                              {getRoleBadge(employee.role)}
                            </div>
                            <p className="text-sm text-muted-foreground">{employee.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Membro desde {new Date(employee.joinedAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        {employee.role !== "owner" && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" disabled>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" disabled>
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
