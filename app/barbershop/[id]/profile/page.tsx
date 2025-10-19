"use client"

import { use } from "react"
import { useData } from "@/lib/data-provider"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Phone, Clock, Star, Calendar, Users, Award, MessageSquare } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function BarbershopProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { getBarbershopById, getReviewsByBarbershop, getEmployeesByBarbershop } = useData()

  const barbershop = getBarbershopById(id)
  const reviews = getReviewsByBarbershop(id)
  const employees = getEmployeesByBarbershop(id)

  if (!barbershop) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Barbearia não encontrada</p>
        </main>
      </div>
    )
  }

  const stats = [
    { label: "Avaliações", value: barbershop.reviewCount, icon: MessageSquare },
    { label: "Nota Média", value: barbershop.rating.toFixed(1), icon: Star },
    { label: "Funcionários", value: employees.length, icon: Users },
    { label: "Serviços", value: barbershop.services.length, icon: Award },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
          <Image src={barbershop.images[0] || "/placeholder.svg"} alt={barbershop.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-4xl font-bold text-foreground mb-2">{barbershop.name}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-primary text-primary" />
                <span className="font-semibold text-foreground">{barbershop.rating}</span>
                <span>({barbershop.reviewCount} avaliações)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{barbershop.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="about">Sobre</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="team">Equipe</TabsTrigger>
            <TabsTrigger value="reviews">Avaliações</TabsTrigger>
          </TabsList>

          {/* About */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Sobre a Barbearia</h3>
                  <p className="text-muted-foreground leading-relaxed">{barbershop.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      Contato
                    </h4>
                    <p className="text-muted-foreground">{barbershop.phone}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Endereço
                    </h4>
                    <p className="text-muted-foreground">{barbershop.address}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Horário de Funcionamento
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(barbershop.workingHours).map(([day, slots]) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="capitalize text-muted-foreground">{day}</span>
                        <span className="font-medium">
                          {slots.length > 0 ? slots.map((slot) => `${slot.start} - ${slot.end}`).join(", ") : "Fechado"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services */}
          <TabsContent value="services" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {barbershop.services.map((service) => (
                <Card key={service.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{service.name}</h3>
                      <Badge variant="secondary" className="text-primary">
                        R$ {service.price.toFixed(2)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{service.duration} minutos</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Team */}
          <TabsContent value="team" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {employees.map((employee) => (
                <Card key={employee.id}>
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{employee.name}</h3>
                    <Badge variant="outline" className="mb-2 capitalize">
                      {employee.role}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{employee.email}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews" className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-semibold text-primary">{review.clientName.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{review.clientName}</h4>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "fill-primary text-primary" : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm mb-2">{review.comment}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <div className="mt-8 flex gap-4">
          <Button asChild size="lg" className="flex-1">
            <Link href={`/booking/${barbershop.id}`}>
              <Calendar className="mr-2 h-5 w-5" />
              Agendar Horário
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={`/review/${barbershop.id}`}>
              <Star className="mr-2 h-5 w-5" />
              Avaliar
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
