'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import api from '@/lib/api'
import type { Restaurant, PaginatedResponse } from '@/types'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Plus, Pencil, Trash2, Search, Star } from 'lucide-react'

const PRICE_LABEL: Record<number, string> = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }

export default function RestaurantsPage() {
  const queryClient = useQueryClient()
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-restaurants', page, search],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Restaurant>>('/admin/restaurants', {
        params: { page, per_page: 15, search: search || undefined },
      })
      return res.data
    },
  })

  const { mutate: deleteRestaurant, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/restaurants/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] })
      setDeleteId(null)
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Restaurants</h1>
        <Link
          href="/admin/restaurants/create"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Restaurant
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4 w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search restaurants…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Address</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Rating</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                    ))}
                  </tr>
                ))
              : data?.data.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px] truncate">
                      <div className="flex items-center gap-1.5">
                        {r.is_featured && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                        {r.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{r.address}</td>
                    <td className="px-4 py-3 text-gray-600">{PRICE_LABEL[r.price_range]}</td>
                    <td className="px-4 py-3 text-gray-600">⭐ {r.rating.toFixed(1)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {r.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/admin/restaurants/${r.id}/edit`}
                          className="p-1.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(r.id)}
                          className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {data?.meta && (
          <Pagination meta={data.meta} onPageChange={setPage} />
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Restaurant"
        message="This will permanently remove the restaurant and all its images. Continue?"
        isLoading={isDeleting}
        onConfirm={() => deleteId && deleteRestaurant(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
