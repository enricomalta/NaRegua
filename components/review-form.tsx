"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Star } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { createReview, canUserReviewBarbershop } from "@/lib/firebase-service"
import { useToast } from "@/hooks/use-toast"

interface ReviewFormProps {
  barbershopId: string
  barbershopName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (rating: number, comment: string) => void
}

export function ReviewForm({ barbershopId, barbershopName, open, onOpenChange, onSubmit }: ReviewFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [canReview, setCanReview] = useState<boolean | null>(null)
  const [checkingEligibility, setCheckingEligibility] = useState(false)

  // Verificar se o usuário pode fazer review quando o dialog abre
  useEffect(() => {
    if (open && user) {
      checkReviewEligibility()
    }
  }, [open, user, barbershopId])

  const checkReviewEligibility = async () => {
    if (!user) return
    
    setCheckingEligibility(true)
    try {
      const eligible = await canUserReviewBarbershop(user.id, barbershopId)
      setCanReview(eligible)
    } catch (error) {
      console.error("Erro ao verificar elegibilidade:", error)
      setCanReview(false)
    } finally {
      setCheckingEligibility(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0 || !user) return

    // Verificação dupla de elegibilidade
    const eligible = await canUserReviewBarbershop(user.id, barbershopId)
    if (!eligible) {
      toast({
        title: "Não é possível avaliar",
        description: "Você precisa ter um agendamento concluído nesta barbearia para poder avaliar.",
        variant: "destructive"
      })
      onOpenChange(false)
      return
    }

    setLoading(true)

    try {
      const reviewData: any = {
        clientId: user.id,
        clientName: user.name || user.email || "Usuário Anônimo",
        barbershopId,
        rating,
        comment,
        createdAt: new Date()
      }

      // Só adicionar avatar se existir
      if (user.avatar) {
        reviewData.clientAvatar = user.avatar
      }

      await createReview(reviewData)
      
      toast({
        title: "Avaliação enviada!",
        description: "Obrigado por compartilhar sua experiência."
      })

      onSubmit?.(rating, comment)
      onOpenChange(false)
      
      // Reset form
      setRating(0)
      setComment("")
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error)
      toast({
        title: "Erro ao enviar avaliação",
        description: "Não foi possível enviar sua avaliação. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Avaliar {barbershopName}</DialogTitle>
          <DialogDescription>Compartilhe sua experiência com outros clientes</DialogDescription>
        </DialogHeader>

        {checkingEligibility && (
          <div className="text-center py-8">
            <p>Verificando elegibilidade...</p>
          </div>
        )}

        {!checkingEligibility && canReview === false && (
          <div className="text-center py-8 space-y-4">
            <div className="text-yellow-600 dark:text-yellow-400">
              <p className="font-medium">Você ainda não pode avaliar esta barbearia</p>
              <p className="text-sm mt-2">
                Para avaliar, você precisa ter pelo menos um agendamento concluído nesta barbearia.
                Você também só pode fazer uma avaliação por barbearia.
              </p>
            </div>
            <Button type="button" onClick={() => onOpenChange(false)}>
              Entendi
            </Button>
          </div>
        )}

        {!checkingEligibility && canReview === true && (
          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Sua Avaliação *</Label>
            <div className="flex gap-2 justify-center py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= (hoveredRating || rating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {rating === 1 && "Muito ruim"}
                {rating === 2 && "Ruim"}
                {rating === 3 && "Regular"}
                {rating === 4 && "Bom"}
                {rating === 5 && "Excelente"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comentário (opcional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte sobre sua experiência..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">{comment.length}/500</p>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={rating === 0 || loading} className="flex-1">
              {loading ? "Enviando..." : "Enviar Avaliação"}
            </Button>
          </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
