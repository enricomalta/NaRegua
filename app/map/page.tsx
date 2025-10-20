"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Header } from "@/components/header"
import { BarbershopCard } from "@/components/map-view"
import { LeafletMap } from "@/components/leaflet-map"
import { BarbershopFilters } from "@/components/barbershop-filters"
import { getBarbershops } from "@/lib/firebase-service"
import type { Barbershop } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SlidersHorizontal } from "lucide-react"
import { calculateDistanceInKm } from "@/lib/utils"

type BarbershopWithDistance = Barbershop & {
  distanceFromUser?: number
}

type LocationStatus = "idle" | "loading" | "granted" | "denied" | "unsupported"

const DEFAULT_CENTER = { lat: -21.7545, lng: -43.4393 }

export default function MapPage() {
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBarbershopId, setSelectedBarbershopId] = useState<string | null>(null)
  const [maxDistance, setMaxDistance] = useState(10)
  const [minRating, setMinRating] = useState(0)
  const [maxPrice, setMaxPrice] = useState(200)
  const [sortBy, setSortBy] = useState("rating")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle")
  const [locationError, setLocationError] = useState<string | null>(null)

  const requestUserLocation = useCallback(() => {
    if (typeof window === "undefined") {
      return
    }

    if (!("geolocation" in navigator)) {
      setLocationStatus("unsupported")
      setLocationError("Seu navegador não suporta geolocalização.")
      return
    }

    setLocationStatus("loading")
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLocationStatus("granted")
        setLocationError(null)
      },
      (error) => {
        console.error("Erro ao obter localização do usuário:", error)
        setUserLocation(null)
        setLocationStatus("denied")

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Permissão de localização negada. Ajuste nas configurações do navegador para permitir.")
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError("Não foi possível determinar sua localização. Tente novamente.")
            break
          case error.TIMEOUT:
            setLocationError("Tempo excedido ao obter localização. Tente novamente.")
            break
          default:
            setLocationError("Ocorreu um erro ao obter sua localização.")
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    )
  }, [])

  // Load barbershops from Firebase
  useEffect(() => {
    const loadBarbershops = async () => {
      try {
        const data = await getBarbershops()
        setBarbershops(data)
      } catch (error) {
        console.error("Erro ao carregar barbearias:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBarbershops()
  }, [])

  useEffect(() => {
    requestUserLocation()
  }, [requestUserLocation])

  // Filter and sort barbershops
  const filteredBarbershops = useMemo(() => {
    const enriched: BarbershopWithDistance[] = barbershops.map((shop) => {
      let distanceFromUser: number | undefined

      if (
        userLocation &&
        typeof shop.latitude === "number" &&
        typeof shop.longitude === "number"
      ) {
        distanceFromUser = calculateDistanceInKm(
          userLocation.lat,
          userLocation.lng,
          shop.latitude,
          shop.longitude,
        )
      }

      return {
        ...shop,
        distanceFromUser,
      }
    })

    const filtered = enriched.filter((shop) => {
      const meetsRating = shop.rating >= minRating
      const meetsPrice = shop.services.some((service) => service.price <= maxPrice)
      const meetsDistance = !userLocation
        ? true
        : shop.distanceFromUser !== undefined && shop.distanceFromUser <= maxDistance

      return meetsRating && meetsPrice && meetsDistance
    })

    const effectiveSort = sortBy === "distance" && !userLocation ? "rating" : sortBy

    filtered.sort((a, b) => {
      switch (effectiveSort) {
        case "distance": {
          if (a.distanceFromUser === undefined && b.distanceFromUser === undefined) {
            return 0
          }

          if (a.distanceFromUser === undefined) {
            return 1
          }

          if (b.distanceFromUser === undefined) {
            return -1
          }

          return a.distanceFromUser - b.distanceFromUser
        }
        case "rating":
          return b.rating - a.rating
        case "price-low":
          return Math.min(...a.services.map((s) => s.price)) - Math.min(...b.services.map((s) => s.price))
        case "price-high":
          return Math.max(...b.services.map((s) => s.price)) - Math.max(...a.services.map((s) => s.price))
        default:
          return 0
      }
    })

    return filtered
  }, [barbershops, userLocation, maxDistance, minRating, maxPrice, sortBy])

  const selectedBarbershop = useMemo(() => {
    if (!selectedBarbershopId) {
      return null
    }

    return filteredBarbershops.find((shop) => shop.id === selectedBarbershopId) ?? null
  }, [filteredBarbershops, selectedBarbershopId])

  useEffect(() => {
    if (!selectedBarbershopId) {
      return
    }

    const exists = filteredBarbershops.some((shop) => shop.id === selectedBarbershopId)
    if (!exists) {
      setSelectedBarbershopId(null)
    }
  }, [filteredBarbershops, selectedBarbershopId])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando barbearias...</p>
        </main>
      </div>
    )
  }

  const distanceFilterAvailable = userLocation !== null && locationStatus === "granted"

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
          {/* Map Section */}
          <div className="flex-1 relative">
            <LeafletMap
              barbershops={filteredBarbershops}
              onSelectBarbershop={(shop) => setSelectedBarbershopId(shop?.id ?? null)}
              selectedBarbershop={selectedBarbershop}
              center={userLocation ?? DEFAULT_CENTER}
              zoom={13}
              userLocation={userLocation ?? undefined}
            />

            {!distanceFilterAvailable && locationStatus !== "unsupported" && (
              <div className="absolute bottom-4 left-4 z-[1000] space-y-2 rounded-md border border-border/60 bg-background/90 p-4 shadow-lg backdrop-blur">
                <p className="text-xs text-muted-foreground">
                  {locationStatus === "loading"
                    ? "Obtendo sua localização..."
                    : locationStatus === "denied"
                      ? "Permita acesso à sua localização para ver barbearias próximas."
                      : "Habilite a localização para ordenar por distância."}
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 px-4 text-xs"
                  onClick={requestUserLocation}
                  disabled={locationStatus === "loading"}
                >
                  {locationStatus === "denied" ? "Tentar novamente" : locationStatus === "loading" ? "Buscando..." : "Permitir localização"}
                </Button>
                {locationError && locationStatus !== "loading" && (
                  <p className="text-xs text-destructive">{locationError}</p>
                )}
              </div>
            )}

            {locationStatus === "unsupported" && (
              <div className="absolute bottom-4 left-4 z-[1000] rounded-md border border-border/60 bg-background/90 p-4 text-xs text-muted-foreground shadow-lg backdrop-blur">
                Seu navegador não suporta geolocalização.
              </div>
            )}

            {/* Mobile Filter Button */}
            <div className="absolute top-4 right-4 lg:hidden z-[1000]">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="icon" className="shadow-lg">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <BarbershopFilters
                      maxDistance={maxDistance}
                      onMaxDistanceChange={setMaxDistance}
                      minRating={minRating}
                      onMinRatingChange={setMinRating}
                      maxPrice={maxPrice}
                      onMaxPriceChange={setMaxPrice}
                      sortBy={sortBy}
                      onSortByChange={setSortBy}
                      distanceAvailable={distanceFilterAvailable}
                      locationStatus={locationStatus}
                      onRequestLocation={requestUserLocation}
                      locationError={locationError}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-border/40 bg-background overflow-hidden flex flex-col">
            {/* Desktop Filters */}
            <div className="hidden lg:block p-4 border-b border-border/40">
              <BarbershopFilters
                maxDistance={maxDistance}
                onMaxDistanceChange={setMaxDistance}
                minRating={minRating}
                onMinRatingChange={setMinRating}
                maxPrice={maxPrice}
                onMaxPriceChange={setMaxPrice}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                distanceAvailable={distanceFilterAvailable}
                locationStatus={locationStatus}
                onRequestLocation={requestUserLocation}
                locationError={locationError}
              />
            </div>

            {/* Barbershop List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {filteredBarbershops.length} {filteredBarbershops.length === 1 ? "Barbearia" : "Barbearias"}
                </h2>
                {distanceFilterAvailable && (
                  <span className="text-xs text-muted-foreground">
                    Até {maxDistance} km de você
                  </span>
                )}
              </div>

              {filteredBarbershops.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhuma barbearia encontrada com esses filtros.</p>
                </div>
              ) : (
                filteredBarbershops.map((barbershop) => (
                  <div
                    key={barbershop.id}
                    className={`transition-all ${
                      selectedBarbershopId === barbershop.id ? "ring-2 ring-primary rounded-lg" : ""
                    }`}
                    onMouseEnter={() => setSelectedBarbershopId(barbershop.id)}
                    onFocus={() => setSelectedBarbershopId(barbershop.id)}
                    tabIndex={0}
                  >
                    <BarbershopCard barbershop={barbershop} distanceKm={barbershop.distanceFromUser} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
