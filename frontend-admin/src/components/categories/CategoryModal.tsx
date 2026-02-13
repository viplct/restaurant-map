'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Category } from '@/types'
import { X, Loader2 } from 'lucide-react'

const schema = z.object({
  name:        z.string().min(1, 'Name is required').max(100),
  icon:        z.string().max(50).optional(),
  color:       z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color (#RRGGBB)').optional().or(z.literal('')),
  description: z.string().max(1000).optional(),
  sort_order:  z.number().int().min(0).default(0),
  is_active:   z.boolean().default(true),
})

type FormData = z.input<typeof schema>

interface Props {
  category: Category | null  // null = create mode
  onClose: () => void
}

export function CategoryModal({ category, onClose }: Props) {
  const queryClient = useQueryClient()
  const isEditing = category !== null

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:        category?.name ?? '',
      icon:        category?.icon ?? '',
      color:       category?.color ?? '#E53E3E',
      description: category?.description ?? '',
      sort_order:  category?.sort_order ?? 0,
      is_active:   category?.is_active ?? true,
    },
  })

  useEffect(() => { reset({
    name:        category?.name ?? '',
    icon:        category?.icon ?? '',
    color:       category?.color ?? '#E53E3E',
    description: category?.description ?? '',
    sort_order:  category?.sort_order ?? 0,
    is_active:   category?.is_active ?? true,
  }) }, [category, reset])

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      isEditing
        ? api.put(`/admin/categories/${category.id}`, data)
        : api.post('/admin/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories-all'] })
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Category' : 'New Category'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => mutateAsync(d))} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input {...register('name')} className="input-field" placeholder="Vietnamese" />
            {errors.name && <p className="error-msg">{errors.name.message}</p>}
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
              <input {...register('icon')} className="input-field" placeholder="🍜" />
            </div>
            <div className="w-36">
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input {...register('color')} type="color" className="input-field h-10 p-1 cursor-pointer" />
              {errors.color && <p className="error-msg">{errors.color.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea {...register('description')} rows={2} className="input-field resize-none" placeholder="Optional description…" />
          </div>

          <div className="flex gap-4 items-end">
            <div className="w-28">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort order</label>
              <input {...register('sort_order', { valueAsNumber: true })} type="number" min={0} className="input-field" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer pb-2">
              <input type="checkbox" {...register('is_active')} className="w-4 h-4 accent-orange-500" />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm rounded-lg transition-colors"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
