"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/header"
import { BarbershopCard } from "@/components/map-view"
import { LeafletMap } from "@/components/leaflet-map"
import { BarbershopFilters } from "@/components/barbershop-filters"
import { getBarbershops } from "@/lib/firebase-service"
import type { Barbershop } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SlidersHorizontal } from "lucide-react"

export default function MapPage() {
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBarbershop, setSelectedBarbershop] = useState<Barbershop | null>(null)
  const [maxDistance, setMaxDistance] = useState(10)
  const [minRating, setMinRating] = useState(0)
  const [maxPrice, setMaxPrice] = useState(200)
  const [sortBy, setSortBy] = useState("rating")

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

  // Filter and sort barbershops
  const filteredBarbershops = useMemo(() => {
    const filtered = barbershops.filter((shop) => {
      const meetsRating = shop.rating >= minRating
      const meetsPrice = shop.services.some((service) => service.price <= maxPrice)
      return meetsRating && meetsPrice
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
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
  }, [barbershops, maxDistance, minRating, maxPrice, sortBy])

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
          {/* Map Section */}
          <div className="flex-1 relative">
            <LeafletMap
              barbershops={filteredBarbershops}
              onSelectBarbershop={setSelectedBarbershop}
              selectedBarbershop={selectedBarbershop}
              center={{ lat: -21.7545, lng: -43.4393 }}
              zoom={13}
            />

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
              />
            </div>

            {/* Barbershop List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {filteredBarbershops.length} {filteredBarbershops.length === 1 ? "Barbearia" : "Barbearias"}
                </h2>
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
                      selectedBarbershop?.id === barbershop.id ? "ring-2 ring-primary rounded-lg" : ""
                    }`}
                  >
                    <BarbershopCard barbershop={barbershop} />
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
