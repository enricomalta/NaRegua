"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BarbershopFiltersProps {
  maxDistance: number
  onMaxDistanceChange: (value: number) => void
  minRating: number
  onMinRatingChange: (value: number) => void
  maxPrice: number
  onMaxPriceChange: (value: number) => void
  sortBy: string
  onSortByChange: (value: string) => void
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
}: BarbershopFiltersProps) {
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
          />
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
