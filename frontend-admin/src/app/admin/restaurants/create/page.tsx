'use client'

import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { RestaurantForm, type RestaurantFormData } from '@/components/restaurants/RestaurantForm'
import { ChevronLeft, Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function CreateRestaurantPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setSelectedFiles((prev) => [...prev, ...files])

    // Create preview URLs
    files.forEach((file) => {
      const url = URL.createObjectURL(file)
      setPreviewUrls((prev) => [...prev, url])
    })

    e.target.value = ''
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    URL.revokeObjectURL(previewUrls[index])
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: RestaurantFormData) => {
      // Step 1: Create restaurant
      const res = await api.post('/admin/restaurants', data)
      const restaurantId = res.data.id

      // Step 2: Upload images if any selected
      if (selectedFiles.length > 0) {
        await Promise.all(
          selectedFiles.map((file, index) => {
            const formData = new FormData()
            formData.append('image', file)
            formData.append('is_primary', index === 0 ? '1' : '0') // First image is primary
            return api.post(`/admin/restaurants/${restaurantId}/images`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            })
          })
        )
      }

      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] })
      router.push('/admin/restaurants')
    },
  })

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/restaurants" className="text-gray-500 hover:text-gray-900">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Restaurant</h1>
      </div>

      {/* Restaurant Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <RestaurantForm
          onSubmit={mutateAsync}
          isSubmitting={isPending}
          submitLabel="Create Restaurant"
        />
      </div>

      {/* Image Upload Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Images (Optional)</h2>

        <div className="mb-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            Select Images
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <p className="text-xs text-gray-500 mt-2">
            You can select multiple images. The first image will be set as primary.
          </p>
        </div>

        {/* Image Previews */}
        {selectedFiles.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
                <Image
                  src={previewUrls[index]}
                  alt={file.name}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
                {index === 0 && (
                  <div className="absolute top-1 left-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                    Primary
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  disabled={isPending}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-red-500 text-white rounded transition-opacity disabled:opacity-30"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedFiles.length === 0 && (
          <p className="text-sm text-gray-400">No images selected yet.</p>
        )}
      </div>
    </div>
  )
}
