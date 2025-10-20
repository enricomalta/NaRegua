"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { getBarbershopById, getPublicUserProfileById, getReviewsByUser, getUserById } from "@/lib/firebase-service"
import type { PublicUserProfile, Review, User } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Calendar, EyeOff, Lock, Shield, Star } from "lucide-react"

type ProfileView = {
  id: string
  name: string
  role: User["role"]
  avatar?: string
  createdAt: Date
  privacy: {
    isProfilePublic: boolean
    showReviewHistory: boolean
  }
  source: "full" | "public"
}

const buildProfileViewFromUser = (user: User): ProfileView => ({
  id: user.id,
  name: user.name,
  role: user.role,
  avatar: user.avatar,
  createdAt: user.createdAt,
  privacy: {
    isProfilePublic: user.settings?.privacy?.isProfilePublic ?? true,
    showReviewHistory: user.settings?.privacy?.showReviewHistory ?? true,
  },
  source: "full",
})

const buildProfileViewFromPublic = (profile: PublicUserProfile): ProfileView => ({
  id: profile.id,
  name: profile.name,
  role: profile.role,
  avatar: profile.avatar,
  createdAt: profile.createdAt,
  privacy: {
    isProfilePublic: profile.privacy.isProfilePublic,
    showReviewHistory: profile.privacy.showReviewHistory,
  },
  source: "public",
})

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState<ProfileView | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewCount, setReviewCount] = useState(0)
  const [reviewsAccessible, setReviewsAccessible] = useState(false)
  const [barbershopNames, setBarbershopNames] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const loadProfile = async () => {
      setLoading(true)
      setError(null)
      setReviews([])
  setReviewCount(0)
  setReviewsAccessible(false)
  setBarbershopNames({})

      try {
        const fullProfile = await getUserById(id)

        if (!isActive) {
          return
        }

        let profileView: ProfileView | null = null

        if (fullProfile) {
          profileView = buildProfileViewFromUser(fullProfile)
        } else {
          const publicProfile = await getPublicUserProfileById(id)

          if (!isActive) {
            return
          }

          if (!publicProfile) {
            setProfile(null)
            setError("Perfil não encontrado.")
            return
          }

          profileView = buildProfileViewFromPublic(publicProfile)
        }

        setProfile(profileView)

        if (profileView.privacy.isProfilePublic && profileView.privacy.showReviewHistory) {
          setReviewsLoading(true)
          try {
            const reviewData = await getReviewsByUser(profileView.id)
            if (isActive) {
              setReviews(reviewData)
              setReviewCount(reviewData.length)
              setReviewsAccessible(true)
            }
          } catch (reviewError) {
            console.error("Erro ao carregar avaliações do usuário:", reviewError)
            if (isActive) {
              setReviews([])
              setReviewCount(0)
              setReviewsAccessible(false)
            }
          } finally {
            if (isActive) {
              setReviewsLoading(false)
            }
          }
        } else if (isActive) {
          setReviewsAccessible(false)
          setReviews([])
          setReviewCount(0)
          setReviewsLoading(false)
        }
      } catch (profileError) {
        console.error("Erro ao carregar perfil do usuário:", profileError)
        if (isActive) {
          setProfile(null)
          setError("Não foi possível carregar o perfil.")
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isActive = false
    }
  }, [id])

  useEffect(() => {
    let isActive = true

    const loadBarbershopNames = async () => {
      const uniqueIds = Array.from(new Set(reviews.map((review) => review.barbershopId)))
      const missingIds = uniqueIds.filter((barbershopId) => !(barbershopId in barbershopNames))

      if (missingIds.length === 0) {
        return
      }

      try {
        const entries = await Promise.all(
          missingIds.map(async (barbershopId) => {
            const barbershop = await getBarbershopById(barbershopId)
            return [barbershopId, barbershop?.name ?? "Barbearia desconhecida"] as const
          })
        )

        if (isActive && entries.length > 0) {
          setBarbershopNames((previous) => ({
            ...previous,
            ...Object.fromEntries(entries),
          }))
        }
      } catch (error) {
        console.error("Erro ao carregar dados da barbearia:", error)
      }
    }

    if (reviews.length > 0) {
      loadBarbershopNames()
    }

    return () => {
      isActive = false
    }
  }, [reviews, barbershopNames])

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "client":
        return "Cliente"
      case "barber":
        return "Barbeiro"
      case "admin":
        return "Administrador"
      default:
        return "Usuário"
    }
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "client":
        return "bg-blue-100 text-blue-700"
      case "barber":
        return "bg-green-100 text-green-700"
      case "admin":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <Card className="mx-auto max-w-xl">
            <CardHeader>
              <CardTitle>Algo deu errado</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <Card className="mx-auto max-w-xl">
            <CardHeader>
              <CardTitle>Perfil não encontrado</CardTitle>
              <CardDescription>
                O usuário que você está tentando acessar pode não existir ou foi removido.
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  const isOwner = currentUser?.id === profile.id
  const isProfilePublic = profile.privacy.isProfilePublic
  const showReviewHistory = profile.privacy.showReviewHistory
  const reviewCountText = reviewsLoading
    ? "Carregando avaliações..."
    : reviewsAccessible
      ? reviewCount === 1
        ? "1 avaliação registrada"
        : `${reviewCount} avaliações registradas`
      : isOwner
        ? "Seu histórico de avaliações está oculto"
        : "Histórico de avaliações oculto"

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          <Card>
            <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback className="text-lg font-semibold">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold leading-tight text-foreground md:text-3xl">
                    {profile.name}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge className={cn("text-xs font-semibold", getRoleBadgeClass(profile.role))}>
                      {getRoleDisplay(profile.role)}
                    </Badge>
                    <Badge
                      variant={isProfilePublic ? "secondary" : "destructive"}
                      className="flex items-center gap-1 text-xs"
                    >
                      {isProfilePublic ? (
                        <>
                          <Shield className="h-3 w-3" /> Perfil público
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3" /> Perfil privado
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Na plataforma desde {profile.createdAt.toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span>{reviewCountText}</span>
                  </div>
                </div>
              </div>
              {isOwner && (
                <Button variant="outline" asChild>
                  <Link href="/settings">Editar Configurações</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {!isProfilePublic ? (
            <Card>
              <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
                <EyeOff className="h-4 w-4" />
                {isOwner
                  ? "Seu perfil está privado. Suas avaliações continuam visíveis apenas nas barbearias onde foram feitas."
                  : "Este usuário optou por manter o perfil privado. As avaliações permanecem visíveis apenas nas barbearias avaliadas."}
              </CardContent>
            </Card>
          ) : !showReviewHistory ? (
            <Card>
              <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
                <EyeOff className="h-4 w-4" />
                {isOwner
                  ? "Você optou por ocultar o histórico de avaliações neste perfil."
                  : "Este usuário optou por ocultar o histórico de avaliações neste perfil."}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Avaliações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviewsLoading ? (
                  <p className="text-sm text-muted-foreground">Carregando avaliações...</p>
                ) : reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma avaliação registrada.</p>
                ) : (
                  reviews.map((review, index) => (
                    <div key={review.id} className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold">Avaliação registrada</p>
                          <p className="text-xs text-muted-foreground">
                            Barbearia: {barbershopNames[review.barbershopId] ?? review.barbershopId} • {review.createdAt.toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, starIndex) => (
                              <Star
                                key={starIndex}
                                className={cn(
                                  "h-4 w-4",
                                  starIndex < review.rating ? "fill-primary text-primary" : "text-muted-foreground"
                                )}
                              />
                            ))}
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/barbershop/${review.barbershopId}`}>Ver barbearia</Link>
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-foreground">{review.comment}</p>
                      {index < reviews.length - 1 && <Separator />}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
