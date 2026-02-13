export interface Category {
  id: number
  name: string
  slug: string
  icon: string | null
  color: string | null
}

export interface RestaurantImage {
  id: number
  url: string
  caption: string | null
  is_primary: boolean
}

export interface RestaurantMarker {
  id: number
  name: string
  slug: string
  address: string
  latitude: number
  longitude: number
  price_range: number
  capacity: number | null
  tables: number | null
  rating: number
  rating_count: number
  is_featured: boolean
  category: Category | null
  images?: RestaurantImage[]
  primary_image: { url: string } | null
}

export interface RestaurantDetail {
  id: number
  name: string
  slug: string
  description: string | null
  address: string
  city: string | null
  district: string | null
  latitude: number
  longitude: number
  phone: string | null
  website: string | null
  email: string | null
  opening_hours: Record<string, string> | null
  price_range: number
  price_range_label: string
  capacity: number | null
  tables: number | null
  rating: number
  rating_count: number
  is_featured: boolean
  category: Category | null
  images: RestaurantImage[]
}

export interface RestaurantListItem {
  id: number
  name: string
  slug: string
  address: string
  latitude: number
  longitude: number
  price_range: number
  price_range_label: string
  capacity: number | null
  tables: number | null
  rating: number
  rating_count: number
  is_featured: boolean
  category: Category | null
  images: RestaurantImage[]
  primary_image: { url: string } | null
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: { current_page: number; last_page: number; per_page: number; total: number }
}
