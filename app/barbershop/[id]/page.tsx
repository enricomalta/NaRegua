"use client"

import { use, useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ReviewForm } from "@/components/review-form"
import { getBarbershopById, getReviewsByBarbershop } from "@/lib/firebase-service"
import { MapPin, Phone, Clock, Star, Navigation } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { Barbershop, Review } from "@/lib/types"

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const
const dayNames = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]

export default function BarbershopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { toast } = useToast()
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [barbershopData, reviewsData] = await Promise.all([
          getBarbershopById(id),
          getReviewsByBarbershop(id)
        ])
        
        if (!barbershopData) {
          notFound()
          return
        }
        
        setBarbershop(barbershopData)
        setReviews(reviewsData)
      } catch (error) {
        console.error("Erro ao carregar dados da barbearia:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

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

  const handleReviewSubmit = (rating: number, comment: string) => {
    toast({
      title: "Avaliação enviada!",
      description: "Obrigado por compartilhar sua experiência.",
    })
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-16">
        {/* Hero Image */}
        <div className="relative h-64 md:h-96 bg-muted">
          <img
            src={barbershop.images[0] || "/placeholder.svg?height=400&width=1200"}
            alt={barbershop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-16 relative z-10">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Info Card */}
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{barbershop.name}</h1>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 fill-primary text-primary" />
                          <span className="font-semibold text-lg">{barbershop.rating}</span>
                        </div>
                        <span className="text-muted-foreground">({barbershop.reviewCount} avaliações)</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setReviewDialogOpen(true)}>
                        Avaliar
                      </Button>
                      <Button asChild>
                        <Link href={`/booking/${barbershop.id}`}>Agendar Horário</Link>
                      </Button>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-6">{barbershop.description}</p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm">{barbershop.address.fullAddress}</p>
                        <Button variant="link" className="h-auto p-0 text-primary" asChild>
                          <a
                            href={`https://maps.google.com/?q=${barbershop.latitude},${barbershop.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1"
                          >
                            <Navigation className="h-3 w-3" />
                            Ver no mapa
                          </a>
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <a href={`tel:${barbershop.phone}`} className="text-sm hover:text-primary transition-colors">
                        {barbershop.phone}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Services */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Serviços</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {barbershop.services.map((service) => (
                    <div key={service.id} className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{service.duration} minutos</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg text-primary">R$ {service.price}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Avaliações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {reviews.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Nenhuma avaliação ainda.</p>
                  ) : (
                    reviews.map((review, index) => (
                      <div key={review.id}>
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={review.clientAvatar || "/placeholder.svg"} />
                            <AvatarFallback>{review.clientName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{review.clientName}</h4>
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
                        {index < reviews.length - 1 && <Separator className="mt-6" />}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Working Hours */}
              <Card className="border-border/50 sticky top-20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Horário de Funcionamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {daysOfWeek.map((day, index) => {
                    const hours = barbershop.workingHours[day]
                    return (
                      <div key={day} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{dayNames[index]}</span>
                        <span className="font-medium">
                          {hours.length === 0 ? (
                            <Badge variant="secondary">Fechado</Badge>
                          ) : (
                            `${hours[0].start} - ${hours[0].end}`
                          )}
                        </span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <ReviewForm
        barbershopId={barbershop.id}
        barbershopName={barbershop.name}
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        onSubmit={handleReviewSubmit}
      />
    </div>
  )
}
