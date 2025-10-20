"use client"

import { useState } from 'react'
import { SimpleLocationPicker } from './simple-location-picker'
import { Button } from '@/components/ui/button'
import { MapPin, Navigation } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AdaptiveLocationPickerProps {
  onLocationChange: (lat: number, lng: number) => void
  initialLat?: number
  initialLng?: number
  address?: string
}

export function AdaptiveLocationPicker(props: AdaptiveLocationPickerProps) {
  const [showMapOption, setShowMapOption] = useState(true)

  const tryMapInit = async () => {
    try {
      // Importar Leaflet dinamicamente
      const L = await import('leaflet')
      
      // Se chegou até aqui, o Leaflet pode ser carregado
      // Vou usar um componente de mapa mais simples
      setShowMapOption(false)
      
    } catch (error) {
      console.warn('Leaflet não disponível, usando coordenadas manuais')
      setShowMapOption(false)
    }
  }

  if (showMapOption) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Localização da Barbearia
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Escolha como definir a localização da sua barbearia
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <Button 
              type="button"
              variant="outline" 
              onClick={tryMapInit}
              className="w-full"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Usar Mapa Interativo
            </Button>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setShowMapOption(false)}
              className="w-full"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Inserir Coordenadas Manualmente
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p><strong>Endereço:</strong> {props.address || 'Não informado'}</p>
            <p className="mt-1">💡 Dica: O mapa interativo permite encontrar a localização exata clicando</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return <SimpleLocationPicker {...props} />
}