"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Phone, Navigation } from "lucide-react"
import type { Barbershop } from "@/lib/types"
import Link from "next/link"

interface MapViewProps {
  barbershops: Barbershop[]
  onSelectBarbershop: (barbershop: Barbershop) => void
  selectedBarbershop: Barbershop | null
}

export function MapView({ barbershops, onSelectBarbershop, selectedBarbershop }: MapViewProps) {
  return (
    <div className="relative w-full h-full bg-muted/20 rounded-lg overflow-hidden">
      {/* Map Placeholder - In production, this would be Google Maps */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <MapPin className="h-16 w-16 text-primary mx-auto" />
          <div>
            <p className="text-lg font-semibold">Mapa Interativo</p>
            <p className="text-sm text-muted-foreground">Google Maps será integrado aqui</p>
          </div>
        </div>
      </div>

      {/* Map Pins - Positioned absolutely to simulate map markers */}
      <div className="absolute inset-0 pointer-events-none">
        {barbershops.map((shop, index) => (
          <button
            key={shop.id}
            onClick={() => onSelectBarbershop(shop)}
            className="pointer-events-auto absolute transform -translate-x-1/2 -translate-y-full transition-transform hover:scale-110"
            style={{
              left: `${30 + index * 20}%`,
              top: `${40 + index * 10}%`,
            }}
          >
            <div className="relative">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-colors ${
                  selectedBarbershop?.id === shop.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                <MapPin className="h-5 w-5" />
              </div>
              {selectedBarbershop?.id === shop.id && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

interface BarbershopCardProps {
  barbershop: Barbershop
}

export function BarbershopCard({ barbershop }: BarbershopCardProps) {
  return (
    <Card className="border-border/50 hover:border-primary/50 transition-colors">
      <CardContent className="p-0">
        <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
          <img
            src={barbershop.images[0] || "/placeholder.svg?height=200&width=400"}
            alt={barbershop.name}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg mb-1">{barbershop.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{barbershop.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-semibold">{barbershop.rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">({barbershop.reviewCount} avaliações)</span>
          </div>

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{barbershop.address}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span>{barbershop.phone}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {barbershop.services.slice(0, 2).map((service) => (
              <Badge key={service.id} variant="secondary" className="text-xs">
                R$ {service.price}
              </Badge>
            ))}
            {barbershop.services.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{barbershop.services.length - 2}
              </Badge>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button asChild className="flex-1">
              <Link href={`/barbershop/${barbershop.id}`}>Ver Perfil</Link>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a
                href={`https://maps.google.com/?q=${barbershop.latitude},${barbershop.longitude}`}
                target="_blank"
                rel="noreferrer"
              >
                <Navigation className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
