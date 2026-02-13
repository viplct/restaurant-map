'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import type { Restaurant } from '@/types'
import { RestaurantForm, type RestaurantFormData } from '@/components/restaurants/RestaurantForm'
import { ImageManager } from '@/components/restaurants/ImageManager'
import { ChevronLeft } from 'lucide-react'

export default function EditRestaurantPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['admin-restaurant', id],
    queryFn: async () => {
      const res = await api.get<Restaurant>(`/admin/restaurants/${id}`)
      return res.data
    },
  })

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: RestaurantFormData) => api.put(`/admin/restaurants/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] })
      queryClient.invalidateQueries({ queryKey: ['admin-restaurant', id] })
      router.push('/admin/restaurants')
    },
  })

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-200 rounded-xl" />

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/restaurants" className="text-gray-500 hover:text-gray-900">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit: {restaurant?.name}</h1>
      </div>

      {/* Restaurant form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        {restaurant && (
          <RestaurantForm
            defaultValues={{
              category_id:   restaurant.category?.id,
              name:          restaurant.name,
              description:   restaurant.description ?? undefined,
              address:       restaurant.address,
              city:          restaurant.city ?? undefined,
              district:      restaurant.district ?? undefined,
              latitude:      restaurant.latitude,
              longitude:     restaurant.longitude,
              phone:         restaurant.phone ?? undefined,
              website:       restaurant.website ?? undefined,
              email:         restaurant.email ?? undefined,
              opening_hours: restaurant.opening_hours ?? undefined,
              price_range:   restaurant.price_range,
              capacity:      restaurant.capacity ?? undefined,
              tables:        restaurant.tables ?? undefined,
              is_active:     restaurant.is_active,
              is_featured:   restaurant.is_featured,
            }}
            onSubmit={mutateAsync}
            isSubmitting={isPending}
            submitLabel="Save Changes"
          />
        )}
      </div>

      {/* Image manager */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
        <ImageManager restaurantId={Number(id)} images={restaurant?.images ?? []} />
      </div>
    </div>
  )
}
