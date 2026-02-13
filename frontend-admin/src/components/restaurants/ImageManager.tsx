'use client'

import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { RestaurantImage } from '@/types'
import { Trash2, Star, Upload, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface Props {
  restaurantId: number
  images: RestaurantImage[]
}

export function ImageManager({ restaurantId, images }: Props) {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPrimary, setIsPrimary] = useState(false)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-restaurant', String(restaurantId)] })
  }

  const { mutate: upload, isPending: isUploading } = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append('image', file)
      form.append('is_primary', isPrimary ? '1' : '0')
      return api.post(`/admin/restaurants/${restaurantId}/images`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: invalidate,
  })

  const { mutate: deleteImage, isPending: isDeleting } = useMutation({
    mutationFn: (imageId: number) => api.delete(`/admin/restaurants/${restaurantId}/images/${imageId}`),
    onSuccess: invalidate,
  })

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
    e.target.value = ''
  }

  return (
    <div>
      {/* Upload button */}
      <div className="flex items-center gap-4 mb-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Upload Image
        </button>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            className="accent-orange-500"
          />
          Set as primary
        </label>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      {/* Image grid */}
      {images.length === 0 ? (
        <p className="text-sm text-gray-400">No images uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
              <Image
                src={img.url}
                alt={img.caption ?? 'Restaurant image'}
                fill
                className="object-cover"
                sizes="200px"
              />
              {img.is_primary && (
                <div className="absolute top-1 left-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Star className="w-2.5 h-2.5" /> Primary
                </div>
              )}
              <button
                type="button"
                onClick={() => deleteImage(img.id)}
                disabled={isDeleting}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-red-500 text-white rounded transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
