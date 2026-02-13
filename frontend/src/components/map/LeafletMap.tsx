'use client'

import { useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents, Marker, Tooltip } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '@/lib/api'
import type { RestaurantMarker } from '@/types'

// ── Marker icon factory (colored by category) ────────────────────────────────
function createIcon(color: string, isFeatured: boolean) {
  const size = isFeatured ? 36 : 28
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      ${isFeatured ? '<circle cx="12" cy="9" r="2.5" fill="white"/>' : ''}
    </svg>`

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })
}

// ── Bounds watcher — fetches markers when map viewport changes ────────────────
interface BoundsWatcherProps {
  selectedCategoryIds: number[]
  search: string
  onMarkersChange: (markers: RestaurantMarker[]) => void
}

function BoundsWatcher({ selectedCategoryIds, search, onMarkersChange }: BoundsWatcherProps) {
  const fetchRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const fetchMarkers = useCallback(async (map: L.Map) => {
    const b = map.getBounds()
    try {
      const params: Record<string, any> = {
        sw_lat: b.getSouth(),
        sw_lng: b.getWest(),
        ne_lat: b.getNorth(),
        ne_lng: b.getEast(),
      }
      if (selectedCategoryIds.length > 0) params['category_id[]'] = selectedCategoryIds
      if (search) params.search = search

      const res = await api.get<{ data: RestaurantMarker[] }>('/restaurants/map', { params })
      onMarkersChange(res.data.data)
    } catch {
      // silently fail — map still usable
    }
  }, [selectedCategoryIds, search, onMarkersChange])

  const map = useMapEvents({
    moveend() {
      clearTimeout(fetchRef.current)
      fetchRef.current = setTimeout(() => fetchMarkers(map), 300)
    },
  })

  // Initial load + re-fetch when filters change
  useEffect(() => {
    fetchMarkers(map)
  }, [selectedCategoryIds, search, fetchMarkers, map])

  return null
}

// ── Marker layer ──────────────────────────────────────────────────────────────
interface MarkerLayerProps {
  markers: RestaurantMarker[]
  selectedSlug: string | null
  onMarkerClick: (slug: string) => void
}

function MarkerLayer({ markers, selectedSlug, onMarkerClick }: MarkerLayerProps) {
  return (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={60}
      spiderfyOnMaxZoom={true}
      showCoverageOnHover={false}
      zoomToBoundsOnClick={true}
      iconCreateFunction={(cluster: any) => {
        const count = cluster.getChildCount()
        const size = count < 10 ? 40 : count < 100 ? 50 : 60
        return L.divIcon({
          html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#FF6B35;color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:${count < 10 ? 14 : 16}px;box-shadow:0 2px 8px rgba(0,0,0,0.2)">${count}</div>`,
          className: '',
          iconSize: [size, size],
        })
      }}
    >
      {markers.map((m) => {
        const color = m.category?.color ?? '#E53E3E'
        const isSelected = m.slug === selectedSlug
        const icon = createIcon(isSelected ? '#1A202C' : color, m.is_featured)

        return (
          <Marker
            key={m.id}
            position={[m.latitude, m.longitude]}
            icon={icon}
            eventHandlers={{ click: () => onMarkerClick(m.slug) }}
          >
            <Tooltip direction="top" offset={[0, -24]}>
              {m.name}
            </Tooltip>
          </Marker>
        )
      })}
    </MarkerClusterGroup>
  )
}

// ── Stats Overlay ─────────────────────────────────────────────────────────────
interface StatsOverlayProps {
  venueCount: number
}

function StatsOverlay({ venueCount }: StatsOverlayProps) {
  return (
    <div className="absolute top-4 left-4 z-[999] bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{venueCount}</span>
          <span className="text-gray-600">Venue{venueCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
const HCM_CENTER: [number, number] = [10.7769, 106.7009]

interface Props {
  markers: RestaurantMarker[]
  onMarkersChange: (markers: RestaurantMarker[]) => void
  selectedCategoryIds: number[]
  search: string
  selectedSlug: string | null
  onMarkerClick: (slug: string) => void
}

export default function LeafletMap({
  markers, onMarkersChange, selectedCategoryIds, search, selectedSlug, onMarkerClick,
}: Props) {
  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={HCM_CENTER}
        zoom={14}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />
        <BoundsWatcher
          selectedCategoryIds={selectedCategoryIds}
          search={search}
          onMarkersChange={onMarkersChange}
        />
        <MarkerLayer
          markers={markers}
          selectedSlug={selectedSlug}
          onMarkerClick={onMarkerClick}
        />
      </MapContainer>
      <StatsOverlay venueCount={markers.length} />
    </div>
  )
}
