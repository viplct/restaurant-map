'use client'

import { useEffect, useState } from 'react'
import { Search, MapPin, X } from 'lucide-react'
import api from '@/lib/api'
import type { Category, RestaurantListItem } from '@/types'
import { cn } from '@/lib/utils'
import { RestaurantCard } from './RestaurantCard'

interface Props {
  search: string
  onSearchChange: (v: string) => void
  selectedCategoryIds: number[]
  onToggleCategory: (id: number) => void
  restaurants: RestaurantListItem[]
  onSelectRestaurant: (slug: string) => void
}

export function CardPanel({
  search,
  onSearchChange,
  selectedCategoryIds,
  onToggleCategory,
  restaurants,
  onSelectRestaurant,
}: Props) {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    api.get<{ data: Category[] }>('/categories').then((r) => setCategories(r.data.data))
  }, [])

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Restaurant Map</span>
          </div>
          <div className="text-sm text-gray-500">
            {restaurants.length} venue{restaurants.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search restaurants…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              if (selectedCategoryIds.length > 0) {
                // Clear all filters
                selectedCategoryIds.forEach((id) => onToggleCategory(id))
              }
            }}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              selectedCategoryIds.length === 0
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            All
          </button>
          {categories.map((cat) => {
            const active = selectedCategoryIds.includes(cat.id)
            return (
              <button
                key={cat.id}
                onClick={() => onToggleCategory(cat.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                  active ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
                style={active ? { backgroundColor: cat.color ?? '#E53E3E' } : undefined}
              >
                {cat.icon} {cat.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Cards grid */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {restaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm">
            <MapPin className="w-12 h-12 mb-3 opacity-30" />
            <span>No restaurants found</span>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onViewDetails={onSelectRestaurant}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
