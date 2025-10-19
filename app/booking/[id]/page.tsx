"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { mockBarbershops } from "@/lib/mock-data"
import { generateTimeSlots, getDayOfWeek, formatDate } from "@/lib/utils"
import { CalendarIcon, Clock, Scissors, MapPin, ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import Link from "next/link"
import type { Service } from "@/lib/types"

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const barbershop = mockBarbershops.find((b) => b.id === id)

  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [loading, setLoading] = useState(false)

  if (!barbershop) {
    notFound()
  }

  // Generate available time slots based on selected date and service
  const availableTimeSlots =
    selectedDate && selectedService
      ? (() => {
          const dayOfWeek = getDayOfWeek(selectedDate)
          const workingHours = barbershop.workingHours[dayOfWeek]
          if (workingHours.length === 0) return []
          return generateTimeSlots(workingHours[0].start, workingHours[0].end, selectedService.duration)
        })()
      : []

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return

    setLoading(true)

    // Mock booking - in production, this would call your API
    setTimeout(() => {
      router.push(
        `/booking/confirmation?barbershop=${barbershop.name}&service=${selectedService.name}&date=${selectedDate.toISOString()}&time=${selectedTime}`,
      )
    }, 1000)
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

                  <Button onClick={handleBooking} disabled={!isBookingComplete || loading} className="w-full">
                    {loading ? "Confirmando..." : "Confirmar Agendamento"}
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
