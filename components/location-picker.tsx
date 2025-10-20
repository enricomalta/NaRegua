"use client"

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, RotateCcw } from "lucide-react"

interface LocationPickerProps {
  onLocationChange: (lat: number, lng: number) => void
  initialLat?: number
  initialLng?: number
  address?: string
}

export function LocationPicker({ 
  onLocationChange, 
  initialLat = -21.7545, 
  initialLng = -43.4393,
  address 
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [selectedLocation, setSelectedLocation] = useState({ lat: initialLat, lng: initialLng })

  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current && !mapInstanceRef.current) {
      // Dynamically import Leaflet
      import('leaflet').then((L) => {
        try {
          // Verificar se o container já tem um mapa - forçar limpeza
          if (mapRef.current) {
            // Remover qualquer instância existente do DOM
            mapRef.current.innerHTML = ''
            // Remover atributos específicos do Leaflet
            mapRef.current.removeAttribute('data-leaflet-id')
            mapRef.current.classList.remove('leaflet-container')
          }

          // Initialize map
          const map = L.map(mapRef.current!, {
            center: [initialLat, initialLng],
            zoom: 15
          })
          mapInstanceRef.current = map
          
          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map)

          // Create custom marker icon
          const customIcon = L.divIcon({
            html: `<div style="
              width: 30px;
              height: 30px;
              background: hsl(var(--primary));
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 14px;
            ">📍</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          })

          // Add marker
          const marker = L.marker([initialLat, initialLng], { 
            icon: customIcon,
            draggable: true 
        }).addTo(map)

        // Handle marker drag
        marker.on('dragend', function(e: any) {
          const position = e.target.getLatLng()
          setSelectedLocation({ lat: position.lat, lng: position.lng })
          onLocationChange(position.lat, position.lng)
        })

        // Handle map click
        map.on('click', function(e: any) {
          const { lat, lng } = e.latlng
          marker.setLatLng([lat, lng])
          setSelectedLocation({ lat, lng })
          onLocationChange(lat, lng)
        })

        mapInstanceRef.current = map
        markerRef.current = marker
        } catch (error) {
          console.error('Error initializing map:', error)
          // Se houver erro, limpar as referências
          mapInstanceRef.current = null
          markerRef.current = null
        }
      })
    }

    return () => {
      // Cleanup mais completo
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
        } catch (error) {
          console.warn('Error removing map:', error)
        }
        mapInstanceRef.current = null
      }
      
      if (markerRef.current) {
        markerRef.current = null
      }

      // Limpar container se ainda existir
      if (mapRef.current) {
        mapRef.current.innerHTML = ''
        mapRef.current.removeAttribute('data-leaflet-id')
        mapRef.current.classList.remove('leaflet-container')
      }
    }
  }, [initialLat, initialLng, onLocationChange])

  // Search location by address
  const searchByAddress = async () => {
    if (!address) return

    try {
      // Using Nominatim API for geocoding (free alternative to Google)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        const newLat = parseFloat(lat)
        const newLng = parseFloat(lon)
        
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([newLat, newLng], 17)
          markerRef.current.setLatLng([newLat, newLng])
          setSelectedLocation({ lat: newLat, lng: newLng })
          onLocationChange(newLat, newLng)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar localização:', error)
    }
  }

  const resetLocation = () => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([initialLat, initialLng], 15)
      markerRef.current.setLatLng([initialLat, initialLng])
      setSelectedLocation({ lat: initialLat, lng: initialLng })
      onLocationChange(initialLat, initialLng)
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Localização no Mapa
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Clique no mapa ou arraste o marcador para definir a localização exata da barbearia
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={searchByAddress}
            disabled={!address}
            className="flex-1"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Buscar no Mapa
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={resetLocation}
            size="icon"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        
        <div 
          ref={mapRef}
          className="w-full h-64 rounded-lg border border-border overflow-hidden"
          style={{ zIndex: 1 }}
        />
        
        <div className="text-xs text-muted-foreground">
          <p><strong>Coordenadas:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</p>
          <p className="mt-1">💡 Dica: Clique no mapa ou arraste o marcador para ajustar a posição</p>
        </div>
      </CardContent>
    </Card>
  )
}