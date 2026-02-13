'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import api from '@/lib/api'
import type { Category, Restaurant } from '@/types'
import { Loader2 } from 'lucide-react'

// Lazy-load map picker to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import('./MapPicker'), { ssr: false, loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse" /> })

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
const DAY_LABELS: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }

const schema = z.object({
  category_id:   z.number({ required_error: 'Category is required', invalid_type_error: 'Category is required' }),
  name:          z.string().min(1, 'Name is required').max(200),
  description:   z.string().max(5000).optional(),
  address:       z.string().min(1, 'Address is required').max(500),
  city:          z.string().max(100).optional(),
  district:      z.string().max(100).optional(),
  latitude:      z.number({ required_error: 'Pick location on map', invalid_type_error: 'Pick location on map' }).min(-90).max(90),
  longitude:     z.number({ required_error: 'Pick location on map', invalid_type_error: 'Pick location on map' }).min(-180).max(180),
  phone:         z.string().max(30).optional(),
  website:       z.string().url().optional().or(z.literal('')),
  email:         z.string().email().optional().or(z.literal('')),
  price_range:   z.number().int().min(1).max(4).default(2),
  capacity:      z.number().int().min(1).max(10000).optional().or(z.literal(undefined)),
  tables:        z.number().int().min(1).max(1000).optional().or(z.literal(undefined)),
  is_active:     z.boolean().default(true),
  is_featured:   z.boolean().default(false),
  opening_hours: z.record(z.string(), z.string().optional()).optional(),
})

export type RestaurantFormData = z.input<typeof schema>

interface Props {
  defaultValues?: Partial<RestaurantFormData>
  onSubmit: (data: RestaurantFormData) => Promise<unknown>
  isSubmitting: boolean
  submitLabel: string
}

export function RestaurantForm({ defaultValues, onSubmit, isSubmitting, submitLabel }: Props) {
  const { data: categories } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => {
      const res = await api.get<{ data: Category[] }>('/admin/categories?per_page=100')
      return res.data.data
    },
  })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RestaurantFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      price_range: 2,
      is_active: true,
      is_featured: false,
      ...defaultValues,
    },
  })

  const lat = watch('latitude')
  const lng = watch('longitude')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input {...register('name')} className="input-field" placeholder="Restaurant name" />
          {errors.name && <p className="error-msg">{errors.name.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            {...register('category_id', { valueAsNumber: true })}
            className="input-field"
          >
            <option value="">Select category…</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
          {errors.category_id && <p className="error-msg">{errors.category_id.message}</p>}
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
          <select {...register('price_range', { valueAsNumber: true })} className="input-field">
            <option value={1}>$ — Budget</option>
            <option value={2}>$$ — Mid-range</option>
            <option value={3}>$$$ — Fine dining</option>
            <option value={4}>$$$$ — Luxury</option>
          </select>
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (people)</label>
          <input
            type="number"
            {...register('capacity', { valueAsNumber: true })}
            className="input-field"
            placeholder="e.g. 100"
            min="1"
            max="10000"
          />
          {errors.capacity && <p className="error-msg">{errors.capacity.message}</p>}
        </div>

        {/* Tables */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tables</label>
          <input
            type="number"
            {...register('tables', { valueAsNumber: true })}
            className="input-field"
            placeholder="e.g. 20"
            min="1"
            max="1000"
          />
          {errors.tables && <p className="error-msg">{errors.tables.message}</p>}
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
          <input {...register('address')} className="input-field" placeholder="Full address" />
          {errors.address && <p className="error-msg">{errors.address.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input {...register('city')} className="input-field" placeholder="City" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
          <input {...register('district')} className="input-field" placeholder="District" />
        </div>

        {/* Phone / Website / Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input {...register('phone')} className="input-field" placeholder="+84 xxx xxx xxxx" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input {...register('website')} className="input-field" placeholder="https://…" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input {...register('email')} className="input-field" placeholder="contact@restaurant.com" />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea {...register('description')} rows={3} className="input-field resize-none" placeholder="Brief description…" />
      </div>

      {/* Map picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Location * — Click map to place marker</label>
        <MapPicker
          lat={lat}
          lng={lng}
          onChange={(newLat, newLng) => {
            setValue('latitude', newLat, { shouldValidate: true })
            setValue('longitude', newLng, { shouldValidate: true })
          }}
        />
        <div className="mt-1.5 flex gap-4 text-xs text-gray-500">
          <span>Lat: {lat?.toFixed(6) ?? '—'}</span>
          <span>Lng: {lng?.toFixed(6) ?? '—'}</span>
        </div>
        {errors.latitude && <p className="error-msg">{errors.latitude.message}</p>}
      </div>

      {/* Opening hours */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Opening Hours</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DAYS.map((day) => (
            <div key={day}>
              <label className="block text-xs text-gray-500 mb-1">{DAY_LABELS[day]}</label>
              <input
                {...register(`opening_hours.${day}`)}
                className="input-field text-xs"
                placeholder="08:00-22:00"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register('is_active')} className="w-4 h-4 accent-orange-500" />
          <span className="text-sm text-gray-700">Active</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" {...register('is_featured')} className="w-4 h-4 accent-orange-500" />
          <span className="text-sm text-gray-700">Featured</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {submitLabel}
      </button>
    </form>
  )
}
