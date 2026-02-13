'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginationMeta } from '@/types'

interface Props {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}

export function Pagination({ meta, onPageChange }: Props) {
  const { current_page, last_page, from, to, total } = meta

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 text-sm text-gray-600">
      <span>Showing {from}–{to} of {total}</span>
      <div className="flex items-center gap-1">
        <button
          disabled={current_page <= 1}
          onClick={() => onPageChange(current_page - 1)}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-3">{current_page} / {last_page}</span>
        <button
          disabled={current_page >= last_page}
          onClick={() => onPageChange(current_page + 1)}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
