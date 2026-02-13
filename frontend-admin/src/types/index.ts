export interface Category {
  id: number
  name: string
  slug: string
  icon: string | null
  color: string | null
  description: string | null
  sort_order: number
  is_active: boolean
  restaurants_count?: number
  created_at?: string
  updated_at?: string
}

export interface RestaurantImage {
  id: number
  url: string
  caption: string | null
  is_primary: boolean
  sort_order: number
}

export interface Restaurant {
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
  is_active: boolean
  category?: Category
  images?: RestaurantImage[]
  primary_image?: RestaurantImage | null
  created_at?: string
  updated_at?: string
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}

export interface ApiResponse<T> {
  data: T
}

export interface AuthUser {
  id: number
  name: string
  email: string
}

export interface LoginResponse {
  token: string
  token_type: string
  user: AuthUser
}

export interface DashboardStats {
  total_restaurants: number
  active_restaurants: number
  featured_restaurants: number
  total_categories: number
  total_images: number
}
