'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { DashboardStats } from '@/types'
import { UtensilsCrossed, Tag, Star, ImageIcon, Zap } from 'lucide-react'

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number; icon: React.ElementType; color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get<{ stats: DashboardStats }>('/admin/dashboard')
      return res.data
    },
  })

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
    )
  }

  const stats = data?.stats

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Restaurants"    value={stats?.total_restaurants ?? 0}    icon={UtensilsCrossed} color="bg-orange-500" />
        <StatCard label="Active Restaurants"   value={stats?.active_restaurants ?? 0}   icon={Zap}             color="bg-green-500"  />
        <StatCard label="Featured"             value={stats?.featured_restaurants ?? 0} icon={Star}            color="bg-yellow-500" />
        <StatCard label="Categories"           value={stats?.total_categories ?? 0}     icon={Tag}             color="bg-blue-500"   />
        <StatCard label="Images"               value={stats?.total_images ?? 0}         icon={ImageIcon}       color="bg-purple-500" />
      </div>
    </div>
  )
}
