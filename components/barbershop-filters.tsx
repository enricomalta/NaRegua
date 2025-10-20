"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface BarbershopFiltersProps {
  maxDistance: number
  onMaxDistanceChange: (value: number) => void
  minRating: number
  onMinRatingChange: (value: number) => void
  maxPrice: number
  onMaxPriceChange: (value: number) => void
  sortBy: string
  onSortByChange: (value: string) => void
  distanceAvailable: boolean
  locationStatus: "idle" | "loading" | "granted" | "denied" | "unsupported"
  onRequestLocation?: () => void
  locationError?: string | null
}

export function BarbershopFilters({
  maxDistance,
  onMaxDistanceChange,
  minRating,
  onMinRatingChange,
  maxPrice,
  onMaxPriceChange,
  sortBy,
  onSortByChange,
  distanceAvailable,
  locationStatus,
  onRequestLocation,
  locationError,
}: BarbershopFiltersProps) {
  const renderLocationMessage = () => {
    if (distanceAvailable && locationStatus === "granted") {
      return null
    }

    switch (locationStatus) {
      case "loading":
        return "Obtendo sua localização..."
      case "denied":
        return "Não foi possível acessar sua localização."
      case "unsupported":
        return "Seu navegador não oferece suporte à geolocalização."
      default:
        return "Permita acesso à localização para filtrar por distância."
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Ordenar por</Label>
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">Distância</SelectItem>
              <SelectItem value="rating">Avaliação</SelectItem>
              <SelectItem value="price-low">Menor Preço</SelectItem>
              <SelectItem value="price-high">Maior Preço</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Distância Máxima</Label>
            <span className="text-sm text-muted-foreground">{maxDistance} km</span>
          </div>
          <Slider
            value={[maxDistance]}
            onValueChange={(value) => onMaxDistanceChange(value[0])}
            min={1}
            max={50}
            step={1}
            className="w-full"
            disabled={!distanceAvailable}
          />
          {!distanceAvailable && (
            <div className="space-y-2 rounded-md border border-dashed border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
              <p>{renderLocationMessage()}</p>
              {locationError && locationStatus !== "loading" && (
                <p className="text-destructive">{locationError}</p>
              )}
              {onRequestLocation && locationStatus !== "loading" && locationStatus !== "unsupported" && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-7 px-3 text-xs"
                  onClick={onRequestLocation}
                >
                  {locationStatus === "denied" ? "Tentar novamente" : "Permitir localização"}
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Avaliação Mínima</Label>
            <span className="text-sm text-muted-foreground">{minRating.toFixed(1)} ⭐</span>
          </div>
          <Slider
            value={[minRating]}
            onValueChange={(value) => onMinRatingChange(value[0])}
            min={0}
            max={5}
            step={0.5}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Preço Máximo</Label>
            <span className="text-sm text-muted-foreground">R$ {maxPrice}</span>
          </div>
          <Slider
            value={[maxPrice]}
            onValueChange={(value) => onMaxPriceChange(value[0])}
            min={20}
            max={200}
            step={10}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  )
}
