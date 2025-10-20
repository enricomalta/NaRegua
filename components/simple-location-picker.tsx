"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Navigation } from "lucide-react"

interface SimpleLocationPickerProps {
  onLocationChange: (lat: number, lng: number) => void
  initialLat?: number
  initialLng?: number
  address?: string
}

export function SimpleLocationPicker({ 
  onLocationChange, 
  initialLat = -21.7545, 
  initialLng = -43.4393,
  address 
}: SimpleLocationPickerProps) {
  const [latitude, setLatitude] = useState(initialLat.toString())
  const [longitude, setLongitude] = useState(initialLng.toString())

  const handleCoordinateChange = () => {
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    
    if (!isNaN(lat) && !isNaN(lng)) {
      onLocationChange(lat, lng)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setLatitude(lat.toString())
          setLongitude(lng.toString())
          onLocationChange(lat, lng)
        },
        (error) => {
          console.error('Erro ao obter localização:', error)
        }
      )
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Coordenadas da Localização
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Insira as coordenadas ou use sua localização atual
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Latitude</label>
            <Input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              onBlur={handleCoordinateChange}
              placeholder="-21.7545"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Longitude</label>
            <Input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              onBlur={handleCoordinateChange}
              placeholder="-43.4393"
            />
          </div>
        </div>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={getCurrentLocation}
          className="w-full"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Usar Minha Localização Atual
        </Button>
        
        <div className="text-xs text-muted-foreground">
          <p><strong>Endereço:</strong> {address || 'Não informado'}</p>
          <p className="mt-1">💡 Dica: Use "Minha Localização" ou insira as coordenadas manualmente</p>
        </div>
      </CardContent>
    </Card>
  )
}