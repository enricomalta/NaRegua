"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X } from "lucide-react"
import type { Service, WorkingHours } from "@/lib/types"

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const
const dayNames = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]

export default function BarberSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Basic Info
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")

  // Services
  const [services, setServices] = useState<Service[]>([{ id: "1", name: "", description: "", price: 0, duration: 30 }])

  // Working Hours
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: [{ start: "09:00", end: "18:00" }],
    tuesday: [{ start: "09:00", end: "18:00" }],
    wednesday: [{ start: "09:00", end: "18:00" }],
    thursday: [{ start: "09:00", end: "18:00" }],
    friday: [{ start: "09:00", end: "18:00" }],
    saturday: [{ start: "09:00", end: "18:00" }],
    sunday: [],
  })

  const [activeDays, setActiveDays] = useState<Record<string, boolean>>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: false,
  })

  const addService = () => {
    setServices([...services, { id: Date.now().toString(), name: "", description: "", price: 0, duration: 30 }])
  }

  const removeService = (id: string) => {
    setServices(services.filter((s) => s.id !== id))
  }

  const updateService = (id: string, field: keyof Service, value: string | number) => {
    setServices(services.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const toggleDay = (day: (typeof daysOfWeek)[number]) => {
    const isActive = !activeDays[day]
    setActiveDays({ ...activeDays, [day]: isActive })
    if (isActive) {
      setWorkingHours({ ...workingHours, [day]: [{ start: "09:00", end: "18:00" }] })
    } else {
      setWorkingHours({ ...workingHours, [day]: [] })
    }
  }

  const updateWorkingHours = (day: (typeof daysOfWeek)[number], field: "start" | "end", value: string) => {
    setWorkingHours({
      ...workingHours,
      [day]: [{ ...workingHours[day][0], [field]: value }],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Mock submission - in production, this would call your API
    setTimeout(() => {
      router.push("/barber/dashboard")
    }, 1500)
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-16 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Cadastrar Barbearia</h1>
            <p className="text-muted-foreground">Preencha as informações da sua barbearia para começar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Dados principais da sua barbearia</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Barbearia *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Barbearia Clássica"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Conte um pouco sobre sua barbearia..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço Completo *</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, número, bairro, cidade, estado"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Serviços</CardTitle>
                <CardDescription>Adicione os serviços que você oferece</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {services.map((service, index) => (
                  <div key={service.id} className="p-4 border border-border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Serviço {index + 1}</h4>
                      {services.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeService(service.id)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome do Serviço *</Label>
                        <Input
                          value={service.name}
                          onChange={(e) => updateService(service.id, "name", e.target.value)}
                          placeholder="Ex: Corte Masculino"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Duração (minutos) *</Label>
                        <Input
                          type="number"
                          value={service.duration}
                          onChange={(e) => updateService(service.id, "duration", Number.parseInt(e.target.value))}
                          min="15"
                          step="15"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input
                        value={service.description}
                        onChange={(e) => updateService(service.id, "description", e.target.value)}
                        placeholder="Breve descrição do serviço"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Preço (R$) *</Label>
                      <Input
                        type="number"
                        value={service.price}
                        onChange={(e) => updateService(service.id, "price", Number.parseFloat(e.target.value))}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addService} className="w-full bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Serviço
                </Button>
              </CardContent>
            </Card>

            {/* Working Hours */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Horário de Funcionamento</CardTitle>
                <CardDescription>Defina os horários de atendimento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {daysOfWeek.map((day, index) => (
                  <div key={day} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-32">
                      <Checkbox
                        id={day}
                        checked={activeDays[day]}
                        onCheckedChange={() => toggleDay(day)}
                        className="data-[state=checked]:bg-primary"
                      />
                      <Label htmlFor={day} className="cursor-pointer">
                        {dayNames[index]}
                      </Label>
                    </div>

                    {activeDays[day] && (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="time"
                          value={workingHours[day][0]?.start || "09:00"}
                          onChange={(e) => updateWorkingHours(day, "start", e.target.value)}
                          className="w-32"
                        />
                        <span className="text-muted-foreground">até</span>
                        <Input
                          type="time"
                          value={workingHours[day][0]?.end || "18:00"}
                          onChange={(e) => updateWorkingHours(day, "end", e.target.value)}
                          className="w-32"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Salvando..." : "Cadastrar Barbearia"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
