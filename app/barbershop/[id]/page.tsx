"use client"

import { use, useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ReviewForm } from "@/components/review-form"
import { getBarbershopById, getReviewsByBarbershop, isBarbershopFavorited, toggleBarbershopFavorite, hasUserReviewedBarbershop } from "@/lib/firebase-service"
import { MapPin, Phone, Clock, Star, Navigation, Heart } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { Barbershop, Review } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const
const dayNames = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]

export default function BarbershopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { toast } = useToast()
  const { user } = useAuth()
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteCount, setFavoriteCount] = useState(0)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)

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
        setFavoriteCount(barbershopData.favoriteCount ?? 0)
        setReviews(reviewsData)
      } catch (error) {
        console.error("Erro ao carregar dados da barbearia:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  useEffect(() => {
    if (!barbershop?.id) {
      setIsFavorite(false)
      setHasReviewed(false)
      return
    }

    if (!user?.id) {
      setIsFavorite(false)
      setHasReviewed(false)
      return
    }

    let isActive = true

    const loadStatuses = async () => {
      try {
        const [favorited, reviewed] = await Promise.all([
          isBarbershopFavorited(user.id, barbershop.id),
          hasUserReviewedBarbershop(user.id, barbershop.id),
        ])

        if (isActive) {
          setIsFavorite(favorited)
          setHasReviewed(reviewed)
        }
      } catch (error) {
        console.error("Erro ao verificar favorito/avaliação: ", error)
      }
    }

    loadStatuses()

    return () => {
      isActive = false
    }
  }, [barbershop?.id, user?.id])

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

  const handleReviewSubmit = async (_rating: number, _comment: string) => {
    try {
      const [updatedBarbershop, updatedReviews] = await Promise.all([
        getBarbershopById(id),
        getReviewsByBarbershop(id)
      ])

      if (updatedBarbershop) {
        setBarbershop(updatedBarbershop)
        setFavoriteCount(updatedBarbershop.favoriteCount ?? 0)
      }

    setReviews(updatedReviews)
    setHasReviewed(true)

      toast({
        title: "Avaliação enviada!",
        description: "Obrigado por compartilhar sua experiência.",
      })
    } catch (error) {
      console.error("Erro ao atualizar dados após avaliação:", error)
      toast({
        title: "Erro ao atualizar",
        description: "A avaliação foi enviada, mas houve um problema ao atualizar os dados na página.",
        variant: "destructive"
      })
    }
  }

  const handleToggleFavorite = async () => {
    if (!barbershop) {
      return
    }

    if (!user) {
      toast({
        title: "Faça login para favoritar",
        description: "Entre na sua conta para salvar barbearias nos favoritos.",
      })
      return
    }

    try {
      setFavoriteLoading(true)
      const result = await toggleBarbershopFavorite(user.id, barbershop.id)

      setIsFavorite(result.favorited)
      setFavoriteCount(result.favoriteCount)
      setBarbershop((prev) => (prev ? { ...prev, favoriteCount: result.favoriteCount } : prev))

      toast({
        title: result.favorited ? "Barbearia favoritada" : "Favorito removido",
        description: result.favorited
          ? "Você receberá priorização desta barbearia nas suas buscas."
          : "A barbearia foi removida da sua lista de favoritos.",
      })
    } catch (error) {
      console.error("Erro ao atualizar favorito:", error)
      toast({
        title: "Não foi possível atualizar o favorito",
        description: "Tente novamente em instantes.",
        variant: "destructive",
      })
    } finally {
      setFavoriteLoading(false)
    }
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
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleToggleFavorite}
                        disabled={favoriteLoading}
                        aria-pressed={isFavorite}
                        title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                        className={cn(
                          "group relative h-10 w-10 border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500",
                          isFavorite
                            ? "border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                            : "border-border text-muted-foreground hover:border-red-500 hover:bg-red-500/10 hover:text-red-500"
                        )}
                      >
                        <Heart
                          className={cn(
                            "h-4 w-4 transition-colors",
                            isFavorite
                              ? "fill-red-500 text-red-500"
                              : "text-muted-foreground group-hover:text-red-500"
                          )}
                        />
                        <span
                          className={cn(
                            "pointer-events-none absolute -top-1 -right-1 min-w-[1.5rem] rounded-full border px-1 text-[10px] font-semibold leading-tight",
                            isFavorite
                              ? "border-red-500 bg-red-500 text-white"
                              : "border-border bg-background text-muted-foreground group-hover:border-red-500 group-hover:text-red-500"
                          )}
                        >
                          {favoriteCount}
                        </span>
                      </Button>
                      {!hasReviewed && (
                        <Button
                          variant="outline"
                          onClick={() => setReviewDialogOpen(true)}
                        >
                          Avaliar
                        </Button>
                      )}
                      <Button asChild>
                        <Link href={`/booking/${barbershop.id}`}>
                          Agendar Horário
                        </Link>
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
