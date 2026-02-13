'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, UtensilsCrossed, Tag, LogOut, MapPin } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/admin/dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/restaurants', label: 'Restaurants',  icon: UtensilsCrossed },
  { href: '/admin/categories',  label: 'Categories',   icon: Tag },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside className="w-60 flex-shrink-0 bg-gray-900 text-white flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
          <MapPin className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-sm">Restaurant Map</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-gray-800 p-4">
        <div className="text-xs text-gray-400 mb-1">{user?.name}</div>
        <div className="text-xs text-gray-600 truncate mb-3">{user?.email}</div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
