'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import type { RestaurantDetail } from '@/types'
import { X, Phone, Globe, MapPin, Clock, Star, DollarSign, Loader2, ChevronLeft, ChevronRight, Users, UtensilsCrossed } from 'lucide-react'

const DAYS: [string, string][] = [
  ['mon', 'Monday'], ['tue', 'Tuesday'], ['wed', 'Wednesday'],
  ['thu', 'Thursday'], ['fri', 'Friday'], ['sat', 'Saturday'], ['sun', 'Sunday'],
]

const PRICE: Record<number, string> = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }

interface Props {
  slug: string
  onClose: () => void
}

export function RestaurantDetailPanel({ slug, onClose }: Props) {
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [imgIndex, setImgIndex] = useState(0)

  useEffect(() => {
    setIsLoading(true)
    setImgIndex(0)
    api.get<RestaurantDetail>(`/restaurants/${slug}`)
      .then((r) => {
        console.log('Restaurant data:', r.data)
        setRestaurant(r.data)
      })
      .catch((err) => {
        console.error('Failed to fetch restaurant:', err)
        setRestaurant(null)
      })
      .finally(() => setIsLoading(false))
  }, [slug])

  const images = restaurant?.images ?? []

  return (
    <div className="w-full h-full bg-white rounded-lg flex flex-col overflow-hidden shadow-xl border border-gray-200">
      {/* Close button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <span className="text-sm font-semibold text-gray-900">Restaurant Details</span>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
          <X className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : !restaurant ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Not found</div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Image carousel */}
          {images.length > 0 && (
            <div className="relative h-52 bg-gray-100">
              <img
                src={images[imgIndex].url}
                alt={images[imgIndex].caption ?? restaurant.name}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIndex((i) => Math.max(0, i - 1))}
                    disabled={imgIndex === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setImgIndex((i) => Math.min(images.length - 1, i + 1))}
                    disabled={imgIndex === images.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setImgIndex(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIndex ? 'bg-white' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
              {/* Category badge */}
              {restaurant.category && (
                <div
                  className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-medium"
                  style={{ backgroundColor: restaurant.category.color ?? '#E53E3E' }}
                >
                  {restaurant.category.icon} {restaurant.category.name}
                </div>
              )}
            </div>
          )}

          <div className="p-4 space-y-4">
            {/* Title */}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{restaurant.name}</h2>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <div className="flex items-center gap-1 text-sm text-orange-500 font-medium">
                  <Star className="w-3.5 h-3.5 fill-orange-500" />
                  {restaurant.rating.toFixed(1)}
                  <span className="text-gray-400 font-normal">({restaurant.rating_count} reviews)</span>
                </div>
                <span className="text-sm text-gray-500">{PRICE[restaurant.price_range]}</span>
                {restaurant.capacity && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="w-3.5 h-3.5" />
                    <span>{restaurant.capacity} people</span>
                  </div>
                )}
                {restaurant.tables && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                    <span>{restaurant.tables} tables</span>
                  </div>
                )}
                {restaurant.is_featured && (
                  <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full font-medium">Featured</span>
                )}
              </div>
            </div>

            {/* Description */}
            {restaurant.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{restaurant.description}</p>
            )}

            {/* Contact info */}
            <div className="space-y-2">
              <InfoRow icon={<MapPin className="w-4 h-4 text-orange-500" />} text={restaurant.address} />
              {restaurant.phone && (
                <InfoRow icon={<Phone className="w-4 h-4 text-orange-500" />}>
                  <a href={`tel:${restaurant.phone}`} className="text-sm text-orange-600 hover:underline">{restaurant.phone}</a>
                </InfoRow>
              )}
              {restaurant.website && (
                <InfoRow icon={<Globe className="w-4 h-4 text-orange-500" />}>
                  <a href={restaurant.website} target="_blank" rel="noreferrer" className="text-sm text-orange-600 hover:underline truncate">
                    {restaurant.website.replace(/^https?:\/\//, '')}
                  </a>
                </InfoRow>
              )}
            </div>

            {/* Opening hours */}
            {restaurant.opening_hours && Object.keys(restaurant.opening_hours).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-semibold text-gray-900">Opening Hours</span>
                </div>
                <div className="space-y-1">
                  {DAYS.map(([key, label]) =>
                    restaurant.opening_hours?.[key] ? (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600 w-24">{label}</span>
                        <span className="text-gray-900">{restaurant.opening_hours[key]}</span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon, text, children }: { icon: React.ReactNode; text?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      {text ? <span className="text-sm text-gray-700">{text}</span> : children}
    </div>
  )
}
