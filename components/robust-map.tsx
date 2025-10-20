"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, RotateCcw, Loader2 } from "lucide-react"

interface RobustMapProps {
  onLocationChange: (lat: number, lng: number) => void
  initialLat?: number
  initialLng?: number
  address?: string
  onReady?: () => void
  onError?: (error: Error | string) => void
}

export function RobustMap({ 
  onLocationChange, 
  initialLat = -21.7545, 
  initialLng = -43.4393,
  address,
  onReady,
  onError
}: RobustMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const initializingRef = useRef(false)
  
  const [selectedLocation, setSelectedLocation] = useState({ lat: initialLat, lng: initialLng })
  const [isMapReady, setIsMapReady] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Função para forçar limpeza completa do container
  const forceCleanupContainer = useCallback(() => {
    if (mapContainerRef.current) {
      // Remover todo conteúdo HTML
      mapContainerRef.current.innerHTML = ''
      
      // Remover todas as classes CSS do Leaflet
      const classList = Array.from(mapContainerRef.current.classList)
      classList.forEach(className => {
        if (className.includes('leaflet')) {
          mapContainerRef.current!.classList.remove(className)
        }
      })
      
      // Remover todos os atributos do Leaflet
      const attributes = Array.from(mapContainerRef.current.attributes)
      attributes.forEach(attr => {
        if (attr.name.includes('leaflet') || attr.name.startsWith('data-')) {
          mapContainerRef.current!.removeAttribute(attr.name)
        }
      })
      
      // Resetar estilos inline
      mapContainerRef.current.style.cssText = 'width: 100%; height: 256px; position: relative;'
    }
  }, [])

  // Função para destruir o mapa existente
  const destroyMap = useCallback(() => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.off()
        mapInstanceRef.current.remove()
      } catch (error) {
        console.warn('Erro ao destruir mapa:', error)
      }
      mapInstanceRef.current = null
    }
    
    if (markerRef.current) {
      markerRef.current = null
    }
    
    forceCleanupContainer()
    setIsMapReady(false)
  }, [forceCleanupContainer])

  // Função para inicializar o mapa
  const initializeMap = useCallback(async () => {
    if (initializingRef.current || !mapContainerRef.current || typeof window === 'undefined') {
      return
    }

    initializingRef.current = true
    setIsLoading(true)
    setMapError(null)

    try {
      // Destruir qualquer mapa existente
      destroyMap()
      
      // Aguardar um momento para garantir limpeza
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Verificar se o container ainda existe
      if (!mapContainerRef.current) {
        throw new Error('Container do mapa não encontrado')
      }

      // Importar Leaflet dinamicamente
      const L = await import('leaflet')
      
      // Configurar ícones padrão do Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      // Criar mapa com configurações específicas
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true,
        touchZoom: true
      })

      // Adicionar layer de tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 3
      }).addTo(map)

      // Criar ícone personalizado
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
          cursor: grab;
        ">📍</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        className: 'custom-location-marker'
      })

      // Adicionar marcador
      const marker = L.marker([initialLat, initialLng], { 
        icon: customIcon,
        draggable: true,
        riseOnHover: true
      }).addTo(map)

      // Eventos do marcador
      marker.on('dragstart', () => {
        map.dragging.disable()
      })

      marker.on('dragend', (e: any) => {
        map.dragging.enable()
        const position = e.target.getLatLng()
        const newLocation = { lat: position.lat, lng: position.lng }
        setSelectedLocation(newLocation)
        onLocationChange(position.lat, position.lng)
      })

      // Eventos do mapa
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng
        marker.setLatLng([lat, lng])
        const newLocation = { lat, lng }
        setSelectedLocation(newLocation)
        onLocationChange(lat, lng)
      })

      // Aguardar o mapa carregar completamente
      map.whenReady(() => {
        setTimeout(() => {
          try {
            map.invalidateSize()
            setIsMapReady(true)
            setIsLoading(false)
            onReady?.()
          } catch (error) {
            console.warn('Erro ao finalizar carregamento do mapa:', error)
            if (error instanceof Error) {
              onError?.(error)
            }
          }
        }, 300)
      })

      // Salvar referências
      mapInstanceRef.current = map
      markerRef.current = marker

    } catch (error) {
      console.error('Erro ao inicializar mapa:', error)
      setMapError(error instanceof Error ? error.message : 'Erro desconhecido ao carregar mapa')
      setIsLoading(false)
      if (error instanceof Error) {
        onError?.(error)
      } else {
        onError?.('Erro desconhecido ao carregar mapa')
      }
      
      // Limpar referências em caso de erro
      mapInstanceRef.current = null
      markerRef.current = null
    } finally {
      initializingRef.current = false
    }
  }, [initialLat, initialLng, onLocationChange, destroyMap])

  // Buscar localização por endereço
  const searchByAddress = useCallback(async () => {
    if (!address || !isMapReady) return

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Brasil')}&limit=1&countrycodes=br`
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
  }, [address, isMapReady, onLocationChange])

  // Resetar localização
  const resetLocation = useCallback(() => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([initialLat, initialLng], 15)
      markerRef.current.setLatLng([initialLat, initialLng])
      setSelectedLocation({ lat: initialLat, lng: initialLng })
      onLocationChange(initialLat, initialLng)
    }
  }, [initialLat, initialLng, onLocationChange])

  // Effect para inicializar o mapa
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeMap()
    }, 100)

    return () => {
      clearTimeout(timer)
      destroyMap()
    }
  }, [initializeMap, destroyMap])

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Localização no Mapa
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
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
            disabled={!address || !isMapReady || isLoading}
            className="flex-1"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Buscar no Mapa
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={resetLocation}
            disabled={!isMapReady || isLoading}
            size="icon"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative">
          <div 
            ref={mapContainerRef}
            className="w-full h-64 rounded-lg border border-border overflow-hidden bg-muted"
            style={{ minHeight: '256px' }}
          />
          
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-sm text-muted-foreground">Carregando mapa...</p>
              </div>
            </div>
          )}
          
          {mapError && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <div className="flex flex-col items-center gap-2 text-center p-4">
                <MapPin className="h-6 w-6 text-destructive" />
                <p className="text-sm text-destructive">Erro ao carregar mapa</p>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={initializeMap}
                >
                  Tentar Novamente
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {isMapReady && (
          <div className="text-xs text-muted-foreground">
            <p><strong>Coordenadas:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</p>
            <p className="mt-1">💡 Dica: Clique no mapa ou arraste o marcador para ajustar a posição</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}