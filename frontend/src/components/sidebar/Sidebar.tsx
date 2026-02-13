'use client'

import { useEffect, useState } from 'react'
import { Search, MapPin, X } from 'lucide-react'
import api from '@/lib/api'
import type { Category, RestaurantMarker } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  search: string
  onSearchChange: (v: string) => void
  selectedCategoryIds: number[]
  onToggleCategory: (id: number) => void
  markers: RestaurantMarker[]
  selectedSlug: string | null
  onSelectRestaurant: (slug: string) => void
}

const PRICE: Record<number, string> = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }

export function Sidebar({
  search, onSearchChange, selectedCategoryIds, onToggleCategory, markers, selectedSlug, onSelectRestaurant,
}: Props) {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    api.get<{ data: Category[] }>('/categories').then((r) => setCategories(r.data.data))
  }, [])

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col bg-white border-r border-gray-200 h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-gray-900">Restaurant Map</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search restaurants…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-9 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
          />
          {search && (
            <button onClick={() => onSearchChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category filters */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => selectedCategoryIds.length > 0 && onToggleCategory(-1)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
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
                  'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors',
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

      {/* Restaurant list */}
      <div className="flex-1 overflow-y-auto">
        {markers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm">
            <MapPin className="w-8 h-8 mb-2 opacity-30" />
            No restaurants found
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {markers.map((r) => (
              <button
                key={r.id}
                onClick={() => onSelectRestaurant(r.slug)}
                className={cn(
                  'w-full text-left px-4 py-3 flex gap-3 hover:bg-orange-50 transition-colors',
                  selectedSlug === r.slug && 'bg-orange-50 border-l-2 border-orange-500'
                )}
              >
                {/* Thumbnail */}
                <div
                  className="w-14 h-14 rounded-lg flex-shrink-0 bg-gray-100 overflow-hidden"
                  style={{ borderLeft: `3px solid ${r.category?.color ?? '#E53E3E'}` }}
                >
                  {r.primary_image ? (
                    <img src={r.primary_image.url} alt={r.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      {r.category?.icon ?? '🍽️'}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">{r.name}</div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">{r.address}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-orange-500">⭐ {r.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">{PRICE[r.price_range]}</span>
                    {r.is_featured && <span className="text-xs bg-yellow-100 text-yellow-600 px-1.5 py-0.5 rounded-full">Featured</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400 text-center">
        {markers.length} restaurant{markers.length !== 1 ? 's' : ''} in view
      </div>
    </aside>
  )
}
