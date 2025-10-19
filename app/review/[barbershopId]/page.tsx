"use client"

import type React from "react"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { mockBarbershops } from "@/lib/mock-data"
import { Star, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default function ReviewPage({ params }: { params: Promise<{ barbershopId: string }> }) {
  const { barbershopId } = use(params)
  const router = useRouter()
  const barbershop = mockBarbershops.find((b) => b.id === barbershopId)

  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  if (!barbershop) {
    notFound()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return

    setLoading(true)

    // Mock submission - in production, this would call your API
    setTimeout(() => {
      router.push(`/barbershop/${barbershopId}?reviewed=true`)
    }, 1000)
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-16 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link href={`/barbershop/${barbershopId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para perfil
            </Link>
          </Button>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Avaliar {barbershop.name}</CardTitle>
              <CardDescription>Compartilhe sua experiência com outros clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Sua Avaliação *</Label>
                  <div className="flex gap-2 justify-center py-6">
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
                          className={`h-12 w-12 ${
                            star <= (hoveredRating || rating)
                              ? "fill-primary text-primary"
                              : "text-muted-foreground hover:text-primary"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-center text-muted-foreground">
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
                    rows={6}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">{comment.length}/500</p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1 bg-transparent"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={rating === 0 || loading} className="flex-1">
                    {loading ? "Enviando..." : "Enviar Avaliação"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
