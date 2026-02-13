'use client'

import { Heart, Users, UtensilsCrossed } from 'lucide-react'
import { useState } from 'react'
import type { RestaurantListItem } from '@/types'
import { cn } from '@/lib/utils'
import { ImageSlider } from './ImageSlider'

interface Props {
  restaurant: RestaurantListItem
  onViewDetails: (slug: string) => void
}

const PRICE: Record<number, string> = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }

export function RestaurantCard({ restaurant, onViewDetails }: Props) {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image Slider */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <ImageSlider
          images={restaurant.images}
          altText={restaurant.name}
          fallbackIcon={restaurant.category?.icon ?? '🍽️'}
        />

        {/* Featured badge */}
        {restaurant.is_featured && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            FEATURED
          </div>
        )}

        {/* Heart button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsFavorite(!isFavorite)
          }}
          className={cn(
            'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
            isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-gray-600 hover:bg-white'
          )}
        >
          <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">
          {restaurant.name}
        </h3>

        {/* Category & Location */}
        <div className="flex items-center gap-1.5 mb-3">
          {restaurant.category && (
            <>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: restaurant.category.color ?? '#E53E3E' }}
              >
                {restaurant.category.name}
              </span>
              <span className="text-gray-400 text-xs">•</span>
            </>
          )}
          <span className="text-gray-500 text-xs truncate">{restaurant.address}</span>
        </div>

        {/* Rating & Price */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1">
            <span className="text-orange-500">⭐</span>
            <span className="text-sm font-medium text-gray-900">
              {restaurant.rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">
              ({restaurant.rating_count})
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {PRICE[restaurant.price_range]}
          </span>
        </div>

        {/* Capacity & Tables */}
        {(restaurant.capacity || restaurant.tables) && (
          <div className="flex items-center gap-3 mb-4">
            {restaurant.capacity && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Users className="w-3.5 h-3.5" />
                <span>{restaurant.capacity}</span>
              </div>
            )}
            {restaurant.tables && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>{restaurant.tables}</span>
              </div>
            )}
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={() => onViewDetails(restaurant.slug)}
          className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  )
}
