"use client"

import { useEffect, useRef, useState } from "react"
import type { Barbershop } from "@/lib/types"

interface LeafletMapProps {
  barbershops: Barbershop[]
  onSelectBarbershop: (barbershop: Barbershop | null) => void
  selectedBarbershop: Barbershop | null
  center: { lat: number; lng: number }
  zoom: number
}

export function LeafletMap({ barbershops, onSelectBarbershop, selectedBarbershop, center, zoom }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Load Leaflet dynamically
    import("leaflet").then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return

      // Initialize map
      const map = L.map(mapRef.current, {
        center: [center.lat, center.lng],
        zoom: zoom,
        zoomControl: true,
      })

      // Add dark theme tiles from CartoDB
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map)

      mapInstanceRef.current = map
      setIsLoaded(true)

      // Cleanup
      return () => {
        map.remove()
        mapInstanceRef.current = null
      }
    })
  }, [center.lat, center.lng, zoom])

  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      // Create custom icon
      const createCustomIcon = (isSelected: boolean) => {
        return L.divIcon({
          className: "custom-marker",
          html: `
            <div style="
              width: 40px;
              height: 40px;
              background: ${isSelected ? "oklch(0.75 0.15 85)" : "oklch(0.35 0 0)"};
              border: 3px solid ${isSelected ? "oklch(0.85 0.15 85)" : "oklch(0.98 0 0)"};
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
              transition: all 0.3s ease;
            ">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="oklch(0.98 0 0)" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style="transform: rotate(45deg);"
              >
                <path d="M6 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2"/>
                <path d="M4 2h16"/>
                <path d="M10 10h4"/>
                <path d="M10 14h4"/>
                <path d="M10 6h4"/>
              </svg>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40],
        })
      }

      // Add markers for each barbershop
      barbershops.forEach((barbershop) => {
        // Skip if coordinates are missing
        if (!barbershop.latitude || !barbershop.longitude) {
          console.log("[v0] Skipping barbershop with missing coordinates:", barbershop.name)
          return
        }

        const isSelected = selectedBarbershop?.id === barbershop.id
        const marker = L.marker([barbershop.latitude, barbershop.longitude], {
          icon: createCustomIcon(isSelected),
        }).addTo(map)

        // Create popup content
        const popupContent = `
          <div style="
            min-width: 200px;
            padding: 8px;
            background: oklch(0.15 0 0);
            color: oklch(0.98 0 0);
            border-radius: 8px;
          ">
            <h3 style="
              font-size: 16px;
              font-weight: 600;
              margin: 0 0 8px 0;
              color: oklch(0.98 0 0);
            ">${barbershop.name}</h3>
            <div style="
              display: flex;
              align-items: center;
              gap: 4px;
              margin-bottom: 8px;
              color: oklch(0.75 0.15 85);
            ">
              <span style="font-size: 14px;">⭐ ${barbershop.rating.toFixed(1)}</span>
              <span style="color: oklch(0.6 0 0); font-size: 12px;">(${barbershop.reviewCount} avaliações)</span>
            </div>
            <p style="
              font-size: 12px;
              color: oklch(0.7 0 0);
              margin: 0 0 8px 0;
            ">${barbershop.address.fullAddress}</p>
            <div style="
              display: flex;
              gap: 8px;
              margin-top: 12px;
            ">
              <a 
                href="/barbershop/${barbershop.id}" 
                style="
                  flex: 1;
                  padding: 6px 12px;
                  background: oklch(0.75 0.15 85);
                  color: oklch(0.15 0 0);
                  text-align: center;
                  border-radius: 6px;
                  text-decoration: none;
                  font-size: 12px;
                  font-weight: 600;
                "
              >
                Ver Perfil
              </a>
            </div>
          </div>
        `

        marker.bindPopup(popupContent, {
          className: "custom-popup",
          closeButton: true,
          maxWidth: 300,
        })

        marker.on("click", () => {
          onSelectBarbershop(barbershop)
        })

        markersRef.current.push(marker)
      })

      // Fit bounds to show all markers
      if (barbershops.length > 0) {
        const validBarbershops = barbershops.filter((b) => b.latitude && b.longitude)
        if (validBarbershops.length > 0) {
          const bounds = L.latLngBounds(validBarbershops.map((b) => [b.latitude, b.longitude]))
          map.fitBounds(bounds, { padding: [50, 50] })
        }
      }
    })
  }, [barbershops, selectedBarbershop, onSelectBarbershop, isLoaded])

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando mapa...</p>
          </div>
        </div>
      )}
    </div>
  )
}
