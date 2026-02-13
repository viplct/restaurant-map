'use client'

import { useState, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { CardPanel } from '@/components/cards/CardPanel'
import { RestaurantDetailPanel } from '@/components/detail/RestaurantDetailPanel'
import type { RestaurantMarker, RestaurantListItem } from '@/types'

// Leaflet must be loaded client-side only
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => <div className="flex-1 bg-gray-100 animate-pulse" />,
})

export function MapView() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [search, setSearch] = useState('')
  const [markers, setMarkers] = useState<RestaurantMarker[]>([])

  const handleMarkerClick = useCallback((slug: string) => {
    setSelectedSlug(slug)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setSelectedSlug(null)
  }, [])

  const toggleCategory = useCallback((id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }, [])

  // Convert markers to restaurant list items for CardPanel
  const restaurants = useMemo<RestaurantListItem[]>(
    () =>
      markers.map((m) => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        address: m.address,
        latitude: m.latitude,
        longitude: m.longitude,
        price_range: m.price_range,
        price_range_label: '', // Not needed for cards
        capacity: m.capacity,
        tables: m.tables,
        rating: m.rating,
        rating_count: m.rating_count,
        is_featured: m.is_featured,
        category: m.category,
        images: m.images ?? [],
        primary_image: m.primary_image,
      })),
    [markers]
  )

  return (
    <div className="flex w-full h-full">
      {/* Left panel - Card grid (60%) */}
      <div className="w-[60%] flex-shrink-0">
        <CardPanel
          search={search}
          onSearchChange={setSearch}
          selectedCategoryIds={selectedCategoryIds}
          onToggleCategory={toggleCategory}
          restaurants={restaurants}
          onSelectRestaurant={setSelectedSlug}
        />
      </div>

      {/* Right panel - Map (40%) */}
      <div className="relative flex-1">
        <LeafletMap
          markers={markers}
          onMarkersChange={setMarkers}
          selectedCategoryIds={selectedCategoryIds}
          search={search}
          selectedSlug={selectedSlug}
          onMarkerClick={handleMarkerClick}
        />

        {/* Detail panel as overlay on map */}
        {selectedSlug && (
          <div className="absolute top-4 right-4 bottom-4 w-96 max-w-[90%] z-[1000]">
            <RestaurantDetailPanel slug={selectedSlug} onClose={handleCloseDetail} />
          </div>
        )}
      </div>
    </div>
  )
}
