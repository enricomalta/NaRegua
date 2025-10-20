"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { createBarbershopWithOwner } from "@/lib/firebase-service"
import { getAddressByZipCode, getCoordinatesByZipCode } from "@/lib/geolocation-utils"
import { RobustMap } from "@/components/robust-map"
import { SimpleLocationPicker } from "@/components/simple-location-picker"
import type { Service, WorkingHours } from "@/lib/types"

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const
const dayNames = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]

export default function BarberSetupPage() {
  const router = useRouter()
  const { user, firebaseUser, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Basic Info
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [phone, setPhone] = useState("")
  
  // Address Info
  const [street, setStreet] = useState("")
  const [number, setNumber] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zipCode, setZipCode] = useState("")
  
  // Location
  const [latitude, setLatitude] = useState(-21.7545)
  const [longitude, setLongitude] = useState(-43.4393)

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

  const [useMapFallback, setUseMapFallback] = useState(false)
  const [mapErrorMessage, setMapErrorMessage] = useState<string | null>(null)
  const [mapRetryKey, setMapRetryKey] = useState(0)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login")
      } else if (user.role !== "barber") {
        router.replace("/")
      }
    }
  }, [authLoading, user, router])

  if (authLoading || !user || user?.role !== "barber") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  // Buscar endereço automaticamente quando CEP for preenchido
  const handleZipCodeChange = async (value: string) => {
    setZipCode(value)
    
    // Se o CEP tem 8 dígitos, buscar endereço
    const cleanZip = value.replace(/\D/g, '')
    if (cleanZip.length === 8) {
      try {
        const addressData = await getAddressByZipCode(cleanZip)
        if (addressData) {
          setStreet(addressData.street)
          setNeighborhood(addressData.neighborhood)
          setCity(addressData.city)
          setState(addressData.state)
          
          // Buscar coordenadas também
          const coordinates = await getCoordinatesByZipCode(cleanZip)
          if (coordinates) {
            setLatitude(coordinates.lat)
            setLongitude(coordinates.lng)
          }
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
      }
    }
  }

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
    setError("")

    if (!user) {
      setError("Usuário não autenticado")
      setLoading(false)
      return
    }

    try {
      // Criar endereço completo formatado
      const fullAddress = `${street}, ${number}, ${neighborhood}, ${city}, ${state} - ${zipCode}`
      
      const barbershopData = {
        name,
        description,
        ownerId: firebaseUser?.uid || "", // ID do usuário logado
        address: {
          street,
          number,
          neighborhood,
          city,
          state,
          zipCode,
          fullAddress
        },
        latitude,
        longitude,
        phone,
        images: [], // Inicialmente vazio, pode ser adicionado depois
        rating: 0,
        reviewCount: 0,
        services: services.filter(s => s.name.trim() !== ""), // Filtrar serviços vazios
        workingHours,
        createdAt: new Date(),
      }

      // Dados do usuário para associar como owner
      const ownerData = {
        name: firebaseUser?.displayName || user?.name || firebaseUser?.email || "Nome não informado",
        email: firebaseUser?.email || "",
        avatar: firebaseUser?.photoURL || undefined,
        phone: firebaseUser?.phoneNumber || undefined
      }

      const barbershopId = await createBarbershopWithOwner(barbershopData, firebaseUser?.uid || "", ownerData)
      console.log("Barbearia criada com ID:", barbershopId)
      
      router.push("/barber/dashboard")
    } catch (error: any) {
      console.error("Erro ao criar barbearia:", error)
      setError(error.message || "Erro ao criar barbearia. Tente novamente.")
    } finally {
      setLoading(false)
    }
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

          {error && (
            <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

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

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Rua/Avenida *</Label>
                    <Input
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Ex: Rua das Flores"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number">Número *</Label>
                    <Input
                      id="number"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="Ex: 123"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro *</Label>
                    <Input
                      id="neighborhood"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Ex: Centro"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">CEP * <span className="text-xs text-muted-foreground">(preencha para busca automática)</span></Label>
                    <Input
                      id="zipCode"
                      value={zipCode}
                      onChange={(e) => handleZipCodeChange(e.target.value)}
                      placeholder="Ex: 01234-567"
                      maxLength={9}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: São Paulo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado *</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Ex: SP"
                      required
                    />
                  </div>
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

            <div className="space-y-3">
              {useMapFallback ? (
                <>
                  <SimpleLocationPicker
                    onLocationChange={(lat: number, lng: number) => {
                      setLatitude(lat)
                      setLongitude(lng)
                    }}
                    initialLat={latitude}
                    initialLng={longitude}
                    address={`${street} ${number}, ${neighborhood}, ${city}, ${state}`}
                  />
                  {mapErrorMessage && (
                    <p className="text-xs text-destructive">
                      {`Não foi possível carregar o mapa interativo: ${mapErrorMessage}`}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setUseMapFallback(false)
                        setMapErrorMessage(null)
                        setMapRetryKey((prev) => prev + 1)
                      }}
                    >
                      Tentar carregar o mapa interativo novamente
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <RobustMap
                    key={mapRetryKey}
                    onLocationChange={(lat: number, lng: number) => {
                      setLatitude(lat)
                      setLongitude(lng)
                    }}
                    initialLat={latitude}
                    initialLng={longitude}
                    address={`${street} ${number}, ${neighborhood}, ${city}, ${state}`}
                    onReady={() => {
                      setUseMapFallback(false)
                      setMapErrorMessage(null)
                    }}
                    onError={(error) => {
                      setMapErrorMessage(typeof error === "string" ? error : error.message)
                      setUseMapFallback(true)
                    }}
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setUseMapFallback(true)
                        setMapErrorMessage(null)
                      }}
                    >
                      Preferir inserir coordenadas manualmente
                    </Button>
                  </div>
                </>
              )}
            </div>

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
