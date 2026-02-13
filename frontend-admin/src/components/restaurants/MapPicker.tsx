'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default Leaflet icon missing in webpack builds
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface Props {
  lat?: number
  lng?: number
  onChange: (lat: number, lng: number) => void
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

const HCM_CENTER: [number, number] = [10.7769, 106.7009]

export default function MapPicker({ lat, lng, onChange }: Props) {
  const hasPosition = lat !== undefined && lng !== undefined

  return (
    <MapContainer
      center={hasPosition ? [lat!, lng!] : HCM_CENTER}
      zoom={13}
      className="h-64 w-full rounded-lg cursor-crosshair"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
      />
      <ClickHandler onChange={onChange} />
      {hasPosition && <Marker position={[lat!, lng!]} />}
    </MapContainer>
  )
}
