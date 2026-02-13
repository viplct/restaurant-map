'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Category, PaginatedResponse } from '@/types'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CategoryModal } from '@/components/categories/CategoryModal'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const [page, setPage]       = useState(1)
  const [editItem, setEditItem]   = useState<Category | null>(null)
  const [isCreating, setCreating] = useState(false)
  const [deleteId, setDeleteId]   = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories', page],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Category>>('/admin/categories', {
        params: { page, per_page: 15 },
      })
      return res.data
    },
  })

  const { mutate: deleteCategory, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      setDeleteId(null)
    },
  })

  const closeModal = () => { setEditItem(null); setCreating(false) }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Color</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Restaurants</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Order</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>)}
                  </tr>
                ))
              : data?.data.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-medium text-gray-900">
                        <span>{cat.icon}</span>
                        {cat.name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: cat.color ?? '#ccc' }} />
                        <span className="text-gray-500 text-xs">{cat.color ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{cat.restaurants_count ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{cat.sort_order}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => setEditItem(cat)} className="p-1.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(cat.id)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
      </div>

      {(isCreating || editItem) && (
        <CategoryModal category={editItem} onClose={closeModal} />
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Category"
        message="You can only delete categories with no restaurants assigned."
        isLoading={isDeleting}
        onConfirm={() => deleteId && deleteCategory(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
