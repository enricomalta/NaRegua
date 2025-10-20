"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { useAuth } from "@/lib/auth-context"
import { getBarbershopById, createBooking, getBookingsByBarbershop } from "@/lib/firebase-service"
import { generateTimeSlots, getDayOfWeek, formatDate } from "@/lib/utils"
import { CalendarIcon, Clock, Scissors, MapPin, ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import type { Service, Barbershop, Booking } from "@/lib/types"

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null)
  const [existingBookings, setExistingBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [barbershopData, bookingsData] = await Promise.all([
          getBarbershopById(id),
          getBookingsByBarbershop(id)
        ])
        
        if (!barbershopData) {
          notFound()
          return
        }
        
        setBarbershop(barbershopData)
        setExistingBookings(bookingsData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da barbearia.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, toast])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-16 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </main>
      </div>
    )
  }

  if (!barbershop) {
    notFound()
  }

  // Check if user is authenticated
  if (!user) {
    toast({
      title: "Login necessário",
      description: "Você precisa estar logado para fazer um agendamento.",
      variant: "destructive"
    })
    router.push("/login")
    return null
  }

  // Generate available time slots based on selected date and service
  const availableTimeSlots =
    selectedDate && selectedService
      ? (() => {
          const dayOfWeek = getDayOfWeek(selectedDate)
          const workingHours = barbershop.workingHours[dayOfWeek]
          if (workingHours.length === 0) return []
          
          // Generate all possible time slots
          const allSlots = generateTimeSlots(workingHours[0].start, workingHours[0].end, selectedService.duration)
          
          // Filter out booked slots
          const bookedTimes = existingBookings
            .filter(booking => {
              const bookingDate = booking.date.toDateString()
              const selectedDateStr = selectedDate.toDateString()
              return bookingDate === selectedDateStr && booking.status !== 'cancelled'
            })
            .map(booking => booking.time)
          
          return allSlots.filter(slot => !bookedTimes.includes(slot))
        })()
      : []

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !user) return

    setBookingLoading(true)

    try {
      const bookingData = {
        clientId: user.id,
        barbershopId: id,
        serviceId: selectedService.id,
        date: selectedDate,
        time: selectedTime,
        status: "pending" as const,
        createdAt: new Date()
      }

      const bookingId = await createBooking(bookingData)
      
      toast({
        title: "Agendamento criado!",
        description: "Seu agendamento foi criado com sucesso. Aguarde a confirmação."
      })

      router.push(`/booking/confirmation?id=${bookingId}`)
    } catch (error) {
      console.error("Erro ao criar agendamento:", error)
      toast({
        title: "Erro ao agendar",
        description: "Não foi possível criar o agendamento. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setBookingLoading(false)
    }
  }

  const isBookingComplete = selectedService && selectedDate && selectedTime

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-16 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link href={`/barbershop/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para perfil
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Agendar Horário</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{barbershop.name}</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Booking Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Select Service */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scissors className="h-5 w-5" />
                    Escolha o Serviço
                  </CardTitle>
                  <CardDescription>Selecione o serviço desejado</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={selectedService?.id}
                    onValueChange={(value) => {
                      const service = barbershop.services.find((s) => s.id === value)
                      setSelectedService(service || null)
                      setSelectedTime("") // Reset time when service changes
                    }}
                  >
                    <div className="space-y-3">
                      {barbershop.services.map((service) => (
                        <div
                          key={service.id}
                          className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                            selectedService?.id === service.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => {
                            setSelectedService(service)
                            setSelectedTime("")
                          }}
                        >
                          <RadioGroupItem value={service.id} id={service.id} />
                          <Label htmlFor={service.id} className="flex-1 cursor-pointer">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-semibold">{service.name}</p>
                                <p className="text-sm text-muted-foreground">{service.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">{service.duration} minutos</p>
                              </div>
                              <p className="font-semibold text-primary">R$ {service.price}</p>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Select Date */}
              {selectedService && (
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Escolha a Data
                    </CardTitle>
                    <CardDescription>Selecione o dia do agendamento</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date)
                        setSelectedTime("") // Reset time when date changes
                      }}
                      disabled={(date) => {
                        // Disable past dates
                        if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true
                        // Disable dates where barbershop is closed
                        const dayOfWeek = getDayOfWeek(date)
                        return barbershop.workingHours[dayOfWeek].length === 0
                      }}
                      className="rounded-md border border-border"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Select Time */}
              {selectedDate && selectedService && (
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Escolha o Horário
                    </CardTitle>
                    <CardDescription>Horários disponíveis para {formatDate(selectedDate)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {availableTimeSlots.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Nenhum horário disponível nesta data.</p>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {availableTimeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            onClick={() => setSelectedTime(time)}
                            className="h-12"
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="border-border/50 sticky top-20">
                <CardHeader>
                  <CardTitle>Resumo do Agendamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Barbearia</p>
                    <p className="font-semibold">{barbershop.name}</p>
                  </div>

                  {selectedService && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Serviço</p>
                      <p className="font-semibold">{selectedService.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedService.duration} minutos</p>
                    </div>
                  )}

                  {selectedDate && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Data</p>
                      <p className="font-semibold">{formatDate(selectedDate)}</p>
                    </div>
                  )}

                  {selectedTime && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Horário</p>
                      <p className="font-semibold">{selectedTime}</p>
                    </div>
                  )}

                  {selectedService && (
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">Total</p>
                        <p className="text-2xl font-bold text-primary">R$ {selectedService.price}</p>
                      </div>
                    </div>
                  )}

                  <Button onClick={handleBooking} disabled={!isBookingComplete || bookingLoading} className="w-full">
                    {bookingLoading ? "Confirmando..." : "Confirmar Agendamento"}
                  </Button>

                  {!isBookingComplete && (
                    <p className="text-xs text-center text-muted-foreground">
                      Selecione serviço, data e horário para continuar
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
