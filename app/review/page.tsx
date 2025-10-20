"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReviewForm } from "@/components/review-form"
import { useAuth } from "@/lib/auth-context"
import { useRoleProtection } from "@/hooks/use-role-protection"
import { getBarbershops, getReviewsByUser } from "@/lib/firebase-service"
import type { Barbershop, Review } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { PencilLine, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function MyReviewsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { isAuthorized, loading: authLoading } = useRoleProtection({
    requiredRoles: ["client"],
    requireAuth: true,
  })

  const [reviews, setReviews] = useState<Review[]>([])
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  const barbershopById = useMemo(() => {
    const map = new Map<string, Barbershop>()
    barbershops.forEach((shop) => {
      map.set(shop.id, shop)
    })
    return map
  }, [barbershops])

  const loadData = useCallback(async () => {
    if (!user) {
      setReviews([])
      setBarbershops([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const [userReviews, allBarbershops] = await Promise.all([
        getReviewsByUser(user.id),
        getBarbershops(),
      ])

      setReviews(userReviews)
      setBarbershops(allBarbershops)
    } catch (error) {
      console.error("Erro ao carregar avaliações do usuário:", error)
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar suas avaliações. Tente novamente em instantes.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast, user])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleEditReview = (review: Review) => {
    setSelectedReview(review)
    setEditDialogOpen(true)
  }

  const handleDialogChange = (open: boolean) => {
    setEditDialogOpen(open)
    if (!open) {
      setSelectedReview(null)
    }
  }

  const handleReviewUpdated = (rating: number, comment: string) => {
    if (!selectedReview) return

    setReviews((prev) =>
      prev.map((review) =>
        review.id === selectedReview.id
          ? {
              ...review,
              rating,
              comment,
              updatedAt: new Date(),
            }
          : review,
      ),
    )

    toast({
      title: "Avaliação atualizada",
      description: "Sua avaliação foi atualizada com sucesso.",
    })
  }

  const renderStars = (value: number) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= value ? "fill-primary text-primary" : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  )

  if (authLoading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-16 flex items-center justify-center">
          <p className="text-muted-foreground">Faça login para gerenciar suas avaliações.</p>
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
              <h1 className="text-3xl font-bold mb-2">Minhas Avaliações</h1>
              <p className="text-muted-foreground">
                Revise, edite e acompanhe o impacto das suas avaliações nas barbearias.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : reviews.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="py-16 text-center space-y-4">
                <div className="flex justify-center">
                  <Star className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold">Você ainda não avaliou nenhuma barbearia</p>
                  <p className="text-sm text-muted-foreground">
                    Agende um horário, conclua o atendimento e compartilhe sua experiência para ajudar outros clientes.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/map">Encontrar barbearias</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {reviews.map((review) => {
                const barbershop = barbershopById.get(review.barbershopId)

                return (
                  <Card key={review.id} className="border-border/50">
                    <CardHeader>
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <CardTitle className="text-xl">
                            {barbershop ? barbershop.name : "Barbearia desconhecida"}
                          </CardTitle>
                          <CardDescription>
                            Avaliado em {formatDate(review.createdAt)}
                          </CardDescription>
                          {review.updatedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Atualizado em {formatDate(review.updatedAt)}
                            </p>
                          )}
                        </div>
                        {renderStars(review.rating)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {review.comment?.trim() ? review.comment : "Sem comentário adicional."}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/barbershop/${review.barbershopId}`}>
                            Ver barbearia
                          </Link>
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleEditReview(review)}>
                          <PencilLine className="mr-2 h-4 w-4" />
                          Editar avaliação
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {selectedReview && (
        <ReviewForm
          mode="edit"
          reviewId={selectedReview.id}
          barbershopId={selectedReview.barbershopId}
          barbershopName={barbershopById.get(selectedReview.barbershopId)?.name || "Barbearia"}
          open={editDialogOpen}
          onOpenChange={handleDialogChange}
          initialRating={selectedReview.rating}
          initialComment={selectedReview.comment}
          onSubmit={handleReviewUpdated}
        />
      )}
    </div>
  )
}
